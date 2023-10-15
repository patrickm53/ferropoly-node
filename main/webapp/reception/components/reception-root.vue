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
    chance-root(v-if="panel==='panel-chancellery'")
    properties-root(v-if="panel==='panel-properties'")
    rules-root(v-if="panel==='panel-rules'")
    call-root(v-if="panel==='panel-call'")
    map-root(v-if="panel==='panel-map'")
    statistic-root(v-if="panel==='panel-statistic'")
    pictures-root(v-if="panel==='panel-pictures'")

</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import ModalError from '../../common/components/modal-error/modal-error.vue';
import {mapFields} from 'vuex-map-fields';
import OverviewRoot from './overview/overview-root.vue';
import AccountingRoot from './accounting/accounting-root.vue';
import ChanceRoot from './chance/chance-root.vue';
import PropertiesRoot from './properties/properties-root.vue';
import RulesRoot from './rules/rules-root.vue';
import CallRoot from './call/call-root.vue';
import MapRoot from '../../lib/components/travel-map/map-root.vue';
import StatisticRoot from './statistic/statistic-root.vue';

import {getAuthToken, verifyAuthToken} from '../../common/adapters/authToken';
import PicturesRoot from "./pictures/pictures-root.vue";

export default {
  name      : 'ReceptionRoot',
  components: {
    PicturesRoot,
    MenuBar,
    ModalError,
    OverviewRoot,
    AccountingRoot,
    ChanceRoot,
    StatisticRoot,
    PropertiesRoot,
    RulesRoot,
    CallRoot,
    MapRoot
  },
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      helpUrls: {
        'panel-overview'   : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/overview',
        'panel-call'       : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/call',
        'panel-map'        : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/map',
        'panel-pictures'   : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/pictures',
        'panel-statistic'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/statistic',
        'panel-accounting' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/accounting',
        'panel-chancellery': 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/chancellery',
        'panel-properties' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/pricelist',
        'panel-rules'      : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/rules'
      }
    };
  },
  computed  : {
    ...mapFields({
      menuElements   : 'reception.menuElements',
      panel          : 'reception.panel',
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
    getAuthToken((err, token) => {
      if (err) {
        console.error('authToken error update 1', err);
        return;
      }
      console.log(`authToken update from ${this.authToken} to ${token}`);
      this.authToken = token;

      // Verify it! See issue #20, some times this did not work
      verifyAuthToken(this.authToken, err => {
        if (err) {
          console.warn('authToken Error, this should not happen', this.authToken);
          getAuthToken((err, token) => {
            if (err) {
              console.error('authToken error update 2', err);
              return;
            }
            console.log(`authToken update 2 from ${this.authToken} to ${token}`);
            this.authToken = token;
          })
        } else {
          console.log('authToken verification is OK');
        }
      });
    })
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
