/**
 * Store tests for chancellery
 * Created by kc on 12.01.16.
 */

'use strict';

var expect = require('expect.js');
var actions = require('../../lib/actions');
var store = require('../../index');

describe('can store chancellery assets in the datastore', function () {
  it('should return the value stored', function () {
    store.dataStore.dispatch(actions.chancellery.setAsset(400));
    expect(store.dataStore.getChancellery().asset).to.be(400);
  });

  it('should return the value updated', function () {
    store.dataStore.dispatch(actions.chancellery.setAsset(600));
    expect(store.dataStore.getChancellery().asset).to.be(600);
  });

  it('should inform that a value changed', function(done) {
    store.dataStore.subscribe('chancellery', function(data) {
      expect(data.asset).to.be(5000);
      done();
    });
    store.dataStore.dispatch(actions.chancellery.setAsset(5000));
  });
});
