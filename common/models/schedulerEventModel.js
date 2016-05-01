/**
 * Scheduling events: all planned events are stored in this DB
 * Created by kc on 01.05.15.
 */



var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
var logger = require('../lib/logger').getLogger('schedulerEventModel');

/**
 * The mongoose schema for a scheduleEvent
 */
var scheduleEventSchema = mongoose.Schema({
  _id: String,
  gameId: String, // Gameplay this team plays with
  timestamp: Date, // When it is going to happen
  type: String, // What it is about
  handled: {type: Boolean, default: false},
  handler: {
    id: String, // ID of the handler
    reserved: Date,
    handled: Date
  }
});
/**
 * The scheduleEvent model
 */
var scheduleEventModel = mongoose.model('schedulerEvent', scheduleEventSchema);

/**
 * Creates an event
 */
function createEvent(gameId, timestamp, type) {
  var event = new scheduleEventModel();
  event.gameId = gameId;
  event.timestamp = timestamp;
  event.type = type;
  event._id = gameId + '-'+ moment(timestamp).format('YYMMDD-HHmm') + '-' + type;
  return event;
}
/**
 * Save all events. Dumps them all before adding new ones
 * @param events
 * @param callback
 */
function saveEvents(events, callback) {
  dumpEvents(events[0].gameId, function (err) {
    if (err) {
      return callback(err);
    }
    var error = undefined;
    var nbSaved = 0;

    for (var i = 0; i < events.length; i++) {
      events[i].save(function (err) {
        if (err) {
          error = err;
        }
        nbSaved++;

        if (nbSaved === events.length) {
          logger.info('Events saved');
          callback(error);
        }
      });
    }
  });
}

/**
 * Dump all scheduled events of a gameplay
 * @param gameId
 * @param callback
 * @returns {*}
 */
function dumpEvents(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all existing scheduler event information for ' + gameId);
  scheduleEventModel.remove({gameId: gameId}, function (err) {
    callback(err);
  });
}

/**
 * Gets the events of the next few hours
 * @param callback
 */
function getUpcomingEvents(callback) {
  var untilTime = moment().add(4, 'h');

  scheduleEventModel.find()
    .where('handled').equals(false)
    .where('timestamp').lte(untilTime.toDate())
    .sort('timestamp')
    .lean()
    .exec(function (err, data) {
      callback(err, data);
    });
}

/**
 * Gets an event to handle on a save way:
 * only if we can reserve the event for our handling it is returned. Therefore we read the
 * event, write it with our serverId and then check again if it is ours.
 * @param event
 * @param serverId
 * @param callback
 */
function requestEventSave(event, serverId, callback) {
  scheduleEventModel.find()
    .where('_id').equals(event._id)
    .exec(function (err, data) {
      if (err) {
        return callback(err);
      }
      if (data.length === 0) {
        return callback(new Error('Event not found! ID: ' + event._id));
      }

      var ev = data[0];
      if (ev.handler && ev.handler.id && ev.handler.id !== serverId) {
        // Someone else is handling it, forget it
        return callback(null, null);
      }
      ev.handler = {
        id: serverId,
        reserved: new Date()
      };

      // Now try to save and read it back again after a short, random period
      ev.save(function (err, savedEvent) {
        if (err) {
          logger.info('Error while saving event:' + err.message);
          // another one tried to save as well? Wait a second, try again the complete sequence
          _.delay(function (e, s, c) {
              requestEventSave(e, s, c);
            },
            _.random(100, 2000),
            event, serverId, callback);
          return;
        }
        // This delay avoids collisions between two parallel servers
        var delay = _.random(250, 3000);
        logger.info('requestEventSave: delay: ' + delay + ' for event ' + savedEvent._id);
        _.delay(function (_eventId, _serverId, _callback) {
            scheduleEventModel.find()
              .where('_id').equals(_eventId)
              .where('handler.id').equals(_serverId)
              .exec(function (err, data) {
                if (err) {
                  return _callback(err);
                }
                if (!data || data.length === 0) {
                  return _callback(null, null);
                }
                _callback(null, data[0]);
              });
          },
          delay,
          savedEvent._id, serverId, callback);
      });
    });
}

/**
 * Saves the event after handling it
 * @param event
 * @param callback
 * @returns {*}
 */
function saveAfterHandling(event, callback) {
  if (!event) {
    return callback(new Error('No event supplied'));
  }
  if (!event.handler || !event.handler.reserved) {
    return callback(new Error('This event is not properly handled, can not save it!'));
  }
  event.handler.handled = new Date();
  event.handled = true;

  event.save(function (err, savedEvent) {
    if (err) {
      logger.info('Error while saving, start delay: ' + err.message);
      // concurrency error? It is important, that it is saved!
      _.delay(function (e, c) {
          saveAfterHandling(e, c);
        },
        800,
        event, callback);
      return;
    }
    logger.info('Event marked as finished');
    callback(null, savedEvent);
  });
}

module.exports = {
  Model: scheduleEventModel,
  createEvent: createEvent,
  saveEvents: saveEvents,
  dumpEvents: dumpEvents,
  getUpcomingEvents: getUpcomingEvents,
  requestEventSave: requestEventSave,
  saveAfterHandling: saveAfterHandling
};
