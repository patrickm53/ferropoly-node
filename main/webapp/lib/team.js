/**
 * The Object for a team, implementing the team model
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.22
 **/

import {merge, get} from 'lodash';

/*
const teamColorsOriginal = [
  'blue', 'brown', 'darkgreen', 'gold',
  'red', 'olive', 'peru', 'cyan',
  'indianred', 'khaki', 'greenyellow', 'plum',
  'skyblue', 'navy', 'darkred', 'lightsalmon',
  'lime', 'fuchsia', 'indigo', 'chocolate'
];
*/
// We're using HEX Values as the apexcharts does not understand all HTML names :-(
const teamColors = [
  '#0000FF', '#A52A2A', '#006400', '#FFD700',
  '#FF0000', '#808000', '#CD853F', '#00FFFF',
  '#CD5C5C', '#F0E68C', '#ADFF2F', '#DDA0DD',
  '#87CEEB', '#000080', '#8B0000', '#FFA07A',
  '#00FF00', '#FF00FF', '#4B0082', '#D2691E'
];

const MAX_TEAM_NB = 20;

class Team {
  /**
   * Creates a new team
   * @param team object with the data of the team model
   * @param index index of the team in the game, 1 based
   */
  constructor(team, index = -1) {
    merge(this, team);
    // Additional Data used
    this.internalName = 'team' + index.toLocaleString('de-ch', {minimumIntegerDigits: 2, useGrouping: false});
    this.name = get(team, 'data.name', 'none');
    this.setIndex(index);
  }

  /**
   * The index is __1__ based! First team is team 1, count it like normal people.
   * @param index
   */
  setIndex(index) {
    if (index < 0 || index > MAX_TEAM_NB) {
      console.error('team index out of range', index);
      return;
    }
    this.index = index;
    this.color = getTeamColor(index);
  }
}

/**
 * Returns the teams color
 * @param teamIndex
 * @returns {string}
 */
function getTeamColor(teamIndex) {
  if (teamIndex < teamColors.length) {
    return teamColors[teamIndex];
  }
  console.warn('Index for get TeamColor out of range', teamIndex);
  return 'black';
}


function getTeamColorArray() {
  return teamColors;
}

export {Team, getTeamColor, getTeamColorArray};
