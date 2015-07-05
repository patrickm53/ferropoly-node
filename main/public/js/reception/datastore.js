/**
 * Datastore for the ferropoly reception client
 *
 * lodash is required
 *
 * this.data contains:
 * - teams:                  static, do not change during the game
 * - gameplay:               static, all info about the current GP
 * - pricelist:              changing, all properties of the pricelist
 * - teamAccountEntries:     changing, all entries of all team accounts
 * - chancelleryEntries:     changing, data of the chancellery
 * - propertyAccountEntries: changing, all entries of the propertiesAccount
 * - events:                 changing, events of a team (local data only)
 * - authToken:              static, the authorisation token for the api
 * - rankingList:            changing, the ranking list of the game
 * - incomeList:             changing (stats), income of all teams
 * - travelLog:              changing, the log where the team was
 *
 * The data is alway held in this store, updating is triggered by the application.
 *
 * Created by kc on 14.05.15.
 */
'use strict';

var DataStore = function (initData, socket) {

  this.data = initData;
  this.data.events = {};
  this.socket = socket;
  var self = this;

  this.teamColors = [
    'blue', 'brown', 'darkgreen', 'gold', 'red', 'olive', 'peru', 'cyan', 'indianred', 'khaki',
    'greenyellow', 'plum', 'skyblue', 'navy', 'darkred', 'lightsalmon', 'lime', 'fuchsia', 'indigo', 'chocolate'
  ];

  // Incoming team account messages
  this.socket.on('teamAccount', function (resp) {
    console.log('onTeamAccount: ' + resp.cmd);
    switch (resp.cmd) {
      case 'onTransaction':
        if (!self.data.teamAccountEntries) {
          self.data.teamAccountEntries = [];
        }
        self.data.teamAccountEntries.push(resp.data);
        console.log('received new team transaction');
        break;
      default:
        console.log('UNHANDLED: ' + resp.cmd);
        break;
    }
  });

  // Incoming Property Account Messages
  this.socket.on('propertyAccount', function (ind) {
    switch (ind.cmd) {
      case 'propertyBought':
      case 'buildingBuilt':
        var i = _.findIndex(self.data.pricelist, {uuid: ind.property.uuid});
        self.data.pricelist[i] = ind.property;
        console.log('Property account, updated: ' + i + '(' + ind.cmd + ')');
        break;

      default:
        console.log('UNHANDLED: ' + ind.cmd);
        break;
    }

  });

  // Incoming Chancellery Messages
  this.socket.on('chancelleryAccount', function (resp) {
    console.log('UNHANDLED: ' + resp);
  });

  // Incoming Properties messages
  this.socket.on('properties', function (resp) {
    console.log('onProperties');
    console.log(resp);
    switch (resp.cmd) {
      case 'getProperties':
        console.log('Pricelist updated, properties: ' + resp.data.length);
        self.data.pricelist = resp.data;
        break;
    }
  });

  // Incoming marketplace messages
  this.socket.on('marketplace', function (info) {
    console.log('onMarketplace: ' + info.cmd);
    console.log(info);
    switch (info.cmd) {
      case 'buyProperty':
        if (info.result.property) {
          self.updatePropertyInPricelist(info.result.property);
        }
        break;
    }
  });
};
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

/**
 * Updates the travel log
 * @param teamId
 * @param callback
 */
DataStore.prototype.updateTravelLog = function (teamId, callback) {
  console.log('update travel log for ' + teamId);
  var self = this;
  // see https://api.jquery.com/jquery.get/
  $.get('/travellog/' + this.getGameplay().internal.gameId + '/' + teamId, function (data) {
    if (data.status === 'ok') {
      console.log('/travellog ok');
      if (!teamId) {
        // All entries were retrieved, replace them completely
        self.data.travelLog = data.travelLog;
      }
      else {
        if (!self.data.travelLog) {
          self.data.travelLog = [];
        }
        // replace all entries for this team with the received one
        _.remove(self.data.travelLog, function (e) {
          return e.teamId === teamId;
        });
        for (var i = 0; i < data.travelLog.length; i++) {
          self.data.travelLog.push(data.travelLog[i]);
        }
      }
      // Sort entries, independently how we got them
      _.sortBy(self.data.travelLog, function (e) {
        return e.timestamp;
      });
    }
    else {
      console.error('ERROR when getting travelLog:');
      console.log(data);
    }
  })
    .fail(function (data) {
      console.error('ERROR when getting travelLog (2):');
      console.log(data);
    })
    .always(function () {
      console.log('travelLog.always()');
      if (callback) {
        callback();
      }
    })
};

/**
 * Gets the travel log for one team (or all, if teamId is undefined)
 * @param teamId
 */
DataStore.prototype.getTravelLog = function (teamId) {
  console.log('getTravelLog for: ' + teamId);
  if (!this.data.travelLog) {
    this.data.travelLog = [];
  }

  if (!teamId) {
    return this.data.travelLog;
  }
  return _.filter(this.data.travelLog, function (n) {
    return n.teamId === teamId;
  });
};

/**
 * Returns the trave log for a property (who was there when)
 * @param propertyId
 */
DataStore.prototype.getTravelLogForProperty = function(propertyId) {
  console.log('getTravelLogForProperty for: ' + propertyId);
  if (!this.data.travelLog) {
    this.data.travelLog = [];
  }

  var propLog = _.filter(this.data.travelLog, function (n) {
    return n.propertyId === propertyId;
  });
  return _.sortBy(propLog, 'timestamp');
};

/**
 * Returns the gameplay
 * @returns {gameplay|*|result.gameplay|gameData.gameplay|$scope.gameplay}
 */
DataStore.prototype.getGameplay = function () {
  return this.data.gameplay;
};

/**
 * Checks whether a game is active or not
 * @returns {boolean}
 */
DataStore.prototype.isGameActive = function() {
  var start = moment(this.data.gameplay.scheduling.gameStartTs);
  var end = moment(this.data.gameplay.scheduling.gameEndTs);
  if (moment().isAfter(end)) {
    console.log('Game over');
    return false;
  }
  if (moment().isBefore(start)) {
    console.log('Game not started yet');
    return false;
  }
  return true;
};
/**
 * Updates the team account entries.
 * @param teamId  ID of the team, undefined updates for all
 * @param callback optional callback, called when data is available
 */
DataStore.prototype.updateTeamAccountEntries = function (teamId, callback) {
  console.log('update team account for ' + teamId);
  var self = this;
  // see https://api.jquery.com/jquery.get/
  $.get('/teamAccount/get/' + this.getGameplay().internal.gameId + '/' + teamId, function (data) {
    if (data.status === 'ok') {
      console.log('/teamAccount ok');
      if (!teamId) {
        // All entries were retrieved, replace them completely
        self.data.teamAccountEntries = data.accountData;
      }
      else {
        if (!self.data.teamAccountEntries) {
          self.data.teamAccountEntries = [];
        }
        // replace all entries for this team with the received one
        _.remove(self.data.teamAccountEntries, function (e) {
          return e.teamId === teamId;
        });
        for (var i = 0; i < data.accountData.length; i++) {
          self.data.teamAccountEntries.push(data.accountData[i]);
        }
      }
      // Sort entries, independently how we got them
      _.sortBy(self.data.teamAccountEntries, function (e) {
        return e.timestamp;
      });
    }
    else {
      console.error('ERROR when getting accountData:');
      console.log(data);
    }
  })
    .fail(function (data) {
      console.error('ERROR when getting accountData (2):');
      console.log(data);
    })
    .always(function () {
      console.log('updateTeamAccountEntries.always()');
      if (callback) {
        callback();
      }
    })
};
/**
 * Get the team account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getTeamAccountEntries = function (teamId) {
  console.log('getTeamAccountEntries for: ' + teamId);
  if (!this.data.teamAccountEntries) {
    this.data.teamAccountEntries = [];
  }

  if (!teamId) {
    return this.data.teamAccountEntries;
  }
  return _.filter(this.data.teamAccountEntries, function (n) {
    return n.teamId === teamId;
  });
};
/**
 * Get the balance of the team
 * @param teamId
 */
DataStore.prototype.getTeamAccountBalance = function (teamId) {
  var entries = this.getTeamAccountEntries(teamId);
  var balance = 0;
  for (var i = 0; i < entries.length; i++) {
    balance += entries[i].transaction.amount;
  }
  return balance;
};
/**
 * Updates the property account entries. (ACCOUNT, not the Properties!)
 * @param propertyId  ID of the property, undefined updates for all
 */
DataStore.prototype.updatePropertyAccountEntries = function (propertyId) {
  console.log('update property account for ' + propertyId);
  // So far we update all, optimize it later
  this.socket.emit('propertyAccount', {cmd: 'getAccountStatement', propertyId: propertyId})
};
/**
 * Get the property account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getPropertyAccountEntries = function (teamId) {
  if (!teamId) {
    return this.data.propertyAccountEntries;
  }
  return _.filter(this.data.propertyAccountEntries, function (n) {
    return n.transaction.origin.uuid === teamId;
  });
};
/**
 * Updates the team account entries.
 */
DataStore.prototype.updateChancellery = function (callback) {
  // obsolete:  this.socket.emit('chancelleryAccount', {cmd: 'getAccountStatement'})
  var self = this;
  console.log('update chancellery');

  // see https://api.jquery.com/jquery.get/
  $.get('/chancellery/account/statement/' + this.getGameplay().internal.gameId, function (data) {
    if (data.status === 'ok') {
      self.data.chancelleryEntries = data.entries;
    }
    else {
      console.log('ERROR when getting chancellery data:');
      console.log(data);
      self.data.chancelleryEntries = [];
    }
    if (callback) {
      callback();
    }
  })
    .fail(function (data) {
      console.log('ERROR when getting chancellery data (2):');
      console.log(data);
      self.data.chancelleryEntries = [];
      if (callback) {
        callback();
      }
    });
};
/**
 * Get the chancellery entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getChancelleryEntries = function (teamId) {
  if (!teamId) {
    return this.data.chancelleryEntries;
  }
  return _.filter(this.data.chancelleryEntries, function (n) {
    return n.transaction.origin.uuid === teamId;
  });
};

DataStore.prototype.getChancelleryAsset = function() {
  return _.sum(this.data.chancelleryEntries, 'transaction.amount');
};
/**
 * Updates the pricelist (complete or the only for the user supplied)
 * @param teamId  ID of the team, undefined updates for all
 */
DataStore.prototype.updateProperties = function (teamId, callback) {
  var self = this;
  console.log('update pricelist for ' + teamId);

  // see https://api.jquery.com/jquery.get/
  $.get('/properties/get/' + this.getGameplay().internal.gameId + '/' + teamId, function (data) {
    if (data.status === 'ok') {
      for (var i = 0; i < data.properties.length; i++) {
        self.updatePropertyInPricelist(data.properties[i]);
      }
    }
    else {
      console.log('ERROR when getting properties:');
      console.log(data);
    }
    if (callback) {
      callback();
    }
  })
    .fail(function (data) {
      console.log('ERROR when getting properties (2):');
      console.log(data);
      if (callback) {
        callback();
      }
    });

};
/**
 * Updates a received property in the pricelist
 * @param property
 */
DataStore.prototype.updatePropertyInPricelist = function (property) {
  if (property && property.uuid) {
    var i = _.findIndex(this.data.pricelist, {uuid: property.uuid});
    if (i > -1) {
      this.data.pricelist[i] = property;
    }
  }
};

/**
 * Get the properties belonging to a team
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getProperties = function (teamId) {
  if (!teamId) {
    return this.data.pricelist;
  }
  return _.filter(this.data.pricelist, function (n) {
    if (!n.gamedata) {
      return false;
    }
    return n.gamedata.owner === teamId;
  });
};
/**
 * Returns the free properties
 */
DataStore.prototype.getFreeProperties = function () {
  return _.filter(this.data.pricelist, function (n) {
    if (!n.gamedata) {
      return true;
    }
    return !n.gamedata.owner;
  });
};
/**
 * Run query over properties, full text
 * @param query String to query
 * @param limit max number of elements to be returned
 * @returns {Array}
 */
DataStore.prototype.searchProperties = function (query, limit) {
  console.log('Query: "' + query + '" Limit: ' + limit);
  if (!query || query.length === 0) {
    return [];
  }
  var items = _.filter(this.data.pricelist, function (p) {
    return p.location.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
  });
  return _.slice(items, 0, limit);
};

/**
 * Returns the property data by providing its id
 * @param propertyId
 * @returns {*}
 */
DataStore.prototype.getPropertyById = function (propertyId) {
  return _.find(this.data.pricelist, {uuid: propertyId});
};

/**
 * Returns the center of the map
 */
DataStore.prototype.getMapCenter = function () {
  var latSum = 0, lngSum = 0;
  for (var i = 0; i < this.data.pricelist.length; i++) {
    latSum += parseFloat(this.data.pricelist[i].location.position.lat);
    lngSum += parseFloat(this.data.pricelist[i].location.position.lng);
  }
  return {lat: latSum / this.data.pricelist.length, lng: lngSum / this.data.pricelist.length};
};
/**
 * Pushes an event for a given team onto the event stack
 * @param teamId
 * @param eventText
 */
DataStore.prototype.pushEvent = function (teamId, eventText) {
  if (!this.data.events[teamId]) {
    this.data.events[teamId] = [];
  }
  this.data.events[teamId].push({ts: new Date(), message: eventText});
};

/**
 * Get the events for a given team
 * @param teamId
 * @returns {*}
 */
DataStore.prototype.getEvents = function (teamId) {
  if (!this.data.events[teamId]) {
    this.data.events[teamId] = [];
  }
  return this.data.events[teamId];
};
/**
 * Returns the authToken needed for POST requests
 * @returns {authToken|*|ferropoly.authToken|.session.authToken}
 */
DataStore.prototype.getAuthToken = function () {
  return this.data.authToken;
};
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

var dataStore = new DataStore(ferropoly, ferropolySocket); // ferropoly is defined in the main view
