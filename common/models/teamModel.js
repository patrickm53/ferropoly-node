/**
 * A Team is a group op players in ferropoly
 *
 * Created by kc on 22.03.15.
 */
'use strict';

var mongoose = require('mongoose');
var uuid = require('node-uuid');
/**
 * The mongoose schema for a property
 */
var teamSchema = mongoose.Schema({
  gameId: String, // Gameplay this team plays with
  uuid: {type: String, index: true},     // UUID of this team (index)
  data: {
    name: String, // Name of the team
    organization: String, // Organization the team belongs to
    teamLeader: {
      name: String,
      email: String,
      phone: String
    },
    remarks: String
  }
}, {autoIndex: false});

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
  var team = new Team();
  team.uuid = uuid.v4();
  team.gameId = gameId;
  team.data = newTeam.data;
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
      return createTeam(team, team.gameId, function(err, newTeam) {
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
  console.log('Removing all teams for ' + gameId);
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

module.exports = {
  Model: Team,
  createTeam: createTeam,
  updateTeam: updateTeam,
  deleteTeam: deleteTeam,
  deleteAllTeams: deleteAllTeams,
  getTeams: getTeams
};
