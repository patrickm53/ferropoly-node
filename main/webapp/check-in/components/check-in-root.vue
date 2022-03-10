<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange"
      :help-url="helpUrl"
      show-online-status=true
      :online="online")
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false"
    )
    overview-root(v-if="panel==='panel-overview'")
    accounting-root(v-if="panel==='panel-accounting'")
    property-root(v-if="panel==='panel-property'")
    rules-root(v-if="panel==='panel-rules'")
    map-root(v-if="panel==='panel-map'")
    pricelist-root(v-if="panel==='panel-pricelist'")

</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import ModalError from '../../common/components/modal-error/modal-error.vue';
import MapRoot from './map/map-root.vue';
import OverviewRoot from './overview/overview-root.vue';
import PricelistRoot from './pricelist/pricelist-root.vue';
import PropertyRoot from './property/property-root.vue';
import RulesRoot from './rules/rules-root.vue';
import AccountingRoot from './accounting/accounting-root.vue';

import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'CheckInRoot',
  components: {MenuBar, ModalError, MapRoot, OverviewRoot, PricelistRoot, PropertyRoot, RulesRoot, AccountingRoot},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      helpUrls: {
        'panel-overview'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-map'       : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-statistic' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-accounting': 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-pricelist' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-rules'     : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/'
      }
    };
  },
  computed  : {
    ...mapFields({
      menuElements   : 'checkin.menuElements',
      panel          : 'checkin.panel',
      online         : 'api.online',
      organisatorName: 'gameplay.owner.organisatorName',
      error          : 'api.error',
      authToken      : 'api.authToken'
    }),
    apiErrorActive: {
      get() {
        return this.error.active;
      },
      set() {
        this.$store.commit('resetApiError');
      }
    },
    apiErrorText() {
      return this.error.infoText;
    },
    apiErrorMessage() {
      return this.error.message;
    },
    helpUrl: {
      get() {
        return this.helpUrls[this.panel];
      }
    }
  },
  created   : function () {
  },
  methods   : {
    /**
     * Panel change from menu bar / component
     * @param panel
     */
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.$store.commit('setPanel', panel);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
