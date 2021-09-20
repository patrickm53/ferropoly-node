/**
 * Form Validator for Ferropoly input controls
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.08.21
 **/

import {forOwn} from 'lodash';

class FormValidator {
  /**
   * Constructor
   */
  constructor() {
    this.controls = {};
  }

  /**
   * Event handler for the 'state' event for all inputs
   * @param event must have the id and state value
   */
  validate(event) {
    this.controls[event.id] = event.state;
  }

  /**
   * Returns true if all data is valid, otherwise false
   * @returns {boolean}
   */
  isValid() {
    let retVal = true;
    forOwn(this.controls, (value) => {
      if (!value) {
        retVal = false;
      }
    });
    return retVal;
  }
}

export default FormValidator;
