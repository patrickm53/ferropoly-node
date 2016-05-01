/**
 * Model for the ferropoly log
 * Created by kc on 08.06.15.
 */

var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var util = require('util');
var _ = require('lodash');
var logger = require('../lib/logger').getLogger('locationModel');
var settings = {
  server: {
    serverId: 'notSet'
  }
};

/**
 * The mongoose schema for a property
 */
var logSchema = mongoose.Schema({
  timestamp: {type: Date, default: Date.now},
  text: String,
  obj: String,
  instance: String
}, {autoIndex: false});

/**
 * The Log model
 */
var Log = mongoose.model('Log', logSchema);

/**
 * Creates a new log entry and saves it
 * @param text
 * @param obj optional parameter, a object to push
 * @param callback
 * @returns {*}
 */
var addEntry = function (text, obj, callback) {
  if (_.isFunction(obj)) {
    callback = obj;
    obj = undefined;
  }
  if (!text) {
    return callback(new Error('all params in createEntry must be set'));
  }
  if (!_.isString(text)) {
    return callback(new Error('text in createEntry must be a string'));
  }
  var logEntry = new Log();
  logEntry.text = text;
  if (_.isString(obj)) {
    logEntry.obj = obj;
  }
  else if (_.isObject(obj)) {
    logEntry.obj = util.inspect(obj);
  }
  logEntry.instance = settings.server.serverId;
  logEntry.save(callback);
};


module.exports = {
  Model: Log,
  add: addEntry,
  init: function(_settings) {
    settings = _settings;
  }
};
