<!---
  Root Element of the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.12.21
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange"
      :help-url="helpUrl")
    h1 {{panel}}
</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import {last, split} from 'lodash';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'ReceptionRoot',
  components: {MenuBar},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      menuElements: [
        {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview'},
        {title: 'Anruf behandeln', href: '#', event: 'panel-change', eventParam: 'panel-call'},
        {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map'},
        {title: 'Statistik', href: '#', event: 'panel-change', eventParam: 'panel-statistic'},
        {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting'},
        {title: 'Chance/Kanzlei', href: '#', event: 'panel-change', eventParam: 'panel-chance'},
        {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-pricelist'},
        {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules'}
      ],
      helpUrls    : {
        'panel-overview'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-call'      : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-map'       : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-statistic' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-accounting': 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-chance'    : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-pricelist' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-rules'     : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/'
      }
    };
  },
  computed  : {
    ...mapFields([
      'gameId',
      'panel'
    ]),
    helpUrl        : {
      get() {
        return this.helpUrls[this.panel];
      }
    }
  },
  created   : function () {
    // Retrieve GameId for this page
    const elements = split(window.location.pathname, '/');
    this.gameId    = last(elements);
  },
  methods   : {
    /**
     * Panel change from menu bar / component
     * @param panel
     */
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.panel = panel;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
