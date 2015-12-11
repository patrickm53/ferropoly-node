/**
 * The teams part of the data store
 * Created by kc on 11.12.15.
 */

/**
 * Get all teams
 * @returns {teams|*|gameData.teams|$scope.teams|result.teams|Array}
 */
DataStore.prototype.getTeams = function () {
  return this.data.teams;
};
/**
 * Returns the color of the team
 * @param teamId
 * @returns {*}
 */
DataStore.prototype.getTeamColor = function (teamId) {
  var index = _.findIndex(this.data.teams, {'uuid': teamId});
  if (index > -1 && index < this.teamColors.length) {
    return this.teamColors[index];
  }
  return 'black';
};
/**
 * Converts the teamId to the teams name
 * @param teamId
 * @returns {*}
 */
DataStore.prototype.teamIdToTeamName = function (teamId) {
  // Do not access data.teams directly as the 'this' context would be wrong
  return _.result(_.find(dataStore.getTeams(), {uuid: teamId}), 'data.name');
};
