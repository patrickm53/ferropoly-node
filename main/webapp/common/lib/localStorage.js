/**
 * Adapter for the local Storage. The intention of this module is to use a centralised storage
 * instead of the JS functions in order to enable debugging or migration to another store
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
  localStorage.setItem(key, JSON.stringify({type: 'Object', value}));
}

/**
 * Sets an integer in the storage
 * @param key
 * @param value
 */
function setInt(key, value) {
  localStorage.setItem(key, JSON.stringify({type: 'Int', value}));
}

/**
 * Sets a float in the storage
 * @param key
 * @param value
 */
function setFloat(key, value) {
  localStorage.setItem(key, JSON.stringify({type: 'Float', value}));
}

/**
 * Sets a string in the storage
 * @param key
 * @param value
 */
function setString(key, value) {
  localStorage.setItem(key, JSON.stringify({type: 'String', value}));
}

/**
 * Sets a boolean in the storage
 * @param key
 * @param value
 */
function setBoolean(key, value) {
  localStorage.setItem(key, JSON.stringify({type: 'Boolean', value}));
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
    data = JSON.parse(localStorage.getItem(key));
  }
  catch (e) {
    console.warn(e);
  }
  if (!data) {
    return def;
  }

  console.log('session storage', data);
  return data.value;
}

/**
 * Removes an item
 * @param key
 */
function removeItem(key) {
  localStorage.removeItem(key);
}

/**
 * Clears the whole storage for the app
 */
function clear() {
  localStorage.clear();
}

export {setItem, getItem, clear, removeItem, setObject, setInt, setFloat, setString, setBoolean};

