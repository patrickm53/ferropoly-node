<!---
  Root element for the price list in the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  b-container(fluid)
    call-active-warning
    b-row
      b-col(sm="12" md="6")
        property-list(
          :properties="properties"
          @property-selected="onPropertySelected")
      b-col(sm="12" md="6")
        ferro-card(:title="selectedProperty.location.name" size="sm")
          property-info(:property="selectedProperty")


</template>

<script>
import PropertyList from './property-list.vue';
import PropertyInfo from './property-info.vue';
import FerroCard from './../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';
import CallActiveWarning from '../call-active-warning.vue';

export default {
  name      : 'PropertiesRoot',
  components: {FerroCard, PropertyInfo, PropertyList, CallActiveWarning},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      selectedProperty: {
        location : {
          name         : '',
          accessibility: ''
        },
        gamedata : {
          owner          : undefined,
          boughtTs       : undefined,
          buildings      : 0,
          buildingEnabled: false
        },
        pricelist: {
          rents: {
            noHouse    : 0,
            oneHouse   : 0,
            twoHouses  : 0,
            threeHouses: 0,
            fourHouses : 0,
            hotel      : 0
          }
        }
      }
    };
  },
  computed  : {
    ...mapFields({
      properties: 'properties.list'
    }),
  },
  created   : function () {
    this.selectedProperty = this.properties[0];
  },
  methods   : {
    onPropertySelected(property) {
      console.log('Property selected', property);
      this.selectedProperty = property;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
