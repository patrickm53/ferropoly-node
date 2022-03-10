/**
 * Check-In specific stuff
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.03.22
 **/


import {createHelpers} from 'vuex-map-fields';

const {getCheckInField, updateCheckInField} = createHelpers({
  getterType  : 'getCheckInField',
  mutationType: 'updateCheckInField'
});

const CheckIn = {
  state    : () => ({
    panel       : 'panel-overview', // panel displayed
    menuElements: [
      {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview', active: true},
      {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map', active: false},
      {title: 'Besitz', href: '#', event: 'panel-change', eventParam: 'panel-property', active: false},
      {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting', active: false},
      {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-pricelist', active: false},
      {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules', active: false}
    ]
  }),
  getters  : {
    getCheckInField,
  },
  mutations: {
    updateCheckInField,
    setPanel(state, panel) {
      console.log('changing Panel', panel);
      state.menuElements.forEach(e => {
        e.active = (e.eventParam === panel);
      })
      state.panel = panel;
    }
  }
}

export default CheckIn;
