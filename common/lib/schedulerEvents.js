/**
 * Scheduler Event Library: all about the scheduled events found in the DB
 *
 * Created by kc on 01.05.15.
 */

const eventModel = require('../models/schedulerEventModel');
const moment = require('moment');

/**
 * Create all events for a gameplay (during finalization) and insert them in the DB
 * @param gameplay
 * @param callback
 */
function createEvents(gameplay, callback) {
  let events = [];

  // Pre-Start
  let prestart = eventModel.createEvent(gameplay.internal.gameId,
    moment(gameplay.scheduling.gameStartTs).subtract({minutes: 5}).toDate(),
    'prestart');
  events.push(prestart);

  // Start
  let start = eventModel.createEvent(gameplay.internal.gameId,
    gameplay.scheduling.gameStartTs,
    'start'
  );
  events.push(start);

  // Interests
  let m = moment(gameplay.scheduling.gameStartTs);
  while (m < gameplay.scheduling.gameEndTs) {
    let interest = eventModel.createEvent(gameplay.internal.gameId,
      new Date(m.toDate()),
      'interest');
    events.push(interest);

    m.add(gameplay.gameParams.interestInterval, 'm');
  }

  // End
  let end = eventModel.createEvent(gameplay.internal.gameId,
    gameplay.scheduling.gameEndTs,
    'end'
  );
  events.push(end);

  // Summary available
  let summary = eventModel.createEvent(gameplay.internal.gameId,
    moment(gameplay.scheduling.gameStartTs).endOf('day').toDate(),
    'summary'
  );
  events.push(summary);

  eventModel.saveEvents(events, function (err) {
    callback(err);
  });
}

module.exports = {
  createEvents: createEvents
};
