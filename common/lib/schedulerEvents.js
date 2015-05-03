/**
 * Scheduler Event Library: all about the scheduled events found in the DB
 *
 * Created by kc on 01.05.15.
 */
'use strict';
var gameplayModel = require('../models/gameplayModel');
var eventModel = require('../models/schedulerEventModel');
var moment = require('moment');

/**
 * Create all events for a gameplay (during finalization) and insert them in the DB
 * @param gameplay
 * @param callback
 */
function createEvents(gameplay, callback) {
  var events = [];

  // Start
  var start = new eventModel.Model();
  start.gameId = gameplay.internal.gameId;
  start.timestamp = gameplay.scheduling.gameStartTs;
  start.type = 'start';
  events.push(start);

  // Interests
  var m = moment(gameplay.scheduling.gameStartTs);
  while (m < gameplay.scheduling.gameEndTs) {
    var interest = new eventModel.Model();
    interest.gameId = gameplay.internal.gameId;
    interest.timestamp = new Date(m.toDate());
    interest.type = 'interest';
    events.push(interest);

    m.add(gameplay.gameParams.interestInterval, 'm');
  }

  // End
  var end = new eventModel.Model();
  end.gameId = gameplay.internal.gameId;
  end.timestamp = gameplay.scheduling.gameEndTs;
  end.type = 'end';
  events.push(end);

  eventModel.saveEvents(events, function (err) {
    callback(err);
  });
}

module.exports = {
  createEvents: createEvents
};
