import {DateTime} from 'luxon';
import {isNumber, find, toUpper} from 'lodash';
import maps from '../../../../common/lib/maps.json';

/**
 * Formatter for the Game Date (when we play):
 *
 * Sonntag, 11. April 2021
 *
 * @param value
 * @returns {string}
 */
function formatGameDate(value) {
  if (!value) {
    return '';
  }
  return DateTime.fromISO(value).setLocale('de').toLocaleString(DateTime.DATE_HUGE);
}


/**
 * Formatter for the Game start and end time:
 *
 * 8:00
 *
 * @param value
 * @returns {string}
 */
function formatGameTime(value) {
  if (!value) {
    return '';
  }
  return DateTime.fromISO(value).toLocaleString(DateTime.TIME_24_SIMPLE);
}

/**
 * Formatter for time only:
 *
 * 8:00:00
 *
 * @param value
 * @returns {string}
 */
function formatTime(value) {
  if (!value) {
    return '';
  }
  return DateTime.fromISO(value).toLocaleString(DateTime.TIME_24_WITH_SECONDS);
}

/**
 * Formatter for the Date and time when the price list was created:
 *
 * 10. Apr. 2021, 10:09
 *
 * @param value
 * @returns {string}
 */
function formatDateTime(value) {
  if (!value) {
    return '';
  }
  return DateTime.fromISO(value).setLocale('de').toLocaleString(DateTime.DATETIME_MED);
}

/**
 * Formats a timestamp to "4 seconds ago"
 * @param timestamp
 * @returns {*}
 */
function formatTimestampAsAgo(timestamp) {
  return timestamp.toRelative();
}


/**
 * Formats the price with the 1'000 format
 * @param val
 * @returns {string|*}
 */
function formatPrice(val) {
  if (isNumber(val)) {
    return val.toLocaleString('de-CH');
  }
  return val;
}

/**
 * Formatter for "how can a property be accessed?"
 * @param val
 * @returns {string}
 */
function formatAccessibility(val) {
  switch (val) {
    case 'train':
      return 'Bahn';

    case 'bus':
      return 'Bus';

    case 'boat':
      return 'Schiff';

    case 'cablecar':
      return 'Seilbahn / Standseilbahn';

    default:
      return 'Andere (Tram, U-Bahn,...)';
  }
}

/**
 * Formats the price range of a property
 * @param val
 * @returns {string}
 */
function formatPriceRange(val) {
  switch (val) {
    case -1:
      return 'unbenutzt';

    case 0:
      return 'sehr billig';

    case 1:
      return 'billig';

    case 2:
      return 'unteres Mittelfeld';

    case 3:
      return 'oberes Mittelfeld';

    case 4:
      return 'teuer';

    case 5:
      return 'sehr teuer';

    default:
      return '?';
  }
}

/**
 * Formats the map name
 * @param map
 * @returns {string|*}
 */
function formatMap(map) {
  let m = find(maps, {map: map});
  if (!m) {
    return toUpper(map);
  }
  return (m.name);
}


/**
 * True is Ja, false is Nein
 * @param b
 * @returns {string}
 */
function booleanYesNo(b) {
  if (b) {
    return 'Ja';
  }
  return 'Nein';
}

/**
 * Returns the status of the building process
 * @param bs
 * @returns {string}
 */
function buildingStatus(bs) {
  switch (bs) {
    case 0:
      return 'unbebaut';

    case 1:
      return '1 Haus';

    case 2:
      return '2 Häuser';

    case 3:
      return '3 Häuser';

    case 4:
      return '4 Häuser';

    case 5:
      return 'Hotel';

    default:
      return '?';
  }
}



export {
  formatMap,
  formatTime,
  formatGameTime,
  formatGameDate,
  formatDateTime,
  formatPrice,
  formatAccessibility,
  formatPriceRange,
  booleanYesNo,
  buildingStatus,
  formatTimestampAsAgo
};
