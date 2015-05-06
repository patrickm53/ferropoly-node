/**
 * Scheduling events: all planned events are stored in this DB
 * Created by kc on 01.05.15.
 */
'use strict';


var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
/**
 * The mongoose schema for a scheduleEvent
 */
var scheduleEventSchema = mongoose.Schema({
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
          console.log('Events saved');
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
  console.log('Removing all existing scheduler event information for ' + gameId);
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
        return callback(new Error('Event not found! ID: ' + event.id));
      }

      var ev = data[0];
      if (ev.handler && ev.handler.id !== serverId) {
        // Someone else is handling it, forget it
        return callback(null, null);
      }
      ev.handler = {
        id: serverId,
        reserved: new Date()
      };

      // Now try to save and read it back again immediately
      ev.save(function (err, savedEvent) {
        if (err) {
          // another one tried to save as well? Wait a second, try again the complete sequence
          _.delay(function (e, s, c) {
              requestEventSave(e, s, c);
            },
            1000,
            event, serverId, callback);
          return;
        }
        scheduleEventModel.find()
          .where('_id').equals(savedEvent._id)
          .where('handler.id').equals(serverId)
          .exec(function (err, data) {
            if (err) {
              return callback(err);
            }
            if (!data || data.length === 0) {
              return callback(null, null);
            }
            callback(null, data);
          });
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
  if (!event.handler || event.handler.reserved) {
    return callback(new Error('This event is not properly handled, can not save it!'));
  }
  event.handler.handled = new Date();

  event.save(function (err, savedEvent) {
    if (err) {
      // concurrency error? It is important, that it is saved!
      _.delay(function (e, c) {
          saveAfterHandling(e, c);
        },
        800,
        event, callback);
      return;
    }
    callback(null, savedEvent);
  });
}

module.exports = {
  Model: scheduleEventModel,
  saveEvents: saveEvents,
  dumpEvents: dumpEvents,
  getUpcomingEvents: getUpcomingEvents,
  requestEventSave: requestEventSave,
  saveAfterHandling: saveAfterHandling
};
