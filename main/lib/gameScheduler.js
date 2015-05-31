/**
 * This scheduler watches for events of the gameplays:
 *
 * - Start of the game
 * - Interest rounds
 * - End of the game
 *
 * Created by kc on 19.04.15.
 */
'use strict';

var eventRepo = require('../../common/models/schedulerEventModel');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var schedule = require('node-schedule');
var gameCache = require('./gameCache');

/**
 * Constructor of the scheduler
 * @constructor
 */
function Scheduler(_settings) {
  EventEmitter.call(this);

  this.settings = _settings;
  this.jobs = [];
  this.updateJob = undefined;

  schedule.scheduleJob('0 22 * * *', function () {
    // Clear cache at end of the day
    gameCache.refreshCache(function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
}

util.inherits(Scheduler, EventEmitter);

/**
 * Handles an event: the event is requested from the DB for this instance, if this fails,
 * another instance is handling it
 * @param channel
 * @param event
 */
Scheduler.prototype.handleEvent = function (channel, event) {
  var self = this;
  console.log('Handling event ' + channel);
  eventRepo.requestEventSave(event, self.settings.server.serverId, function (err, ev) {
    if (err) {
      console.error(err);
      return;
    }
    if (!ev) {
      console.log('Event already handled by other instance');
      return;
    }
    // Now emit the event. The event callback is attached, without calling this callback, the
    // event won't be marked as solved!
    ev.callback = self.handleEventCallback;
    self.emit(channel, ev);

  });
};

/**
 * After handling an event it has to be marked as 'solved' by the designated handler by
 * calling this callback (found in event.callback)
 * @param err
 * @param event
 */
Scheduler.prototype.handleEventCallback = function (err, event) {
  if (err) {
    console.log('Error in event handler callback: ' + err.message);
    return;
  }
  eventRepo.saveAfterHandling(event, function (err) {
    if (err) {
      console.error('Error while saving handled event:' + err.message);
      return;
    }
    console.log('Event handling finished');
  });
};

/**
 * Update: load all events of next few hours.
 * @param callback
 */
Scheduler.prototype.update = function (callback) {
  console.log('Scheduler: update');
  var self = this;
  var i;
  eventRepo.getUpcomingEvents(function (err, events) {
    if (err) {
      return callback(err);
    }

    // Cancel all existing jobs
    for (i = 0; i < self.jobs.length; i++) {
      self.jobs[i].cancel();
    }
    self.jobs = [];

    if (events.length > 0) {
      var now = moment();

      var handlerFunction = function (ev) {
        console.log('Emitting event for ' + ev.gameId + ' type:' + ev.type + ' id:' + ev._id);
        self.handleEvent(ev.type, ev);
      };

      for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(events[i]);

        if (moment(event.timestamp) < now) {
          console.log('Emit an old event:' + event._id);
          self.handleEvent(event.type, event);
        }
        else {
          console.log('Push event in joblist:' + event._id);
          self.jobs.push(schedule.scheduleJob(event.timestamp, handlerFunction.bind(null, event)));
        }
      }
    }

    // Start the next update job
    if (self.updateJob) {
      self.updateJob.cancel();
    }
    self.updateJob = schedule.scheduleJob(moment().add({minutes: 181, seconds: 3}).toDate(), function () {
      self.update(function (err) {
        if (err) {
          console.log('SCHEDULER UPDATE FAILED!');
          console.error(err);
        }
      });
    });

    callback(err);
  });
};

/**
 * Request a specific event for handling it
 * @param event
 * @param callback
 */
Scheduler.prototype.requestEventSave = function (event, callback) {
  eventRepo.requestEventSave(event, this.settings.serverId, function (err, ev) {
    return callback(err, ev);
  });
};

/**
 * Mark an event as handled
 * @param event
 * @param callback
 */
Scheduler.prototype.markEventHandled = function (event, callback) {
  eventRepo.saveAfterHandling(event, function (err, ev) {
    return callback(err, ev);
  });
};
/*
 What needs to be done:
 - load all gameplays, get the next event
 - subscribe to this event and handle it
 - when handling it, subscribe to the next event

 Design it as event emitter or do we all here?
 */
module.exports = function (settings) {
  return new Scheduler(settings);
};
