/**
 * Scheduler Event Library: all about the scheduled events found in the DB
 *
 * Created by kc on 01.05.15.
 */

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

  // Pre-Start
  var prestart = eventModel.createEvent(gameplay.internal.gameId,
    moment(gameplay.scheduling.gameStartTs).subtract({minutes: 5}).toDate(),
    'prestart');
  events.push(prestart);

  // Start
  var start = eventModel.createEvent(gameplay.internal.gameId,
    gameplay.scheduling.gameStartTs,
    'start'
  );
  events.push(start);

  // Interests
  var m = moment(gameplay.scheduling.gameStartTs);
  while (m < gameplay.scheduling.gameEndTs) {
    var interest = eventModel.createEvent(gameplay.internal.gameId,
      new Date(m.toDate()),
      'interest');
    events.push(interest);

    m.add(gameplay.gameParams.interestInterval, 'm');
  }

  // End
  var end = eventModel.createEvent(gameplay.internal.gameId,
    gameplay.scheduling.gameEndTs,
    'end'
  );
  events.push(end);

  eventModel.saveEvents(events, function (err) {
    callback(err);
  });
}

module.exports = {
  createEvents: createEvents
};
