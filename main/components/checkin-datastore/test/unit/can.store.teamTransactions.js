/**
 * Team Transactions tests
 * Created by kc on 16.01.16.
 */

'use strict';

var expect  = require('expect.js');
var actions = require('../../lib/actions');
var store   = require('../../index');

describe('can store team account assets in the datastore', function () {
  it('should return the value stored', function () {
    store.dataStore.dispatch(actions.teamAccount.setAsset(400));
    expect(store.dataStore.getTeamAccount().asset).to.be(400);
  });

  it('should return the value updated', function () {
    store.dataStore.dispatch(actions.teamAccount.setAsset(600));
    expect(store.dataStore.getTeamAccount().asset).to.be(600);
  });

  it('should add a value', function () {
    store.dataStore.dispatch(actions.teamAccount.addTransaction({transaction: {amount: 50}}));
    expect(store.dataStore.getTeamAccount().asset).to.be(650);
  });

  it('should inform that a value changed', function (done) {
    store.dataStore.subscribe('teamAccount', function (data) {
      expect(data.asset).to.be(5000);
      done();
    });
    store.dataStore.dispatch(actions.teamAccount.setAsset(5000));
  });
});
