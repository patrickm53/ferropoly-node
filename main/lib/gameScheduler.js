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
var _ = require('lodash');
var schedule = require('node-schedule');

function Scheduler() {
  EventEmitter.call(this);

  this.jobs = [];

  this.update(function (err, events) {
    if (err) {
      console.log(err);
    }
  });
}

util.inherits(Scheduler, EventEmitter);

Scheduler.prototype.update = function(callback) {
  var self = this;
  eventRepo.getUpcomingEvents(function (err, events) {
    if (err) {
      return callback(err);
    }

    // Cancel all existing jobs
    for (var i = 0; i < self.jobs.length; i++) {
      self.jobs[i].cancel();
    }
    self.jobs = [];

    if (events.length > 0) {
      var now = moment();
      for (i = 0; i < events.length;i++) {
        var event = events[i];
        console.log(events[i]);

        if (moment(event.timestamp) < now) {
          console.log('Emit an old event:' + event._id);
          self.emit(event.gameId + ':' + event.type, event);
        }
        else {
          console.log('Push event in joblist:' + event._id);
          self.jobs.push(schedule.scheduleJob(event.timestamp, function (ev) {
            console.log('Emitting event for ' + ev.gameId + ' type:' + ev.type + ' id:' + ev._id);
            self.emit(ev.gameId + ':' + ev.type, ev);
          }.bind(null, event)));
        }
      };
    }
    callback(err);
  })
};


/*
 What needs to be done:
 - load all gameplays, get the next event
 - subscribe to this event and handle it
 - when handling it, subscribe to the next event

 Design it as event emitter or do we all here?
 */
module.exports = function () {
  return new Scheduler();
};
