/**
 * A Team is a group op players in ferropoly
 *
 * Created by kc on 22.03.15.
 */

const mongoose   = require('mongoose');
const logger     = require('../lib/logger').getLogger('teamModel');
const {v4: uuid} = require('uuid');
const userModel  = require('./userModel');

/**
 * The mongoose schema for a property
 */
let teamSchema = mongoose.Schema({
  _id   : {type: String},
  gameId: String, // Gameplay this team plays with
  uuid  : {type: String, index: {unique: true}},     // UUID of this team (index)
  data  : {
    name              : {type: String, default: ''}, // Name of the team
    organization      : {type: String, default: ''}, // Organization the team belongs to
    teamLeader        : {
      name    : {type: String, default: ''},
      email   : {type: String, default: ''},
      phone   : {type: String, default: ''},
      hasLogin: {type: Boolean, default: false} // Info whether the team leader has a login or not
    },
    remarks           : {type: String, default: ''},
    confirmed         : {type: Boolean, default: true},
    onlineRegistration: {type: Boolean},
    registrationDate  : {type: Date, default: Date.now},
    changedDate       : {type: Date, default: Date.now},
    confirmationDate  : {type: Date},
    members           : {type: Array, default: []} // Array with strings (email) of all team members
  }
}, {autoIndex: true});

/**
 * The Property model
 */
let Team = mongoose.model('Team', teamSchema);

/**
 * Create a new team
 * @param newTeam
 * @param gameId
 * @param callback
 */
let createTeam = function (newTeam, gameId, callback) {
  let team    = new Team();
  team.uuid   = uuid();
  team.gameId = gameId;
  team.data   = newTeam.data;
  team._id    = gameId + '-' + team.uuid;
  team.save(function (err, savedTeam) {
    callback(err, savedTeam);
  });
};

/**
 * Update a Team
 * @param team
 * @param callback
 */
let updateTeam = function (team, callback) {
  Team.find({uuid: team.uuid}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (!docs || docs.length === 0) {
      // Team not available yet, create it
      if (!team.gameId) {
        return callback(new Error('no game id'));
      }
      return createTeam(team, team.gameId, function (err, newTeam) {
        if (err) {
          return callback(new Error('can not create new team: ' + err.message));
        }
        return callback(null, newTeam);
      });
    } else {
      if (!team.data.teamLeader.hasLogin) {
        // Check for Login
        userModel.getUserByMailAddress(team.data.teamLeader.email, (err, user) => {
          if (err) {
            // Not critical!!! ES-Lint requires this if, nothing to do.
          }
          if (user) {
            // When the teamleader has a login, set to true. This never becomes false as logins can not be deleted
            team.data.teamLeader.hasLogin = true;
          }
          docs[0].data = team.data;
          docs[0].save(function (err, team) {
            callback(err, team);
          });
        });
      } else {
        // Team leader has a login, just save
        docs[0].data = team.data;
        docs[0].save(function (err, team) {
          callback(err, team);
        });
      }
    }
  });
};

/**
 * Delete a team
 * @param teamId
 * @param callback
 */
let deleteTeam = function (teamId, callback) {
  Team.find({uuid: teamId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (!docs || docs.length !== 1) {
      return callback(new Error('not found'));
    }
    docs[0].delete(function (err) {
      return callback(err);
    });
  });
};

/**
 * Delete all teams
 * @param gameId
 * @param callback
 */
let deleteAllTeams = function (gameId, callback) {
  logger.info('Removing all teams for ' + gameId);
  Team.deleteMany({gameId: gameId}, callback);
};

/**
 * Get all teams for a game
 * @param gameId
 * @param callback
 * @returns {*}
 */
let getTeams = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  return Team.find({gameId: gameId}).lean().exec(function (err, docs) {
    if (err) {
      return callback(err);
    }
    return callback(null, docs);
  });
};

/**
 * Get a specific team
 * @param gameId
 * @param teamId
 * @param callback
 * @returns {*}
 */
let getTeam = function (gameId, teamId, callback) {
  Team.find({
      'uuid'  : teamId,
      'gameId': gameId
    },
    function (err, docs) {
      if (err) {
        return callback(err);
      }
      if (docs.length === 0) {
        return callback(null, null);
      }
      callback(null, docs[0]);
    }
  );
};

/**
 * Count the teams of a given game
 * @param gameId
 * @param callback
 * @returns {*}
 */
function countTeams(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Team.countDocuments({gameId: gameId}, callback);
}

/**
 * Returns the teams as object, each team accessible using team[teamId]
 * @param gameId
 * @param callback
 */
let getTeamsAsObject = function (gameId, callback) {
  getTeams(gameId, function (err, data) {
    if (err) {
      return callback(err);
    }
    // Add all teams to the result
    let teams = {};
    for (let i = 0; i < data.length; i++) {
      teams[data[i].uuid] = data[i];
    }
    callback(null, teams);
  });
};

/**
 * Returns all teams where I am assigned as team leader or member
 * @param email
 * @param callback
 */
function getMyTeams(email, callback) {
  Team.find({
      $or: [
        {'data.teamLeader.email': email},
        {'data.members': email}
      ]
    },
    function (err, docs) {
      if (err) {
        return callback(err);
      }
      if (docs.length === 0) {
        return callback(null, null);
      }
      callback(null, docs);
    }
  );
}

/**
 * Returns my team for a gameplay where I am assigned as team leader
 * @param gameId
 * @param email
 * @param callback
 */
function getMyTeam(gameId, email, callback) {
  Team.find({
      'data.teamLeader.email': email,
      'gameId'               : gameId
    },
    function (err, docs) {
      if (err) {
        return callback(err);
      }
      if (docs.length === 0) {
        return callback(null, null);
      }
      callback(null, docs[0]);
    }
  );
}

module.exports = {
  Model           : Team,
  createTeam      : createTeam,
  updateTeam      : updateTeam,
  deleteTeam      : deleteTeam,
  deleteAllTeams  : deleteAllTeams,
  getTeams        : getTeams,
  getTeamsAsObject: getTeamsAsObject,
  countTeams      : countTeams,
  getMyTeams      : getMyTeams,
  getMyTeam       : getMyTeam,
  getTeam         : getTeam
};
