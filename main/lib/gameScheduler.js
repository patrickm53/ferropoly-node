/**
 * This scheduler watches for events of the gameplays:
 *
 * - Start of the game
 * - Interest rounds
 * - End of the game
 *
 * Created by kc on 19.04.15.
 */


const eventRepo    = require('../../common/models/schedulerEventModel');
const moment       = require('moment');
const EventEmitter = require('events').EventEmitter;
const util         = require('util');
const schedule     = require('node-schedule');
const gameCache    = require('./gameCache');
const logger       = require('../../common/lib/logger').getLogger('gameScheduler');
const settings     = require('../settings');

/**
 * Constructor of the scheduler
 * @constructor
 */
function Scheduler(_settings) {
  logger.info('initializing scheduler');
  EventEmitter.call(this);

  this.settings = _settings;
  if (!this.settings.scheduler) {
    this.scheduler = {delay: 15};
  }
  this.jobs      = [];
  this.updateJob = undefined;

  schedule.scheduleJob('0 22 * * *', function () {
    // Clear cache at end of the day
    gameCache.refreshCache(function (err) {
      if (err) {
        logger.error('Error in Constructor', err);
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
  let self = this;
  logger.info('Handling event ' + event._id + ' for ' + channel);
  eventRepo.requestEventSave(event, self.settings.server.serverId).then(ev => {
    if (!ev) {
      logger.info('Event already handled by other instance: ' + event._id + ' for ' + channel);
      return;
    }
    logger.info('event handled by this instance: ' + event._id + ' for ' + channel);
    // Now emit the event. The event callback is attached, without calling this callback, the
    // event won't be marked as solved!
    ev.callback = self.handleEventCallback;
    self.emit(channel, ev);
  }).catch(err => {
    logger.info('Error while handling event: ' + event._id + ' message: ' + err.message);
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
    logger.info('Error in event handler callback', err);
    return;
  }
  eventRepo.saveAfterHandling(event).then(()=> {
    logger.info('Event handling finished');
  }).catch(err => {
    logger.error('Error while saving handled event', err);
  });
};

/**
 * Update: load all events of next few hours.
 * @param callback
 */
Scheduler.prototype.update = function (callback) {
  logger.info('Scheduler update');
  let self = this;
  let i;
  eventRepo.getUpcomingEvents().then(events => {
    logger.info('Events read: ' + events.length);

    // Cancel all existing jobs
    for (i = 0; i < self.jobs.length; i++) {
      self.jobs[i].cancel();
    }
    self.jobs = [];

    if (events.length > 0) {
      const now = moment();

      let handlerFunction = function (ev) {
        logger.info('Emitting event for ' + ev.gameId + ' type:' + ev.type + ' id:' + ev._id);
        self.handleEvent(ev.type, ev);
      };

      for (i = 0; i < events.length; i++) {
        let event = events[i];
        logger.info('upcoming Event', events[i]);

        if (moment(event.timestamp) < now) {
          logger.info('Emit an old event:' + event._id);
          self.handleEvent(event.type, event);
        } else {
          logger.info('Push event in joblist:' + event._id);
          let scheduledTs = moment(event.timestamp).add({seconds: self.settings.scheduler.delay});
          self.jobs.push(schedule.scheduleJob(scheduledTs.toDate(), handlerFunction.bind(null, event)));
        }
      }
    }

    // Start the next update job
    if (self.updateJob) {
      self.updateJob.cancel();
    }
    // Todo: this time is to short, we don't need to update so often.
    // The problem is that new games won't be recognized after creation until the scheduler was updated, now
    // we get new games at least once an hour. Should be fixed with a communication between Editor and Main,
    // added as GitHub ticket #2 in EDITOR project (as the trigger has to come from the editor)
    self.updateJob = schedule.scheduleJob(moment().add({minutes: 54, seconds: 3}).toDate(), function () {
      self.update(function (err) {
        if (err) {
          logger.error('SCHEDULER UPDATE FAILED!', err);
        }
      });
    });
  }).catch(callback);
};

/**
 * Request a specific event for handling it
 * @param event
 * @param callback
 */
Scheduler.prototype.requestEventSave = function (event, callback) {
  eventRepo.requestEventSave(event, this.settings.serverId).then(ev => {
    callback(null, ev);
  }).catch(callback);
};

/**
 * Mark an event as handled
 * @param event
 * @param callback
 */
Scheduler.prototype.markEventHandled = function (event, callback) {
  eventRepo.saveAfterHandling(event).then(ev => {
    callback (null, ev);
  }).catch(callback);
};
/*
 What needs to be done:
 - load all gameplays, get the next event
 - subscribe to this event and handle it
 - when handling it, subscribe to the next event

 Design it as event emitter or do we all here?
 */
const gameScheduler = new Scheduler(settings);
module.exports      = gameScheduler;
