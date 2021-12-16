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
    console.log('Socket created');

    this.socket.on('connect', () => {
      console.log('connect', self.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('disconnect', () => {
      console.log('disconnect', self.socket.id); // undefined
      self.emit('disconnected');
    });

    this.socket.on('identify', () => {
      console.log('identify', options);
      self.socket.emit('identify', {
        user     : options.user,
        authToken: options.authToken,
        gameId   : options.gameId
      })
    })

    this.socket.on('welcome', () => {
      console.log('welcome');
    })
    this.socket.on('initialized', () => {
      console.log('initialized');
      self.emit('connected');
    })
  }
}

export {FerropolySocket};
