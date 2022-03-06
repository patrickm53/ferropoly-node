/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.22
 **/


import {createHelpers} from 'vuex-map-fields';

const {getStatisticField, updateStatisticField} = createHelpers({
  getterType  : 'getStatisticField',
  mutationType: 'updateStatisticField'
});

const Statistic = {
  state    : () => ({
    navBar    : [
      {title: 'Vermögen', event: 'nav-event', eventParam: 'nav-asset', active: true},
      {title: 'Vermögensverlauf', event: 'nav-event', eventParam: 'nav-asset-history', active: false},
      {title: 'Einkommen', event: 'nav-event', eventParam: 'nav-income', active: false},
    ],
    currentNav: 'nav-asset'
  }),
  getters  : {
    getStatisticField,
  },
  mutations: {
    updateStatisticField
  }
}

export default Statistic;
