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
var logger = require('../../common/lib/logger').getLogger('gameScheduler');

/**
 * Constructor of the scheduler
 * @constructor
 */
function Scheduler(_settings) {
  logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': initializing scheduler');
  EventEmitter.call(this);

  this.settings = _settings;
  this.jobs = [];
  this.updateJob = undefined;

  schedule.scheduleJob('0 22 * * *', function () {
    // Clear cache at end of the day
    gameCache.refreshCache(function (err) {
      if (err) {
        logger.error(err);
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
  logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': Handling event ' + event._id + ' for ' + channel);
  eventRepo.requestEventSave(event, self.settings.server.serverId, function (err, ev) {
    if (err) {
      logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': Error while handling event: ' + event._id + ' message: ' + err.message);
      return;
    }
    if (!ev) {
      logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': Event already handled by other instance: ' + event._id + ' for ' + channel);
      return;
    }
    logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': event handled by this instance: ' + event._id + ' for ' + channel);
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
    logger.info('Error in event handler callback: ' + err.message);
    return;
  }
  eventRepo.saveAfterHandling(event, function (err) {
    if (err) {
      logger.error('Error while saving handled event:' + err.message);
      return;
    }
    logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': Event handling finished');
  });
};

/**
 * Update: load all events of next few hours.
 * @param callback
 */
Scheduler.prototype.update = function (callback) {
  logger.info(moment().format('dddd, MMMM Do YYYY, H:mm:ss') + ': Scheduler update');
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
        logger.info('Emitting event for ' + ev.gameId + ' type:' + ev.type + ' id:' + ev._id);
        self.handleEvent(ev.type, ev);
      };

      for (i = 0; i < events.length; i++) {
        var event = events[i];
        logger.info(events[i]);

        if (moment(event.timestamp) < now) {
          logger.info('Emit an old event:' + event._id);
          self.handleEvent(event.type, event);
        }
        else {
          logger.info('Push event in joblist:' + event._id);
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
          logger.info('SCHEDULER UPDATE FAILED!');
          logger.error(err);
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
