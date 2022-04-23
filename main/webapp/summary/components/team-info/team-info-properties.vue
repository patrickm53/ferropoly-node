<!---
  The teams properties
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.04.22
-->
<template lang="pug">
  div
    b-row
      b-col(xs="12" md="6")
        ferro-card.mt-2(title="Orte" size="xs")
          b-table(
            hover
            small
            borderless
            striped
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            sort-icon-left
            responsive="sm"
            :items="properties"
            :fields="fields")
            template(#cell(price)="data") {{data.item.price | formatPrice}}
            template(#cell(boughtTs)="data") {{data.item.boughtTs | formatTime}}


</template>

<script>
import {formatPrice, formatTime} from '../../../common/lib/formatters';
import {get} from 'lodash';
import {DateTime} from 'luxon';
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';

export default {
  name      : 'TeamInfoProperties',
  components: {FerroCard},
  filters   : {formatPrice, formatTime},
  mixins    : [],
  model     : {},
  props     : {
    teamId: {
      type   : String,
      default: () => {
        return 'none'
      }
    }
  },
  data      : function () {
    return {
      sortBy  : 'boughtTs',
      sortDesc: false,
      fields  : [
        {key: 'name', label: 'Ort'},
        {key: 'price', label: 'Preis'},
        {key: 'boughtTs', label: 'Kaufzeit'},
        {key: 'buildings', label: 'Häuser'}
      ]
    };
  },
  computed  : {
    properties() {
      let props    = this.$store.getters['propertyRegister/getPropertiesForTeam'](this.teamId);
      let elements = [];
      props.forEach(p => {
        elements.push({
          name     : get(p, 'location.name', 'unbekannt'),
          boughtTs : get(p, 'gamedata.boughtTs', DateTime.now()),
          buildings: get(p, 'gamedata.buildings', 0),
          price    : get(p, 'pricelist.price', 0)
        })
      });
      return elements;
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
