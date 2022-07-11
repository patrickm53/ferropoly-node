/**
 * Mixin for input controls with the commons
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.08.21
 **/

export default {
  props: {
    label   : {
      type   : String,
      default: () => {
        return null;
      }
    },
    help    : {
      type   : String,
      default: () => {
        return null;
      }
    },
    feedback: {
      type   : String,
      default: () => {
        return null;
      }
    }
  },
  computed: {
    /**
     * Generates a unique ID of the control
     * @returns {string}
     */
    id() {
      return `ferro-${this._uid}`;
    }
  }
};
