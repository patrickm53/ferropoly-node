/**
 * Creating statistics out of the datastore (which does probably not fit into other modules)
 * Created by kc on 11.12.15.
 */

/**
 * Get the current ranking list
 * @param callback
 */
DataStore.prototype.getRankingList = function (callback) {
  var self = this;
  console.log('start query for ranking list');
  // see https://api.jquery.com/jquery.get/
  $.get('/statistics/rankingList/' + this.getGameplay().internal.gameId, function (data) {
      if (data.status === 'ok') {
        for (var i = 0; i < data.ranking.length; i++) {
          data.ranking[i].teamName = self.teamIdToTeamName(data.ranking[i].teamId);
        }
        self.data.rankingList = data.ranking;
        return callback(null, self.data.rankingList);
      }
      else {
        self.data.rankingList = [];
        return callback(new Error(data.message));
      }
    })
    .fail(function (error) {
      callback(error);
    });
};

/**
 * Get the current income list
 * @param callback
 */
DataStore.prototype.getIncomeList = function (callback) {
  var self = this;
  console.log('start query for ranking list');
  $.get('/statistics/income/' + this.getGameplay().internal.gameId, function (data) {
      if (data.status === 'ok') {
        for (var i = 0; i < data.info.length; i++) {
          data.info[i].teamName = self.teamIdToTeamName(data.info[i].teamId);
        }
        self.data.incomeList = data.info;
        return callback(null, self.data.incomeList);
      }
      else {
        self.data.incomeList = [];
        return callback(new Error(data.message));
      }
    })
    .fail(function (error) {
      callback(error);
    });
};
