/**
 * Mixin for the formValidator injection into a component
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.08.21
 **/

import FormValidator from './formValidator';

export default {
  data   : function () {
    this._formValidator = new FormValidator();
    this.formDataIsValid  = false;
  },
  methods: {
    /**
     * This is the event handler for the @state event
     * @param e
     */
    onState(e) {
      this._formValidator.validate(e);
      this.formDataIsValid = this._formValidator.isValid();
      // We send a consolidated event further, this Mixin
      // can be used in a cascade
      this.$emit('state', {
        id   : `${this.$options.name}-${this._uid}`,
        state: this.isFormValid()
      });
    },
    /**
     * Returns true if the form is valid
     * @returns {boolean}
     */
    isFormValid() {
      return this._formValidator.isValid();
    },
    /**
     * Returns true if the form is invalid
     * @returns {boolean}
     */
    isFormInvalid() {
      return !this._formValidator.isValid();
    }
  }
};
