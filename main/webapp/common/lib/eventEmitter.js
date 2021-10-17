/**
 * Event Emitter, a base class
 * Found herer: https://betterprogramming.pub/how-to-create-your-own-event-emitter-in-javascript-fbd5db2447c4
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.07.21
 **/

class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name, data) {
    if (!this._events[name]) {
      console.log(`Nobody registered "${name}".`);
      return;
    }

    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
}

export default EventEmitter;
