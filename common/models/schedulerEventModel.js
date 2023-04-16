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
 * @param callback
 */
function saveEvents(events, callback) {
  let err;
  try {
    dumpEvents(events[0].gameId, async function (err) {
      if (err) {
        return callback(err);
      }
      for (const item of events) {
        await item.save();
      }
    });
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
}

/**
 * Dump all scheduled events of a gameplay
 * @param gameId
 * @param callback
 * @returns {*}
 */
async function dumpEvents(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all existing scheduler event information for ' + gameId);

  let err, res;
  try {
    res = await scheduleEventModel
      .deleteMany({gameId: gameId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}


/**
 * Gets the events of the next few hours
 * @param callback
 */
async function getUpcomingEvents(callback) {
  let err, res;
  try {
    let untilTime = moment().add(4, 'h');

    res = await scheduleEventModel
      .find()
      .where('handled').equals(false)
      .where('timestamp').lte(untilTime.toDate())
      .sort('timestamp')
      .lean()
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * This function was way to complicated, just save an event!
 * @param event
 * @param serverId
 * @param callback
 */
async function requestEventSave(event, serverId, callback) {
  let err, res;
  try {
    const data = await scheduleEventModel
      .find()
      .where('_id').equals(event._id)
      .exec();

    if (data.length === 0) {
      return callback(new Error('Event not found! ID: ' + event._id));
    }

    let ev = data[0];
    if (ev.handler && ev.handler.id && ev.handler.id !== serverId) {
      // Someone else is handling it, forget it
      return callback(null, null);
    }
    ev.handler = {
      id      : serverId,
      reserved: new Date()
    };
    res        = await ev.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Saves the event after handling it
 * @param event
 * @param callback
 * @returns {*}
 */
async function saveAfterHandling(event, callback) {
  if (!event) {
    return callback(new Error('No event supplied'));
  }
  if (!event.handler || !event.handler.reserved) {
    return callback(new Error('This event is not properly handled, can not save it!'));
  }

  let err, savedEvent;
  try {
    event.handler.handled = new Date();
    event.handled         = true;
    savedEvent            = await event.save();
    logger.info('Event marked as finished');
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, savedEvent);
  }
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
