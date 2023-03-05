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
    panel           : 'panel-pictures', //'panel-overview', // panel displayed,
    team            : {
      uuid: 'x',
      data: {
        name: ''
      }
    },
    menuElements    : [
      {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview', active: true},
      {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map', active: false},
      {title: 'Bild senden', href: '#', event: 'panel-change', eventParam: 'panel-pictures', active: false},
      {title: 'Besitz', href: '#', event: 'panel-change', eventParam: 'panel-property', active: false},
      {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting', active: false},
      {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-pricelist', active: false},
      {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules', active: false}
    ],
    asset           : 0,
    chancelleryAsset: 0,
    nbProperties    : 0,
    propertyValue   : 0,
    gps             : {
      usageAllowed: false,
      active      : true
    }
  }),
  getters  : {
    getCheckInField
  },
  mutations: {
    updateCheckInField,
    setPanel(state, panel) {
      state.menuElements.forEach(e => {
        e.active = (e.eventParam === panel);
      })
      state.panel = panel;
    },
  },
  actions  : {
    setChancelleryAsset({state}, options) {
      console.log('setChancelleryAsset', options);
      state.chancelleryAsset = options.asset;
    },
    updatePropertyNb({state, rootGetters}) {
      state.nbProperties  = rootGetters['propertyRegister/getNbOfPropertiesOfTeam'](state.team.uuid);
      state.propertyValue = rootGetters['propertyRegister/getRegister'].evaluatePropertyValueForTeam(state.team.uuid);
    }
  }
}

export default CheckIn;
