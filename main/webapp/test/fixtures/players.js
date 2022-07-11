/**
 * Returns the players (teams) of the Demo Game
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.05.21
 **/

import players from './players.json';
import {isNumber} from 'lodash';

/**
 * Returns one single player
 * @param index is optional, if not provided, the first player is returned
 * @returns {{_id: string, data: {name: string, organization: string, teamLeader: {name: string, email: string, phone: string}}, uuid: string, gameId: string, __v: number, login: {personalData: {forename: string, surname: string, email: string, avatar: string}, info: {agbAccepted: number, registrationDate: string, lastLogin: string}}}}
 */
function getPlayer(index) {
  let i = 0;
  if (isNumber(index)) {
    if (i >= 0 && i < players.length) {
      i = index;
    }
  }
  return players[i];
}

/**
 * Returns complete Array of players
 * @returns {{}}
 */
function getPlayers() {
  return players;
}

export {getPlayer, getPlayers};
