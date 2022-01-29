<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    b-form-group.mb-0
      b-input-group(size='sm')
        b-form-input#filter-input(
          v-model='filter'
          type='search'
          placeholder='Zürich Paradeplatz'
          :disabled="disabled")
        b-input-group-append
          b-button(:disabled='!filter' @click="filter = ''") Löschen
    #property-list
      b-table(
        :items="propertyList"
        :filter-function="filterNames"
        :filter="filter"
        :fields="fields"
        small
        :per-page="perPage"
        sort-by="location.name"
      )
        template(#cell(uuid)="row")
          b-button(size="sm" @click="buyProperty(row.value)" :disabled="disabled") kaufen


</template>

<script>
import $ from 'jquery';

export default {
  name      : 'PropertySelector',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    properties: {
      type   : Array,
      default: () => {
        return [];
      }
    },
    perPage   : {
      type   : String,
      default: () => {
        return '10'
      }
    },
    disabled  : {
      type   : Boolean,
      default: () => {
        return false;
      }
    }
  },
  data      : function () {
    return {
      filter: null,
      fields: [
        {key: 'location.name', label: 'Ort'},
        {key: 'pricelist.price', label: 'Preis'},
        {key: 'uuid', label: '', thStyle: {width: '10% !important'}}
      ]
    };
  },
  computed  : {
    propertyList() {
      if (this.filter) {
        return this.properties;
      }
      return [];
    }
  },
  mounted   : function () {
    this.resizeHandler();
  },
  created   : function () {
    this.resizeHandler();
  },
  methods: {
    filterNames(row, filter) {
      return row.location.name.toLowerCase().includes(filter.toLowerCase());
    },
    buyProperty(p) {
      console.log('buy', p);
      this.$emit('buy-property', {uuid: p});
    },
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#property-list');
      let parent        = $('#prop-selector');
      let parentHeight  = parent.height();
      let parentOffset  = parent.offset();
      let offsetElement = element.offset();
      console.log('rhx', parentHeight, offsetElement, parentOffset);
      if (offsetElement && parentOffset) {
        element.height(parentHeight - (offsetElement.top - parentOffset.top));
      }
    },
  }
}
</script>

<style lang="scss" scoped>
#property-list {
  overflow: auto;
  height: 200px;
}
</style>
