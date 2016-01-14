/**
 * Store tests for chancellery
 * Created by kc on 12.01.16.
 */

'use strict';

var expect = require('expect.js');

var store = require('../../index');

describe('can store chancellery assets in the datastore', function () {
  it('should return the value stored', function () {
    store.dataStore.dispatch(store.actions.chancellery.setAsset(400));
    expect(store.dataStore.getChancellery().asset).to.be(400);
  });
  it('should return the value updated', function () {
    store.dataStore.dispatch(store.actions.chancellery.setAsset(600));
    expect(store.dataStore.getChancellery().asset).to.be(600);
  });
});
