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
const userSchema = mongoose.Schema({
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
async function removeUser(emailAddress, callback) {
  let res, err;
  try {
    res = await User.deleteOne({'personalData.email': emailAddress}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Update a user: update if it exists, otherwise create it
 * @param user
 * @param password
 * @param callback
 */
async function updateUser(user, password, callback) {
  try {
    let doc = await User.findOne({_id: user._id}).exec();

    if (!doc) {
      // New User OR invalid created user
      return getUserByMailAddress(user.personalData.email, async function (err, foundUser) {
        if (err) {
          return callback(err);
        }
        if (foundUser) {
          return callback(new Error('User with this email-address already exists, remove first!'));
        }
        logger.info(`New user:${user.personalData.email}`, user);
        if (!password) {
          return callback(new Error('Password missing'));
        }
        generatePasswordHash(user, password);
        user.info.registrationDate = new Date();
        user._id                   = user.personalData.email;
        accountLog.addNewUserEntry(user.personalData.email, 'Email-Adresse');
        savedUser = await user.save();
        return callback(null, savedUser);
      });

    } else {
      let editedUser = doc;
      copyUser(user, editedUser);
      // Update User
      logger.info(`Update user: ${user.personalData.email}`, user);
      if (password) {
        generatePasswordHash(editedUser, password);
      }
      let savedUser = await editedUser.save();
      return callback(null, savedUser);
    }
  } catch (ex) {
    logger.error(ex);
    callback(ex);
  }
}

/**
 * Get a user by its email address
 * @param emailAddress
 * @param callback
 */
function getUserByMailAddress(emailAddress, callback) {

  User
    .findOne({'personalData.email': emailAddress})
    .exec()
    .then(foundUser => {
      if (!foundUser) {
        return callback();
      }

      // Verify if this user already has an ID or not. If not, upgrade to new model
      if (!_.isString(foundUser._id) || foundUser._id !== foundUser.personalData.email) {
        const id      = foundUser._id;
        const newUser = new User();
        copyUser(foundUser, newUser);
        newUser._id = emailAddress;
        newUser.save()
               .then(() => {
                 User
                   .findByIdAndRemove(id)
                   .exec()
                   .then(() => {
                     logger.info(`Updated user with email ${newUser.personalData.email}`, newUser);
                     callback(null, newUser);
                   })
                   .catch(callback);
               })
               .catch(callback);
      } else {
        callback(null, foundUser);
      }
    })
    .catch(callback);
}

async function getUserByMailAddressB(emailAddress) {
  return new Promise(resolve => {
    getUserByMailAddress(emailAddress, (err, user) => {
      if (err) {
        throw new Error(err);
      }
      resolve(user);
    });
  });
}

/**
 * Get a user by its ID
 * @param id
 * @param callback , providing the complete user information when found
 */
async function getUser(id, callback) {
  let doc, err;
  try {
    doc = await User.findOne({'_id': id}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}


/**
 * Returns a user by its google profile
 * @param profileId
 * @param callback
 */
async function getGoogleUser(profileId, callback) {
  let err, doc;
  try {
    doc = await User.findOne({'login.googleProfileId': profileId}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}

/**
 * Returns a user by its microsoft profile
 * @param profileId
 * @param callback
 */
async function getMicrosoftUser(profileId, callback) {
  let err, doc;
  try {
    doc = await User.findOne({'login.microsoftProfileId': profileId}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}

/**
 * Gets all users
 * @param callback
 */
async function getAllUsers(callback) {
  let docs, err;
  try {
    docs = await User.find({}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}

/**
 * Counts all users
 * @param callback
 */
async function countUsers(callback) {
  let err, nb;
  try {
    nb = await User.countDocuments({}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, nb);
  }
}


/**
 * Find or create a user logging in with Google
 * @param profile
 * @param callback
 * @returns {*}
 */
function findOrCreateGoogleUser(profile, callback) {
  try {
    logger.info('findOrCreateGoogleUser', profile);
    if (!_.isObject(profile) || !_.isString(profile.id)) {
      return callback(new Error('invalid profile supplied'));
    }

    if (profile.provider !== 'google') {
      logger.info(`This is not a google account: ${profile.provider}`, profile);
      callback(new Error(`not a google account: ${profile.provider}`));
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

        async function saveNewGoogleUser() {
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
          let savedUser = await newUser.save();
          logger.info(`Created google user "${emailAddress}"`, savedUser);
          // Recursive call, now we'll find this user
          return findOrCreateGoogleUser(profile, callback);
        }

        if (emailAddress) {
          getUserByMailAddress(emailAddress, async function (err, user) {
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
              await user.save();
              logger.info(`Upgraded user ${emailAddress} for google access`, user);
              // Recursive call, now we'll find this user
              return findOrCreateGoogleUser(profile, callback);
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
  } catch (ex) {
    logger.error(ex);
    callback(ex);
  }
}


/**
 * Find or create a user logging in with Microsoft
 * @param profile
 * @param callback
 * @returns {*}
 */
function findOrCreateMicrosoftUser(profile, callback) {
  try {
    logger.info('findOrCreateMicrosoftUser', profile);
    if (!_.isObject(profile) || !_.isString(profile.id)) {
      return callback(new Error('invalid profile supplied'));
    }

    if (profile.provider !== 'microsoft') {
      logger.info(`This is not a microsoft account: ${profile.provider}`, profile);
      callback(new Error(`not a microsoft account: ${profile.provider}`));
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
          logger.info('unable to set Microsoft avatar', profile);
        }
        logger.info(`Microsoft login with email Address ${emailAddress}`, profile);

        async function saveNewMicrosoftUser() {
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
          let savedUser = await newUser.save();
          logger.info(`Created microsoft user ${emailAddress}`, savedUser);
          // Recursive call, now we'll find this user
          return findOrCreateMicrosoftUser(profile, callback);
        }

        if (emailAddress) {
          getUserByMailAddress(emailAddress, async function (err, user) {
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
              await user.save();
              logger.info(`Upgraded user ${emailAddress} for google access`);
              // Recursive call, now we'll find this user
              return findOrCreateMicrosoftUser(profile, callback);
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
  } catch (ex) {
    logger.error(ex);
    callback(ex);
  }
}


module.exports = {
  Model: User,

  updateUser               : updateUser,
  generatePasswordHash     : generatePasswordHash,
  verifyPassword           : verifyPassword,
  getUserByMailAddress     : getUserByMailAddress,
  getUserByMailAddressB    : getUserByMailAddressB,
  removeUser               : removeUser,
  getAllUsers              : getAllUsers,
  getUser                  : getUser,
  countUsers               : countUsers,
  findOrCreateGoogleUser   : findOrCreateGoogleUser,
  findOrCreateMicrosoftUser: findOrCreateMicrosoftUser,
};
