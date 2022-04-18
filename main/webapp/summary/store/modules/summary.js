/**
 * Summary Store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 18.04.22
 **/


import {createHelpers} from 'vuex-map-fields';

const {getSummaryField, updateSummaryField} = createHelpers({
  getterType  : 'getSummaryField',
  mutationType: 'updateSummaryField'
});

const Summary = {
  state    : () => ({
    panel       : 'panel-overview', // panel displayed
    menuElements: [
      {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview', active: true},
      {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map', active: false},
      {title: 'Chance/Kanzlei', href: '#', event: 'panel-change', eventParam: 'panel-chancellery', active: false},
    ]
  }),
  getters  : {
    getSummaryField,
  },
  mutations: {
    updateSummaryField,
    setPanel(state, panel) {
      console.log('changing Panel', panel);
      state.menuElements.forEach(e => {
        e.active = (e.eventParam === panel);
      })
      state.panel = panel;
    }
  }
}

export default Summary;
