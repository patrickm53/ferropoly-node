<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.03.22
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange")
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false")

    overview-root(v-if="panel==='panel-overview'")
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import ModalError from '../../common/components/modal-error/modal-error.vue';
import OverviewRoot from './overview/overview-root.vue';

export default {
  name: "SummaryRoot",
  components: {OverviewRoot, MenuBar, ModalError},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      menuElements   : 'summary.menuElements',
      panel          : 'summary.panel',
      error          : 'api.error',
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
