/**
 * This is the container for one single transaction in a team account. Basically,
 * this is the same object as defined in the TeamAccountTransaction of the models
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.22
 **/
import {merge} from 'lodash';

class TeamAccountTransaction {
  constructor(entry) {
    this.teamId      = undefined;
    this.transaction = undefined;
    merge(this, entry);
    this.balance = 0;
  }
}

export {TeamAccountTransaction};
