<!---
  Pricelist with properties (linked to map)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.10.21
-->
<template lang="pug">
  #property-list
    b-table(
      striped
      small
      :items="pricelist"
      :fields="fields"
      responsive="sm"
      sort-by="location.name"
    )
      template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
      template(#cell(location.name)="data")
        a(href='#' @click="onLocationClick(data.item)") {{data.item.location.name}}
      template(#cell(pricelist.propertyGroup)="data") {{data.item.pricelist.propertyGroup}}
      template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}
  
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatPrice} from '../../../common/lib/formatters';
import $ from 'jquery';

export default {
  name: "info-properties",
  props: {},
  data: function() {
    return {
      fields: [
        {key: 'pricelist.position', label: 'Pos', sortable: true},
        {key: 'location.name', label: 'Ort', sortable: true},
        {key: 'pricelist.propertyGroup', label: 'Gruppe', sortable: false},
        {key: 'pricelist.price', label: 'Kaufpreis', sortable: false}
      ]
    };
  },
  model: {},
  mounted: function () {
    this.resizeHandler();
  },
  created: function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  computed: {
    ...mapFields([
      'pricelist'
    ])
  },
  methods: {
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#property-list');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      console.log('rh', hDoc, offsetElement);
      if (offsetElement) {
        element.height(hDoc - offsetElement.top);
      }
    },
    onLocationClick(e) {
      console.log('clicked', e);
    }
  },
  components: {},
  filters: {formatPrice},
  mixins: []
}
</script>

<style lang="scss" scoped>
#property-list {
  overflow: auto;
  font-size: 12px;
  height: 200px;
}
</style>
