/**
 * This is a schema for a user. A 'user' is someone who uses ferropoly, either as game editor
 * or as player.
 *
 * The schema offers functionality to the DB but does almost no data validation
 *
 * !!!! THE SOURCE IS MAINTAINED IN THE FERROPOLY-EDITOR PROJECT !!!!
 *
 * 17.1.15 KC
 *
 */
const mongoose   = require('mongoose');
const crypto     = require('crypto');
const pbkdf2     = require('pbkdf2-sha256');
const logger     = require('../lib/logger').getLogger('userModel');
const _          = require('lodash');
const {v4: uuid} = require('uuid');
const accountLog = require('./accountLogModel');

/**
 * The mongoose schema for an user
 */
let userSchema = mongoose.Schema({
  _id         : {type: String},
  id          : String,
  personalData: {
    forename: String,
    surname : String,
    email   : String,
    avatar  : String
  },
  roles       : {
    admin : {type: Boolean, default: false},
    editor: {type: Boolean, default: true},
    player: {type: Boolean, default: true}
  },
  login       : {
    passwordSalt      : String,
    passwordHash      : String,
    verifiedEmail     : {type: Boolean, default: false},
    verificationText  : String,
    facebookProfileId : String, // Legacy, to be removed in 2024
    googleProfileId   : String,
    microsoftProfileId: String,
  },
  info        : {
    registrationDate: Date,
    lastLogin       : Date,
    facebook        : Object,  // Legacy, to be removed in 2024
    google          : Object,
    microsoft       : Object,
    agbAccepted     : {type: Number, default: 0}
  }
}, {autoIndex: true});


/**
 * The User model
 */
const User = mongoose.model('User', userSchema);

/**
 * Copy a user
 * @param source
 * @param target
 */
function copyUser(source, target) {
  let src             = source.toObject();
  target.personalData = _.clone(src.personalData);
  target.roles        = _.clone(src.roles);
  target.info         = _.clone(src.info);
  target.login        = _.clone(src.login);
}

/**
 * Generate a NEW password hash
 * @param user
 * @param password
 */
function generatePasswordHash(user, password) {
  let saltHash = crypto.createHash('sha256');
  let ts       = new Date().getTime();
  let uid      = uuid();
  saltHash.update(ts + user.email + uid);
  let salt = saltHash.digest('hex');

  user.login.passwordSalt = salt;
  user.login.passwordHash = createPasswordHash(salt, password);
}

/**
 * Verify the entered password for a user
 * @param user
 * @param enteredPassword
 * @returns {boolean}
 */
function verifyPassword(user, enteredPassword) {
  return (user.login.passwordHash === createPasswordHash(user.login.passwordSalt, enteredPassword));
}

/**
 * Create a password hash with a given salt and password
 * @param salt
 * @param password
 * @returns {*}
 */
function createPasswordHash(salt, password) {
  if (!_.isString(salt) || !_.isString(password)) {
    logger.error(new Error('Invalid params supplied', salt, password));
    return 'not-a-valid-hash-' + _.random(0, 100000000);
  }
  return pbkdf2(password, salt, 1, 64).toString('base64');
}

/**
 * Removes a user from the DB
 * @param emailAddress
 * @param callback
 */
function removeUser(emailAddress, callback) {
  User.delete({'personalData.email': emailAddress}, function (err) {
    callback(err);
  });
}

/**
 * Update a user: update if it exists, otherwise create it
 * @param user
 * @param password
 * @param callback
 */
function updateUser(user, password, callback) {
  User.find({_id: user._id}, function (err, docs) {
    if (err) {
      return callback(err);
    }

    if (docs.length === 0) {
      // New User OR invalid created user
      return getUserByMailAddress(user.personalData.email, function (err, foundUser) {
        if (err) {
          return callback(err);
        }
        if (foundUser) {
          return callback(new Error('User with this email-address already exists, remove first!'));
        }
        logger.info('New user:' + user.personalData.email);
        if (!password) {
          return callback(new Error('Password missing'));
        }
        generatePasswordHash(user, password);
        user.info.registrationDate = new Date();
        user._id                   = user.personalData.email;
        accountLog.addNewUserEntry(user.personalData.email, 'Email-Adresse');
        return user.save(function (err, savedUser) {
          if (err) {
            return callback(err);
          }
          return callback(null, savedUser);
        });
      });

    } else {
      let editedUser = docs[0];
      copyUser(user, editedUser);
      // Update User
      logger.info('Update user:' + user.personalData.email);
      if (password) {
        generatePasswordHash(editedUser, password);
      }
      return editedUser.save(function (err, savedUser) {
        if (err) {
          return callback(err);
        }
        return callback(null, savedUser);
      });
    }
  });
}

/**
 * Get a user by its email address
 * @param emailAddress
 * @param callback
 */
function getUserByMailAddress(emailAddress, callback) {
  User.find({'personalData.email': emailAddress}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }

    // Verify if this user already has an ID or not. If not, upgrade to new model
    let foundUser = docs[0];
    if (!_.isString(foundUser._id) || foundUser._id !== foundUser.personalData.email) {
      const id      = foundUser._id;
      const newUser = new User();
      copyUser(foundUser, newUser);
      newUser._id = emailAddress;
      newUser.save(function (err) {
        if (err) {
          return callback(err);
        }
        User.findByIdAndRemove(id, function (err) {
          logger.info('Updated user with email ' + newUser.personalData.email);
          callback(err, newUser);
        });
      });
    } else {
      callback(null, foundUser);
    }
  });
}

/**
 * Get a user by its ID
 * @param id
 * @param callback, providing the complete user information when found
 */
function getUser(id, callback) {
  User.find({'_id': id}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
}


/**
 * Returns a user by its google profile
 * @param profileId
 * @param callback
 */
function getGoogleUser(profileId, callback) {
  User.find({'login.googleProfileId': profileId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
}

/**
 * Returns a user by its microsoft profile
 * @param profileId
 * @param callback
 */
function getMicrosoftUser(profileId, callback) {
  User.find({'login.microsoftProfileId': profileId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
}

/**
 * Gets all users
 * @param callback
 */
function getAllUsers(callback) {
  User.find({}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs);
  });
}

/**
 * Counts all users
 * @param callback
 */
function countUsers(callback) {
  User.countDocuments({}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb);
  });
}


/**
 * Find or create a user logging in with Google
 * @param profile
 * @param callback
 * @returns {*}
 */
function findOrCreateGoogleUser(profile, callback) {
  logger.info('findOrCreateGoogleUser', profile);
  if (!_.isObject(profile) || !_.isString(profile.id)) {
    return callback(new Error('invalid profile supplied'));
  }


  if (profile.provider !== 'google') {
    logger.info('This is not a google account: ' + profile.provider);
    callback(new Error('not a google account: ' + profile.provider));
  }

  // Try to get the user
  getGoogleUser(profile.id, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      // The user is not here, try to find him with the email-address
      let emailAddress = '';
      if (_.isArray(profile.emails)) {
        emailAddress = profile.emails[0].value;
      } else if (_.isString(profile.email)) {
        emailAddress = profile.email;
      } else {
        emailAddress = 'error';
        logger.error('unable to set google email address', profile);
      }
      // Avatar: different options
      let avatar = '';
      if (_.isArray(profile.photos)) {
        avatar = profile.photos[0].value;
      } else if (_.isString(profile.picture)) {
        avatar = profile.picture;
      } else {
        avatar = undefined;
        logger.info('unable to set google avatar', profile);
      }
      logger.info(`Google login with email Address ${emailAddress}`, profile);

      function saveNewGoogleUser() {
        let newUser                   = new User();
        newUser._id                   = emailAddress || profile.id;
        newUser.login.googleProfileId = profile.id;
        newUser.info.google           = profile;
        newUser.info.registrationDate = new Date();
        newUser.login.verifiedEmail   = true; // Google does not need verification
        newUser.personalData.forename = profile.name.givenName;
        newUser.personalData.surname  = profile.name.familyName;
        newUser.personalData.email    = emailAddress;
        newUser.personalData.avatar   = avatar;
        accountLog.addNewUserEntry(newUser._id, 'Google');
        newUser.save(function (err, savedUser) {
          if (err) {
            return callback(err);
          }
          logger.info('Created google user', savedUser);
          // Recursive call, now we'll find this user
          return findOrCreateGoogleUser(profile, callback);
        });
      }

      if (emailAddress) {
        getUserByMailAddress(emailAddress, function (err, user) {
          if (err) {
            return callback(err);
          }
          if (user) {
            // Ok, we know this user. Update profile for google access
            user.info.google           = profile;
            user.info.registrationDate = new Date();
            user.login.verifiedEmail   = true; // Google does not need verification
            user.personalData.forename = profile.name.givenName;
            user.personalData.surname  = profile.name.familyName;
            user.login.googleProfileId = profile.id;
            user.personalData.avatar   = avatar;
            accountLog.addNewUserEntry(emailAddress, 'Google');
            user.save(function (err) {
              if (err) {
                return callback(err);
              }
              logger.info('Upgraded user ' + emailAddress + ' for google access');
              // Recursive call, now we'll find this user
              return findOrCreateGoogleUser(profile, callback);
            });
            return;
          }

          // We do not know this user. Add him/her to the list.
          saveNewGoogleUser();
        });
        return;
      }
      // No email address (somehow an annonymous google user). Add as new User
      return saveNewGoogleUser();
    }

    // User found, update
    user.info.google         = profile;
    user.personalData.avatar = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
    updateUser(user, null, callback);
  });
}


/**
 * Find or create a user logging in with Microsoft
 * @param profile
 * @param callback
 * @returns {*}
 */
function findOrCreateMicrosoftUser(profile, callback) {
  logger.info('findOrCreateMicrosoftUser', profile);
  if (!_.isObject(profile) || !_.isString(profile.id)) {
    return callback(new Error('invalid profile supplied'));
  }

  if (profile.provider !== 'microsoft') {
    logger.info('This is not a microsoft account: ' + profile.provider);
    callback(new Error('not a microsoft account: ' + profile.provider));
  }

  // Try to get the user
  getMicrosoftUser(profile.id, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      // The user is not here, try to find him with the email-address
      let emailAddress = '';
      if (_.isArray(profile.emails)) {
        emailAddress = profile.emails[0].value;
      } else if (_.isString(profile.email)) {
        emailAddress = profile.email;
      } else {
        emailAddress = 'error';
        logger.error('unable to set microsoft email address', profile);
      }
      // Avatar: different options
      let avatar = '';
      if (_.isArray(profile.photos)) {
        avatar = profile.photos[0].value;
      } else if (_.isString(profile.picture)) {
        avatar = profile.picture;
      } else {
        avatar = undefined;
        logger.info('unable to set Microsoft avatar');
      }
      logger.info(`Microsoft login with email Address ${emailAddress}`, profile);

      function saveNewMicrosoftUser() {
        let newUser                      = new User();
        newUser._id                      = emailAddress || profile.id;
        newUser.login.microsoftProfileId = profile.id;
        newUser.info.microsoft           = profile;
        newUser.info.registrationDate    = new Date();
        newUser.login.verifiedEmail      = true; // MS does not need verification
        newUser.personalData.forename    = profile.name.givenName;
        newUser.personalData.surname     = profile.name.familyName;
        newUser.personalData.email       = emailAddress;
        newUser.personalData.avatar      = avatar;
        accountLog.addNewUserEntry(newUser._id, 'Microsoft');
        newUser.save(function (err, savedUser) {
          if (err) {
            return callback(err);
          }
          logger.info('Created microsoft user', savedUser);
          // Recursive call, now we'll find this user
          return findOrCreateMicrosoftUser(profile, callback);
        });
      }

      if (emailAddress) {
        getUserByMailAddress(emailAddress, function (err, user) {
          if (err) {
            return callback(err);
          }
          if (user) {
            // Ok, we know this user. Update profile for microsoft access
            user.info.microsoft           = profile;
            user.info.registrationDate    = new Date();
            user.login.verifiedEmail      = true; // MS does not need verification
            user.personalData.forename    = profile.name.givenName;
            user.personalData.surname     = profile.name.familyName;
            user.login.microsoftProfileId = profile.id;
            user.personalData.avatar      = avatar;
            accountLog.addNewUserEntry(emailAddress, 'Microsoft');
            user.save(function (err) {
              if (err) {
                return callback(err);
              }
              logger.info('Upgraded user ' + emailAddress + ' for microsoft access');
              // Recursive call, now we'll find this user
              return findOrCreateMicrosoftUser(profile, callback);
            });
            return;
          }

          // We do not know this user. Add him/her to the list.
          saveNewMicrosoftUser();
        });
        return;
      }
      // No email address (somehow an annonymous google user). Add as new User
      return saveNewMicrosoftUser();
    }

    // User found, update
    user.info.microsoft      = profile;
    user.personalData.avatar = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
    updateUser(user, null, callback);
  });
}


module.exports = {
  Model: User,

  updateUser               : updateUser,
  generatePasswordHash     : generatePasswordHash,
  verifyPassword           : verifyPassword,
  getUserByMailAddress     : getUserByMailAddress,
  removeUser               : removeUser,
  getAllUsers              : getAllUsers,
  getUser                  : getUser,
  countUsers               : countUsers,
  findOrCreateGoogleUser   : findOrCreateGoogleUser,
  findOrCreateMicrosoftUser: findOrCreateMicrosoftUser,
};
