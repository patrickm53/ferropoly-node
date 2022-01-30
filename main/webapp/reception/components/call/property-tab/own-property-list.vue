<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.01.22
-->
<template lang="pug">
  #own-property-list
    b-table(
      striped
      small
      sort-icon-left
      :items="properties"
      :fields="fields"
      :filter="teamId"
      responsive="sm"
      )
      template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
      template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}
      template(#cell(gamedata.buildings)="data")
        span(v-if="data.item.gamedata.buildings === 0") unbebaut
        span(v-if="data.item.gamedata.buildings === 1") 1 Haus
        span(v-if="data.item.gamedata.buildings === 2") 2 Häuser
        span(v-if="data.item.gamedata.buildings === 3") 3 Häuser
        span(v-if="data.item.gamedata.buildings === 4") 4 Häuser
        span(v-if="data.item.gamedata.buildings === 5") Hotel
      template(#cell(gamedata)="data")
        span(v-if="!data.item.gamedata.buildingEnabled") nicht möglich
        b-button(v-if="data.item.gamedata.buildingEnabled" variant="dark" size="sm" @click="onBuyHouseClick(data.item)" :disabled="buyingDisabled") bauen für {{data.item.pricelist.pricePerHouse | formatPrice}}

</template>

<script>
import {formatPrice} from '../../../../common/lib/formatters';

export default {
  name      : 'OwnPropertyList',
  components: {},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {
    teamId    : {
      type   : String,
      default: () => {
        return 'none';
      }
    },
    properties: {
      type   : Array,
      default: () => {
        return [];
      }
    },
    buyingDisabled: {
      type   : Boolean,
      default: () => {
        return false;
      }
    }
  },
  data      : function () {
    return {
      fields: [
        {key: 'location.name', label: 'Ort', sortable: true},
        {key: 'pricelist.position', label: 'Pos', sortable: true},
        {key: 'pricelist.price', label: 'Kaufpreis', sortable: true},
        {key: 'gamedata.buildings', label: 'Häuser', sortable: true},
        {key: 'gamedata', label: 'Hausbau', sortable: true},
      ]
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onBuyHouseClick(property) {
      console.log(`Buy house for ${property}`);
      this.$emit('buy-house', property)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
