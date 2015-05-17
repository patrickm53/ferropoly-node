/**
 * Information about an active call, used in all views (panels)
 * Created by kc on 16.05.15.
 */
'use strict';

var ActiveCall = function() {
  this.currentTeam = undefined;

};

ActiveCall.prototype.getCurrentTeam = function() {
  return this.currentTeam;
};

ActiveCall.prototype.setCurrentTeam = function(team) {
  this.currentTeam = team;
};

ActiveCall.prototype.finish = function() {
  this.currentTeam = undefined;
};

ActiveCall.prototype.isActive = function() {
  return this.currentTeam !== undefined;
};
var activeCall = new ActiveCall();
