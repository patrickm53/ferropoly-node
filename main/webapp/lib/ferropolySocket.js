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
    this.logEnabled = true;
    console.log('Socket created');

    this.socket.on('connect', () => {
      console.log('connect', self.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('disconnect', () => {
      console.log('disconnect', self.socket.id); // undefined
      self.store.commit('disconnected');
    });

    // Initialization procedure
    this.socket.on('identify', () => {
      console.log('identify', options);
      self.socket.emit('identify', {
        user     : options.user,
        teamId   : options.teamId,
        authToken: options.authToken,
        gameId   : options.gameId
      })
    });
    this.socket.on('welcome', () => {
      console.log('welcome');
    });

    /**
     * Event when the authorization in the Ferropoly game was successful
     */
    this.socket.on('initialized', (msg) => {
      if (msg.isPlayer) {
        console.log('PLAYER socket initialized');
      }
      if (msg.isAdmin) {
        console.log('ADMIN socket initialized');
      }
      self.store.commit('connected');
    });

    // Checkin Store Messages, obsolete??
    this.registerSocketEventHandler('checkinStore', msg => {
      console.warn('Checkin store...?');
    });

    // Team Account messages
    this.registerSocketEventHandler('admin-teamAccount', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updateTeamAccountEntries', teamId: msg.data.teamId});
    });

    // Incoming Property Account Messages
    this.registerSocketEventHandler('admin-propertyAccount', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updatePropertyInPricelist', property: msg.property});
    });

    // Chancellery Messages
    this.registerSocketEventHandler('admin-chancelleryAccount', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updateChancellery'});
    });

    // Incoming Properties messages
    this.registerSocketEventHandler('admin-properties', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
    });

    // Incoming marketplace messages
    this.registerSocketEventHandler('admin-marketplace', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
    });

    // Incoming info that rent was paid
    this.registerSocketEventHandler('admin-rents-paid', msg => {
      self.store.dispatch({type: 'updateProperties'});
    });

    // Catch all handler
  /*  this.socket.onAny((eventName, ...msg) => {
      console.warn(`Unhandled socket.io event: ${eventName}`, ...msg);
    })*/
  }

  /**
   * Registers a socket handler
   * @param channel
   * @param handler
   */
  registerSocketEventHandler(channel, handler) {
    let self = this;
    this.socket.on(channel, msg => {
      self.logSocketEvent(channel, msg);
      handler(msg);
    })
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
