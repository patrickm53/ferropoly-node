<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      :show-user-box=false
      @panel-change="onPanelChange"
    )
    b-container(fluid)
      info-basic-root(v-if="panel==='info'")
      info-map-root(v-if="panel==='map'")
      info-pricelist-root(v-if="panel==='pricelist'")
      info-rules-root(v-if="panel==='rules'")

</template>

<script>
import InfoBasicRoot from './info/info-basic-root.vue'
import InfoMapRoot from './map/info-map-root.vue'
import InfoPricelistRoot from './pricelist/info-pricelist-root.vue'
import InfoRulesRoot from './rules/info-rules-root.vue'
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import {last, split} from 'lodash';

export default {
  name      : 'GameInfoRoot',
  components: {InfoBasicRoot, InfoMapRoot, InfoPricelistRoot, MenuBar, InfoRulesRoot},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      menuElements: [
        /* 0 */  {title: 'Info', href: '#', event: 'panel-change', eventParam: 'info'},
        /* 1 */{
          title     : 'Preisliste',
          href      : '#',
          event     : 'panel-change',
          eventParam: 'pricelist'
        },
        /* 2 */  {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'map'},
        /* 3 */  {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'rules'},
      ],
      panel       : 'info',
    };
  },
  computed  : {

  },
  created   : function () {
    const elements = split(window.location.pathname, '/');
    let gameId     = last(elements);
    this.$store.dispatch('fetchData', {gameId});
  },
  methods   : {
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.panel = panel;
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
