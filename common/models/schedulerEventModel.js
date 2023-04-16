/**
 * Scheduling events: all planned events are stored in this DB
 * Created by kc on 01.05.15.
 */

const mongoose = require('mongoose');
const moment   = require('moment');
const logger   = require('../lib/logger').getLogger('schedulerEventModel');

/**
 * The mongoose schema for a scheduleEvent
 */
const scheduleEventSchema = mongoose.Schema({
  _id      : String,
  gameId   : String, // Gameplay this team plays with
  timestamp: Date, // When it is going to happen
  type     : String, // What it is about
  handled  : {type: Boolean, default: false},
  handler  : {
    id      : String, // ID of the handler
    reserved: Date,
    handled : Date
  }
});
/**
 * The scheduleEvent model
 */
const scheduleEventModel  = mongoose.model('schedulerEvent', scheduleEventSchema);

/**
 * Creates an event
 */
function createEvent(gameId, timestamp, type) {
  let event       = new scheduleEventModel();
  event.gameId    = gameId;
  event.timestamp = timestamp;
  event.type      = type;
  event._id       = gameId + '-' + moment(timestamp).format('YYMMDD-HHmm') + '-' + type;
  return event;
}

/**
 * Save all events. Dumps them all before adding new ones
 * @param events
 */
async function saveEvents(events) {
  dumpEvents(events[0].gameId).then(async () => {
    events.forEach(async item => {
      await item.save();
    })
  }).catch(err => {
    logger.error(err);
    throw err;
  })
}

/**
 * Dump all scheduled events of a gameplay
 * @param gameId
 * @returns {*}
 */
async function dumpEvents(gameId) {
  if (!gameId) {
    throw new Error('No gameId supplied');
  }
  logger.info('Removing all existing scheduler event information for ' + gameId);

  return await scheduleEventModel
    .deleteMany({gameId: gameId})
    .exec();
}


/**
 * Gets the events of the next few hours
 */
async function getUpcomingEvents() {

  let untilTime = moment().add(4, 'h');

  return await scheduleEventModel
    .find()
    .where('handled').equals(false)
    .where('timestamp').lte(untilTime.toDate())
    .sort('timestamp')
    .lean()
    .exec();
}

/**
 * This function was way to complicated, just save an event!
 * @param event
 * @param serverId
 */
async function requestEventSave(event, serverId) {

  const data = await scheduleEventModel
    .find()
    .where('_id').equals(event._id)
    .exec();

  if (data.length === 0) {
    throw new Error('Event not found! ID: ' + event._id);
  }

  let ev = data[0];
  if (ev.handler && ev.handler.id && ev.handler.id !== serverId) {
    // Someone else is handling it, forget it
    return;
  }
  ev.handler = {
    id      : serverId,
    reserved: new Date()
  };
  return await ev.save();
}

/**
 * Saves the event after handling it
 * @param event
 * @returns {*}
 */
async function saveAfterHandling(event) {
  if (!event) {
    throw new Error('No event supplied');
  }
  if (!event.handler || !event.handler.reserved) {
    throw new Error('This event is not properly handled, can not save it!');
  }

  event.handler.handled = new Date();
  event.handled         = true;
  let savedEvent        = await event.save();
  logger.info('Event marked as finished');

  return savedEvent;
}

module.exports = {
  Model            : scheduleEventModel,
  createEvent      : createEvent,
  saveEvents       : saveEvents,
  dumpEvents       : dumpEvents,
  getUpcomingEvents: getUpcomingEvents,
  requestEventSave : requestEventSave,
  saveAfterHandling: saveAfterHandling
};
