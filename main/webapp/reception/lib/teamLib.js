/**
 * Library functions for teams
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/

const teamColors = [
  'blue', 'brown', 'darkgreen', 'gold', 'red', 'olive', 'peru', 'cyan', 'indianred', 'khaki',
  'greenyellow', 'plum', 'skyblue', 'navy', 'darkred', 'lightsalmon', 'lime', 'fuchsia', 'indigo', 'chocolate'
];

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

export {getTeamColor};
