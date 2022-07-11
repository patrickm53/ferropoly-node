/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.03.22
 **/

import {forIn, get, isPlainObject, set} from 'lodash';

/**
 * Assigns the members of an object step by step to the state object with the same path
 * @param state
 * @param obj
 * @param name
 */
function assignObject(state, obj, name) {
  let src = get(obj, name, undefined);
  if (isPlainObject(src)) {
    forIn(src, (val, key) => {
      assignObject(state, obj, `${name}.${key}`);
    })
  } else {
    console.log('set', name, get(obj, name));
    set(state, name, get(obj, name, undefined));
  }
}

export default assignObject;
