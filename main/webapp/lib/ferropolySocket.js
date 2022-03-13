/**
 * This is the ferropoly socket to the main game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.12.21
 **/

import {io} from 'socket.io-client';
import EventEmitter from '../common/lib/eventEmitter'


class FerropolySocket extends EventEmitter {
  constructor(options) {
    super();
    let self        = this;
    this.socket     = io(options.url);
    this.store      = options.store;
    this.options    = options;
    this.logEnabled = true;
    console.log('Socket created');

    let handlers = this.getHandlers();

    // Handler for all events
    this.socket.onAny((eventName, msg) => {
      if (handlers[eventName]) {
        self.logSocketEvent(eventName, msg);
        handlers[eventName](msg);
      } else if (this.logEnabled) {
        console.warn(`Unhandled socket.io event: ${eventName}`, msg);
      }
    })
  }

  /**
   * Returns the handlers
   * @returns {{disconnect: disconnect, checkinStore: checkinStore, identify: identify, 'admin-teamAccount': admin-teamAccount, 'admin-chancelleryAccount': admin-chancelleryAccount, initialized: initialized, 'admin-properties': admin-properties, welcome: welcome, connect: connect, 'admin-rents-paid': admin-rents-paid, 'admin-propertyAccount': admin-propertyAccount, 'admin-marketplace': admin-marketplace}}
   */
  getHandlers() {
    let self = this;
    return {
      'connect'                 : () => {
        console.log('connect', self.socket.id); // x8WIv7-mJelg7on_ALbx
      },
      'disconnect'              : () => {
        console.log('disconnect', self.socket.id); // undefined
        self.store.commit('disconnected');
      },
      'identify'                : () => {
        console.log('identify', self.options);
        self.socket.emit('identify', {
          user     : self.options.user,
          teamId   : self.options.teamId,
          authToken: self.options.authToken,
          gameId   : self.options.gameId
        })
      },
      'welcome'                 : () => {
        console.log('Welcome!');
      },
      'initialized'             : (msg) => {
        if (msg.isPlayer) {
          console.log('PLAYER socket initialized');
        }
        if (msg.isAdmin) {
          console.log('ADMIN socket initialized');
        }
        self.store.commit('connected');
      },
      'checkinStore'            : msg => {
        console.warn('Checkin store...?', msg);
      },
      'admin-teamAccount'       : msg => {
        self.store.dispatch({type: 'fetchRankingList'});
        self.store.dispatch({type: 'updateTeamAccountEntries', teamId: msg.data.teamId});
      },
      'admin-propertyAccount'   : msg => {
        self.store.dispatch({type: 'fetchRankingList'});
        self.store.dispatch({type: 'updatePropertyInPricelist', property: msg.property});
      },
      'admin-chancelleryAccount': () => {
        self.store.dispatch({type: 'fetchRankingList'});
        self.store.dispatch({type: 'updateChancellery'});
      },
      'admin-properties'        : () => {
        self.store.dispatch({type: 'fetchRankingList'});
      },
      'admin-marketplace'       : () => {
        self.store.dispatch({type: 'fetchRankingList'});
      },
      'admin-rents-paid'        : () => {
        self.store.dispatch({type: 'updateProperties'});
      }

    };
  }

  /**
   * Central logging function
   * @param channel
   * @param payload
   */
  logSocketEvent(channel, payload) {
    if (this.logEnabled) {
      console.info(`Socket data for ${channel}`, payload);
    }
  }
}

export {FerropolySocket};
