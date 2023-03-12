/**
 * Reception specific data store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.22
 **/


import {createHelpers} from 'vuex-map-fields';

const {getReceptionField, updateReceptionField} = createHelpers({
  getterType  : 'getReceptionField',
  mutationType: 'updateReceptionField'
});

const Reception = {
  state    : () => ({
    panel       : 'panel-overview', // panel displayed
    menuElements: [
      {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview', active: true},
      {title: 'Anruf behandeln', href: '#', event: 'panel-change', eventParam: 'panel-call', active: false},
      {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map', active: false},
      {title: 'Bilder', href: '#', event: 'panel-change', eventParam: 'panel-pictures', active: false},
      {title: 'Statistik', href: '#', event: 'panel-change', eventParam: 'panel-statistic', active: false},
      {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting', active: false},
      {title: 'Chance/Kanzlei', href: '#', event: 'panel-change', eventParam: 'panel-chancellery', active: false},
      {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-properties', active: false},
      {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules', active: false}
    ]
  }),
  getters  : {
    getReceptionField,
  },
  mutations: {
    updateReceptionField,
    setPanel(state, panel) {
      console.log('changing Panel', panel);
      state.menuElements.forEach(e => {
        e.active = (e.eventParam === panel);
      })
      state.panel = panel;
    }
  }
}

export default Reception;
