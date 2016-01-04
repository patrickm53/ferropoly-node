/**
 * A Team is a group op players in ferropoly
 *
 * Created by kc on 22.03.15.
 */
'use strict';

var mongoose = require('mongoose');
var uuid     = require('node-uuid');
var logger   = require('../lib/logger').getLogger('teamModel');

/**
 * The mongoose schema for a property
 */
var teamSchema = mongoose.Schema({
  _id   : String,
  gameId: String, // Gameplay this team plays with
  uuid  : {type: String, index: {unique: true}},     // UUID of this team (index)
  data  : {
    name        : String, // Name of the team
    organization: String, // Organization the team belongs to
    teamLeader  : {
      name : String,
      email: String,
      phone: String
    },
    remarks     : String
  }
}, {_id: false});

/**
 * The Property model
 */
var Team = mongoose.model('Team', teamSchema);

/**
 * Create a new team
 * @param newTeam
 * @param gameId
 * @param callback
 */
var createTeam = function (newTeam, gameId, callback) {
  var team    = new Team();
  team.uuid   = uuid.v4();
  team.gameId = gameId;
  team.data   = newTeam.data;
  team._id    = gameId + '-' + team.uuid;
  team.save(function (err, savedTeam) {
    callback(err, savedTeam);
  })
};

/**
 * Update a Team
 * @param team
 * @param callback
 */
var updateTeam = function (team, callback) {
  Team.find({uuid: team.uuid}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (!docs || docs.length === 0) {
      if (!team.gameId) {
        return callback(new Error('no game id'));
      }
      return createTeam(team, team.gameId, function (err, newTeam) {
        if (err) {
          return callback(new Error('can not create new team: ' + err.message));
        }
        return callback(null, newTeam);
      });
    }
    else {
      docs[0].data = team.data;
      docs[0].save(function (err, team) {
        callback(err, team);
      });
    }
  })
};

/**
 * Delete a team
 * @param team
 * @param callback
 */
var deleteTeam = function (teamId, callback) {
  Team.find({uuid: teamId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (!docs || docs.length !== 1) {
      return callback(new Error('not found'));
    }
    docs[0].remove(function (err) {
      return callback(err);
    })
  })
};

/**
 * Delete all teams
 * @param gameId
 * @param callback
 */
var deleteAllTeams = function (gameId, callback) {
  logger.info('Removing all teams for ' + gameId);
  Team.find({gameId: gameId}).remove().exec(function (err) {
    callback(err);
  });
};

/**
 * Get all teams for a game
 * @param gameId
 * @param callback
 * @returns {*}
 */
var getTeams = function (gameId, callback) {
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
 * Count the teams of a given game
 * @param gameId
 * @param callback
 * @returns {*}
 */
function countTeams(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Team.count({gameId: gameId}, callback);
};

/**
 * Returns the teams as object, each team accessible using team[teamId]
 * @param gameId
 * @param callback
 */
var getTeamsAsObject = function (gameId, callback) {
  getTeams(gameId, function (err, data) {
    if (err) {
      return callback(err);
    }
    // Add all teams to the result
    var teams = {};
    for (var i = 0; i < data.length; i++) {
      teams[data[i].uuid] = data[i];
    }
    callback(null, teams);
  });
};

/**
 * Returns all teams where I am assigned as team leader
 * @param email
 * @param callback
 */
function getMyTeams(email, callback) {
  Team.find({
      'data.teamLeader.email': email
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

module.exports = {
  Model           : Team,
  createTeam      : createTeam,
  updateTeam      : updateTeam,
  deleteTeam      : deleteTeam,
  deleteAllTeams  : deleteAllTeams,
  getTeams        : getTeams,
  getTeamsAsObject: getTeamsAsObject,
  countTeams      : countTeams,
  getMyTeams      : getMyTeams
};
