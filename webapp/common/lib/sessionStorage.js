/**
 * Adapter for the local Storage. The intention of this module is to use a centralised storage
 * instead of the JS functions in order to enable debugging or migration to another store
 *
 * This storage is used for the SESSION ONLY
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.05.21
 **/


/**
 * Sets an item in the storage
 * @param key
 * @param value
 */
function setItem(key, value) {
  sessionStorage.setItem(key, value);
}

/**
 * Retrieves an item
 * @param key
 * @param def
 * @returns {string}
 */
function getItem(key, def = undefined) {
  let retVal = sessionStorage.getItem(key);
  if (!retVal) {
    retVal = def;
  }
  return retVal;
}

/**
 * Removes an item
 * @param key
 */
function removeItem(key) {
  sessionStorage.removeItem(key);
}

/**
 * Clears the whole storage for the app
 */
function clear() {
  sessionStorage.clear();
}

export {setItem, getItem, clear, removeItem};
