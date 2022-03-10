/**
 * This is the ferropoly socket to the main game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.12.21
 **/

import {io} from 'socket.io-client';
import EventEmitter from '../../common/lib/eventEmitter'


class FerropolySocket extends EventEmitter {
  constructor(options) {
    super();
    let self    = this;
    this.socket = io(options.url);
    this.store  = options.store;
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
    this.socket.on('initialized', () => {
      console.log('socket fully initialized');
      self.store.commit('connected');
    });

    // Team Account messages
    this.socket.on('admin-teamAccount', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updateTeamAccountEntries', teamId: msg.data.teamId});
    });
    // Incoming Property Account Messages
    this.socket.on('admin-propertyAccount', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updatePropertyInPricelist', property: msg.property});
      console.log('Unhandled message admin-propertyAccount', msg)
    });
    // Chancellery Messages
    this.socket.on('admin-chancelleryAccount', () => {
      console.log('admin-chancelleryAccount info')
      self.store.dispatch({type: 'fetchRankingList'});
      self.store.dispatch({type: 'updateChancellery'});
    });
    // Incoming Properties messages
    this.socket.on('admin-properties', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      console.log('Unhandled message admin-properties', msg)
    });
    // Incoming marketplace messages
    this.socket.on('admin-marketplace', msg => {
      self.store.dispatch({type: 'fetchRankingList'});
      console.log('Unhandled message admin-marketplace', msg)
    });
    // Incoming info that rent was paid
    this.socket.on('admin-rents-paid', msg => {
      self.store.dispatch({type: 'updateProperties'});
      console.log('Unhandled message admin-rents-paid', msg)
    });
  }
}

export {FerropolySocket};
