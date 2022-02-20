/**
 * Library functions for teams
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/

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
