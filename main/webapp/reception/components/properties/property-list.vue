<!---
  This is a special price list, not like the one in the common folder: it is tailored for the
  reception and contains therefore a few "goodies" while stripping away some unused parts.
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  div
    b-table(striped
      small
      :items="properties"
      :fields="fields"
      responsive="sm"
      @row-clicked="onRowClicked")
      // eslint-disable-next-line vue/valid-v-slot
      template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
      template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}

</template>

<script>

import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'PropertyList',
  components: {},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {
    properties: {
      type   : Array,
      default: function () {
        return [];
      }
    }
  },
  data      : function () {
    return {
      fields: [
        {key: 'pricelist.position', label: 'Pos', sortable: true},
        {key: 'location.name', label: 'Ort', sortable: true},
        {key: 'pricelist.propertyGroup', label: 'Gruppe', sortable: true},
        {key: 'pricelist.price', label: 'Kaufpreis', sortable: true},
      ]
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onRowClicked(item, index, event) {
      this.$emit('property-selected', item);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
