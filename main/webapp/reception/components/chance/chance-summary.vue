<!---
  Just a summary of chancellery
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.12.21
-->
<template lang="pug">
  div
    ferro-card(title="Übersicht")
      b-table-simple(small)
        b-tbody
          b-tr
            b-td Anzahl Einträge
            b-td {{list.length}}
          b-tr
            b-td Kontostand
            b-td {{asset | formatPrice}}


</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';
import {formatPrice} from '../../../common/lib/formatters';
export default {
  name      : 'ChanceSummary',
  components: {FerroCard},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      list: 'chancellery.list'
    }),
    asset() {
      return this.$store.getters.asset;
    }
  },
  created   : function () {
    this.$store.dispatch('updateChancellery');
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
