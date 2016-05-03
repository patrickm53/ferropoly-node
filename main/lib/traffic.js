/**
 * Fetches the SBB traffic situation and wraps it into a ferropoly compatible JSON format.
 *
 * This conversion is not free of pain: if they decide to change the format of the XML or the RSS URL changes, I won't
 * be noticed then and this functionality fails. Therefore it is implemented to be as fail resistant as possible:
 * returning nothing is better than crashing.
 *
 * Created by kc on 01.09.15.
 */

const needle   = require('needle');
const moment   = require('moment');
const pixlXml  = require('pixl-xml');
const _        = require('lodash');
const logger   = require('../../common/lib/logger').getLogger('traffic');
const path     = require('path');
const fs       = require('fs');
const settings = require('../settings');

// Set default settings
settings.traffic                 = settings.traffic || {};
settings.traffic.refreshInterval = settings.traffic.refreshInterval || 1;
settings.traffic.simulation      = settings.traffic.simulation || false;

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
    var from     = moment(elements[0], 'DD.MM.YYYY HH:mm');
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
  return 'unknown';
}
/**
 * Transforms data where neded
 * @param data
 * @returns {*}
 */
function transformData(data) {
  if (!data.channel || !data.channel.item) {
    // Can happen if there is no data, but this happens not often (most likely a server bug)
    return {};
  }

  var version = _.get(data, 'version', 'unknown');
  if (version !== '2.0') {
    logger.error(`TRAFFIC INFORMATION MISMATCH: found version ${version}, check for compatibility!`);
  }

  /**
   * Filter used in the _.remove function below in the loop
   * @param n
   * @returns {boolean}
   */
  function removeFilter(n) {
    return (!n || n.length === 0);
  }

  for (var i = 0; i < data.channel.item.length; i++) {
    try {
      // They both use <br /> and <br/>. Split description into time element and description itself
      data.channel.item[i].description = data.channel.item[i].description.replace(/<br\/>/g, '<br>');
      data.channel.item[i].description = data.channel.item[i].description.replace(/<br \/>/g, '<br>');

      var elements = data.channel.item[i].description.split('<br>');
      _.remove(elements, removeFilter);

      data.channel.item[i].duration    = extractDuration(elements[0]);
      data.channel.item[i].info        = _.drop(elements, 1);
      data.channel.item[i].reason      = getCategory(data.channel.item[i]);
      // Moment dislikes the format "Tue, 03 May 2016 15:12:11 +0200" so we have to create a date object first
      data.channel.item[i].publishDate = moment(new Date(data.channel.item[i].pubDate));

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

  if (settings.traffic.simulation) {
    fs.readFile(sampleTrafficInfo, {}, callback);
    return;
  }

  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
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
    if (err) {
      return callback(err);
    }
    callback(null, transformData(pixlXml.parse(data)));
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
        cachedData[map]                = {};
        cachedData[map].data           = data;
        // I don't want to fetch the RSS Feed with every request, cache it for some time
        cachedData[map].nextUpdateTime = moment().add({minutes: 5});
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
