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
  console.warn('setItem in sessionStorage is obsolete!');
  setString(key, value);
}

/**
 * Sets an object in the storage
 * @param key
 * @param value
 */
function setObject(key, value) {
  sessionStorage.setItem(key, JSON.stringify({type: 'Object', value}));
}

/**
 * Sets an integer in the storage
 * @param key
 * @param value
 */
function setInt(key, value) {
  sessionStorage.setItem(key, JSON.stringify({type: 'Int', value}));
}

/**
 * Sets a float in the storage
 * @param key
 * @param value
 */
function setFloat(key, value) {
  sessionStorage.setItem(key, JSON.stringify({type: 'Float', value}));
}

/**
 * Sets a string in the storage
 * @param key
 * @param value
 */
function setString(key, value) {
  sessionStorage.setItem(key, JSON.stringify({type: 'String', value}));
}

/**
 * Retrieves an item
 * @param key
 * @param def
 * @returns {string}
 */
function getItem(key, def = undefined) {
  let data = def;
  try {
    data = JSON.parse(sessionStorage.getItem(key));
  }
  catch (e) {
    console.warn(e);
  }

  console.log('session storage', data);
  return data.value;
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

export {setItem, getItem, clear, removeItem, setObject, setInt, setFloat, setString};
