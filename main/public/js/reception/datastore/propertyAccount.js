/**
 * Datastore property account
 * Created by kc on 11.12.15.
 */

/**
 * Updates the property account entries. (ACCOUNT, not the Properties!)
 * @param propertyId  ID of the property, undefined updates for all
 */
DataStore.prototype.updatePropertyAccountEntries = function (propertyId) {
  console.log('update property account for ' + propertyId);
  // So far we update all, optimize it later
  console.warn('There is a todo in updatePropertyAccountEntries: use GET request');
  this.socket.emit('admin-propertyAccount', {cmd: 'getAccountStatement', propertyId: propertyId})
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
