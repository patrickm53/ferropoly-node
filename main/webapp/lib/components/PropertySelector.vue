<!---
  This is a dropdown combo for selecting a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.03.23
-->
<template lang="pug">
div
  b-form-select(v-model="selected", :options="propertyList" @change="onChange")
</template>

<script>
import {sortBy} from "lodash";

export default {
  name      : "PropertySelector",
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    properties        : {
      type   : Array,
      default: () => {
        return []
      }
    },
    selectedPropertyId: {
      type   : String,
      default: () => {
        return null;
      }
    }
  },
  data      : function () {
    return {
      selected    : null,
      propertyList: []
    };
  },
  computed  : {},
  created   : function () {
    let self = this;
    // Create the sorted list with all properties
    this.properties.forEach(p => {
      if (p.id === self.selectedPropertyId) {
        self.selected = p;
      }
      self.propertyList.push({value: p.uuid, text: p.location.name});
    });
    this.propertyList = sortBy(self.propertyList, 'text');
    this.propertyList.unshift({value: null, text: '---', disabled: true});
    this.propertyList.unshift({value: null, text: 'Kein Ort zugewiesen'});

    console.log('selected id', this.selectedPropertyId)
    this.selected = this.selectedPropertyId;
  },
  methods   : {
    onChange(obj) {
      this.$emit('property-assigned', {propertyId: obj});
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
