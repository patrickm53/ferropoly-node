/**
 * Fetchs the SBB traffic situation
 * Created by kc on 01.09.15.
 */
'use strict';
var needle = require('needle');
var moment = require('moment');
var pixlXml = require('pixl-xml');
var _ = require('lodash');
var logger = require('../../common/lib/logger').getLogger('traffic');
var path = require('path');
var fs = require('fs');

var sampleTrafficInfo = path.join(__dirname, '..', '..', 'test', 'fixtures', 'sampleTrafficInfo.xml');

var rssFeed = {
  'sbb': 'http://fahrplan.sbb.ch/bin//help.exe/dnl?tpl=rss_feed_custom&icons=46&regions=BVI1,BVI2,BVI3,BVI4,BVI5',
  'zvv': 'http://fahrplan.sbb.ch/bin//help.exe/dnl?tpl=rss_feed_custom&icons=46&regions=BVI4'
};

var cachedData = {};

/**
 * Extract the duration. Different kinds of durations were seen:
 *
 * "27.09.2015 20:55 - 09.10.2015 02:00"
 * "01.09.2015 00:00 - 18:20"
 * "26.09.2015 21:30 - 11.10.2015"
 * "07.09.2015 - 09.10.2015 01:30"
 * @param durationString
 */
function extractDuration(durationString) {
  try {
    var elements = durationString.split('-');
    var from = moment(elements[0], 'DD.MM.YYYY HH:mm');
    if (elements[1].indexOf('.') < 0) {
      elements[1] = elements[0].split(' ')[0] + ' ' + elements[1];
    }
    var to = moment(elements[1], 'DD.MM.YYYY HH:mm');
    return {from: from, to: to};
  }
  catch (e) {
    logger.error('Can not handle duration string: ' + durationString, e.message);
    return {from: moment().subtract({days: 1}), to: moment().add({days: 1})};
  }
}

function getCategory(entry) {
  switch (entry.category['_Data']) {
    case '1':
      return 'construction';

    case '2':
      return 'restriction';

    case '3':
      return 'delay';
  }
  return 'unkown';
}
/**
 * Transforms data where neded
 * @param data
 * @returns {*}
 */
function transformData(data) {

  for (var i = 0; i < data.channel.item.length; i++) {
    try {
      // They both use <br /> and <br/>. Split description into time element and description itself
      data.channel.item[i].description = data.channel.item[i].description.replace(/<br\/>/g, '<br>');
      data.channel.item[i].description = data.channel.item[i].description.replace(/<br \/>/g, '<br>');

      var elements = data.channel.item[i].description.split('<br>');
      _.remove(elements, function (n) {
        return (!n || n.length === 0);
      });

      data.channel.item[i].duration = extractDuration(elements[0]);
      data.channel.item[i].info = _.rest(elements);
      data.channel.item[i].reason = getCategory(data.channel.item[i]);
      data.channel.item[i].publishDate = moment(data.channel.item[i].pubDate);

      delete data.channel.item[i].description;
      delete data.channel.item[i].guid;
      delete data.channel.item[i].category;
      delete data.channel.item[i].pubDate;
      delete data.channel.item[i]['dc:creator'];
    }
    catch (e) {
      logger.error('transformData loop', e.message);
    }
  }
  return data.channel;

}

/**
 * Reads the RSS Feed
 * @param url
 * @param callback
 */
function getRssFeed(url, callback) {
  // fs.readFile(sampleTrafficInfo, {}, callback);
  // return;

  needle.get(url, function (error, response) {
    if (!error && response.statusCode == 200) {
      callback(null, response.body);
    }
    else {
      callback(error);
    }
  });
}

/**
 * Update the traffic info and interpret some data
 * @param url
 * @param callback
 */
function updateTrafficInfo(url, callback) {
  getRssFeed(url, function (err, data) {
    var parsedData = pixlXml.parse(data);
    callback(null, transformData(parsedData));
  });
}

/**
 * Returns the traffic info, read from RSS stream or cached
 * @param map
 * @param callback
 * @returns {*}
 */
function getTrafficInfo(map, callback) {
  if (!cachedData[map] || cachedData[map].nextUpdateTime.isBefore(moment())) {
    updateTrafficInfo(rssFeed[map], function (err, data) {
      if (!err) {
        cachedData[map] = {};
        cachedData[map].data = data;
        cachedData[map].nextUpdateTime = moment().add({minutes: 1});
        callback(null, cachedData[map]);
      }
    });
  }
  else {
    if (cachedData[map]) {
      return callback(null, cachedData[map]);
    }
    callback(new Error('no data found'));
  }
}


module.exports = {
  getTrafficInfo: getTrafficInfo

};
