/**
 * Testing the propertyAccount functionality of the datastore
 * Created by kc on 20.01.16.
 */


var expect  = require('expect.js');
var actions = require('../../lib/actions').propertyAccount;
var store   = require('../../index');
var _       = require('lodash');

describe('can store property account assets in the datastore', function () {
  it('should return the values stored', function () {
    store.dataStore.dispatch(actions.setProperties([{uuid: 1, name: 'one'}, {uuid: 2, name: 'two'}]));
    expect(store.dataStore.getProperties().properties.length).to.be(2);
  });

  it('should overwrite the values stored', function () {
    store.dataStore.dispatch(actions.setProperties([{uuid: 3, name: 'three'}, {uuid: 4, name: 'four'}]));
    expect(store.dataStore.getProperties().properties.length).to.be(2);
    expect(store.dataStore.getProperties().properties[0].uuid).to.be(3);
  });

  it('should attach a new property', function () {
    store.dataStore.dispatch(actions.updateProperty({uuid: 5, name: 'five'}));
    expect(store.dataStore.getProperties().properties.length).to.be(3);
  });

  it('should update an existing property', function () {
    store.dataStore.dispatch(actions.updateProperty({uuid: 4, name: 'vier'}));
    var props = store.dataStore.getProperties().properties;
    expect(props.length).to.be(3);
    expect(_.find(props, {uuid: 4}).name).to.be('vier');
  });

});
