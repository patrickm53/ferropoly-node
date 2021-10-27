<!---
  Pricelist core control
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
-->
<template lang="pug">
#pricelist-list
  b-table(striped small :items="pricelist" :fields="fields" responsive="sm")
    template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
    template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}
    template(#cell(pricelist.pricePerHouse)="data") {{data.item.pricelist.pricePerHouse | formatPrice}}
    template(#cell(pricelist.rents.noHouse)="data") {{data.item.pricelist.rents.noHouse | formatPrice}}
    template(#cell(pricelist.rents.oneHouse)="data") {{data.item.pricelist.rents.oneHouse | formatPrice}}
    template(#cell(pricelist.rents.twoHouses)="data") {{data.item.pricelist.rents.twoHouses | formatPrice}}
    template(#cell(pricelist.rents.threeHouses)="data") {{data.item.pricelist.rents.threeHouses | formatPrice}}
    template(#cell(pricelist.rents.fourHouses)="data") {{data.item.pricelist.rents.fourHouses | formatPrice}}
    template(#cell(pricelist.rents.hotel)="data") {{data.item.pricelist.rents.hotel | formatPrice}}
</template>

<script>
import {formatPrice} from '../../lib/formatters';

export default {
  name      : "pricelist-list",
  props     : ['pricelist'],
  data      : function () {
    return {
      fields: [
        {key: 'pricelist.position', label: 'Pos'},
        {key: 'location.name', label: 'Ort'},
        {key: 'pricelist.propertyGroup', label: 'Gruppe'},
        {key: 'pricelist.price', label: 'Kaufpreis'},
        {key: 'pricelist.pricePerHouse', label: 'Hauspreis'},
        {key: 'pricelist.rents.noHouse', label: 'Miete'},
        {key: 'pricelist.rents.oneHouse', label: 'Miete 1H'},
        {key: 'pricelist.rents.twoHouses', label: 'Miete 2H'},
        {key: 'pricelist.rents.threeHouses', label: 'Miete 3H'},
        {key: 'pricelist.rents.fourHouses', label: 'Miete 4H'},
        {key: 'pricelist.rents.hotel', label: 'Miete Hotel'},
      ]
    };
  },
  model     : {},
  methods   : {},
  components: {},
  filters   : {
    formatPrice
  }
}
</script>

<style scoped>

</style>
