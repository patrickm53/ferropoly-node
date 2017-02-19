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
const mongoose = require('mongoose');
const crypto   = require('crypto');
const uuid     = require('node-uuid');
const pbkdf2   = require('pbkdf2-sha256');
const logger   = require('../lib/logger').getLogger('userModel');
const _        = require('lodash');
/**
 * The mongoose schema for an user
 */
var userSchema = mongoose.Schema({
  _id         : {type: String, index: true},
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
    facebookProfileId : String,
    googleProfileId   : String,
    microsoftProfileId: String
  },
  info        : {
    registrationDate: Date,
    lastLogin       : Date,
    facebook        : Object,
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
var copyUser = function (source, target) {
  target.personalData = _.clone(source.personalData);
  target.roles        = _.clone(source.roles);
  target.info         = _.clone(source.info);
  target.login        = _.clone(source.login);
};

/**
 * Generate a NEW password hash
 * @param user
 * @param password
 */
var generatePasswordHash = function (user, password) {
  var saltHash = crypto.createHash('sha256');
  var ts       = new Date().getTime();
  var uid      = uuid.v4();
  saltHash.update(ts + user.email + uid);
  var salt = saltHash.digest('hex');

  user.login.passwordSalt = salt;
  user.login.passwordHash = createPasswordHash(salt, password);
};

/**
 * Verify the entered password for a user
 * @param user
 * @param enteredPassword
 * @returns {boolean}
 */
var verifyPassword = function (user, enteredPassword) {
  return (user.login.passwordHash === createPasswordHash(user.login.passwordSalt, enteredPassword));
};

/**
 * Create a password hash with a given salt and password
 * @param salt
 * @param password
 * @returns {*}
 */
var createPasswordHash = function (salt, password) {
  if (!_.isString(salt) || !_.isString(password)) {
    logger.error(new Error('Invalid params supplied', salt, password));
    return 'not-a-valid-hash-' + _.random(0, 100000000);
  }
  return pbkdf2(password, salt, 1, 64).toString('base64');
};

/**
 * Removes a user from the DB
 * @param emailAddress
 * @param callback
 */
var removeUser = function (emailAddress, callback) {
  User.remove({'personalData.email': emailAddress}, function (err) {
    callback(err);
  });
};

/**
 * Update a user: update if it exists, otherwise create it
 * @param user
 * @param password
 * @param callback
 */
var updateUser = function (user, password, callback) {
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
        return user.save(function (err, savedUser) {
          if (err) {
            return callback(err);
          }
          return callback(null, savedUser);
        });
      });

    }
    else {
      var editedUser = docs[0];
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
};

/**
 * Get a user by its email address
 * @param emailAddress
 * @param callback
 */
var getUserByMailAddress = function (emailAddress, callback) {
  User.find({'personalData.email': emailAddress}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }

    // Verify if this user already has an ID or not. If not, upgrade to new model
    var foundUser = docs[0];
    if (!_.isString(foundUser._id)) {
      foundUser._id = foundUser.personalData.email;
      foundUser.save(function (err) {
        if (err) {
          return callback(err);
        }
        logger.info('Updated user with email ' + foundUser.personalData.email);
        callback(null, foundUser);
      });
    } else {
      callback(null, foundUser);
    }
  });
};

/**
 * Get a user by its ID
 * @param id
 * @param callback, providing the complete user information when found
 */
var getUser = function (id, callback) {
  User.find({'_id': id}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};

/**
 * Returns a user by its facebook profile
 * @param profileId
 * @param callback
 */
var getFacebookUser = function (profileId, callback) {
  User.find({'login.facebookProfileId': profileId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};

/**
 * Returns a user by its google profile
 * @param profileId
 * @param callback
 */
var getGoogleUser = function (profileId, callback) {
  User.find({'login.googleProfileId': profileId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};

/**
 * Returns a user by its Microsoft profile
 * @param profileId
 * @param callback
 */
var getMicrosoftUser = function (profileId, callback) {
  User.find({'login.microsoftProfileId': profileId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};

/**
 * Gets all users
 * @param callback
 */
var getAllUsers = function (callback) {
  User.find({}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs);
  });
};

/**
 * Counts all users
 * @param callback
 */
var countUsers = function (callback) {
  User.count({}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb);
  });
};

/**
 * Gets a user signing in with facebook. If the user does not exist, it will be created
 * @param profile
 * @param callback
 * @returns {*}
 */
function findOrCreateFacebookUser(profile, callback) {
  logger.info('findOrCreateFacebookUser', profile);
  /** Just for documentation purposes, the object returned by facebook after logging in
   var i = {
    id         : '1071........521',
    username   : undefined,
    displayName: undefined,
    name       : {
      familyName: 'Kuster',
      givenName : 'Christian',
      middleName: undefined
    },
    gender     : 'male',
    profileUrl : undefined,
    emails     : [{value: 'fa.......@gmail.com'}],
    photos     : [{value: 'https://scontent.xx.fbcdn.net/hprofile-ash2/v/t1.0-1/c41.41.517.517/s50x50/941512_57......353_77382703_n.jpg?oh=05e73500041d5a1af44......5&oe=572....29'}],
    provider   : 'facebook'
  };
   */
  if (!_.isObject(profile) || !_.isString(profile.id)) {
    return callback(new Error('invalid facebook object supplied'));
  }

  if (profile.provider !== 'facebook') {
    logger.info('This is not a facebook account: ' + profile.provider);
    callback(new Error('not a facebook account: ' + profile.provider));
  }


  // Try to get the user
  getFacebookUser(profile.id, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      // The user is not here, try to find him with the email-address
      var emailAddress = _.isArray(profile.emails) ? profile.emails[0].value : undefined;

      function createNewFacebookUser() {
        newUser                         = new User();
        newUser._id                     = emailAddress || profile.id;
        newUser.login.facebookProfileId = profile.id;
        newUser.info.facebook           = profile;
        newUser.info.registrationDate   = new Date();
        newUser.login.verifiedEmail     = true; // Facebook does not need verification
        newUser.personalData.forename   = profile.name.givenName;
        newUser.personalData.surname    = profile.name.familyName;
        newUser.personalData.email      = emailAddress ? emailAddress : profile.id; // using facebook profile id as email alternative
        newUser.personalData.avatar     = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
        newUser.save(function (err, savedUser) {
          if (err) {
            return callback(err);
          }
          logger.info('Created facebook user', savedUser);
          // Recursive call, now we'll find this user
          return findOrCreateFacebookUser(profile, callback);
        });
      }

      if (emailAddress) {
        getUserByMailAddress(emailAddress, function (err, user) {
          if (err) {
            return callback(err);
          }
          if (user) {
            // Ok, we know this user. Update profile for facebook access
            user.info.facebook           = profile;
            user.info.registrationDate   = new Date();
            user.login.verifiedEmail     = true; // Facebook does not need verification
            user.personalData.forename   = profile.name.givenName;
            user.personalData.surname    = profile.name.familyName;
            user.login.facebookProfileId = profile.id;
            user.personalData.avatar     = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
            user.save(function (err) {
              if (err) {
                return callback(err);
              }
              logger.info('Upgraded user ' + emailAddress + ' for facebook access');
              // Recursive call, now we'll find this user
              return findOrCreateFacebookUser(profile, callback);
            });
            return;
          }

          // We do not know this user. Add him/her to the list.
          createNewFacebookUser();
        });
        return;
      }
      // No email address (somehow an annonymous facebook user). Add as new User
      return createNewFacebookUser();
    }

    // User found, update
    user.info.facebook       = profile;
    user.personalData.avatar = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
    updateUser(user, null, callback);
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
      var emailAddress = _.isArray(profile.emails) ? profile.emails[0].value : undefined;

      function saveNewGoogleUser() {
        newUser                       = new User();
        newUser._id                   = emailAddress || profile.id;
        newUser.login.googleProfileId = profile.id;
        newUser.info.google           = profile;
        newUser.info.registrationDate = new Date();
        newUser.login.verifiedEmail   = true; // Google does not need verification
        newUser.personalData.forename = profile.name.givenName;
        newUser.personalData.surname  = profile.name.familyName;
        newUser.personalData.email    = emailAddress ? emailAddress : profile.id; // using google profile id as email alternative
        newUser.personalData.avatar   = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
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
            user.login.verifiedEmail   = true; // Facebook does not need verification
            user.personalData.forename = profile.name.givenName;
            user.personalData.surname  = profile.name.familyName;
            user.login.googleProfileId = profile.id;
            user.personalData.avatar   = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
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


  if (profile.provider !== 'windowslive') {
    logger.info('This is not a windowslive account: ' + profile.provider);
    callback(new Error('not a windowslive account: ' + profile.provider));
  }

  // Try to get the user
  getMicrosoftUser(profile.id, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      // The user is not here, try to find him with the email-address
      let emailAddress = _.isArray(profile.emails) ? profile.emails[0].value : undefined;

      function saveNewMicrosoftUser() {
        newUser                          = new User();
        newUser._id                      = emailAddress || profile.id;
        newUser.login.microsoftProfileId = profile.id;
        newUser.info.microsoft           = profile;
        newUser.info.registrationDate    = new Date();
        newUser.login.verifiedEmail      = true; // Microsoft Windows Live does not need verification
        newUser.personalData.forename    = profile.name.givenName;
        newUser.personalData.surname     = profile.name.familyName;
        newUser.personalData.email       = emailAddress ? emailAddress : profile.id; // using profile id as email alternative
        newUser.personalData.avatar      = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
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
            user.login.verifiedEmail      = true; // Facebook does not need verification
            user.personalData.forename    = profile.name.givenName;
            user.personalData.surname     = profile.name.familyName;
            user.login.microsoftProfileId = profile.id;
            user.personalData.avatar      = _.isArray(profile.photos) ? profile.photos[0].value : undefined;
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
      // No email address (somehow an annonymous microsoft user). Add as new User
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
  findOrCreateFacebookUser : findOrCreateFacebookUser,
  findOrCreateGoogleUser   : findOrCreateGoogleUser,
  findOrCreateMicrosoftUser: findOrCreateMicrosoftUser
};
