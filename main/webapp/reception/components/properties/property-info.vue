<!---
  Detailed information about a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  div
    div(v-if="property")
      h3 Allgemeines
      b-table-simple(small)
        b-tr
          b-td Erreichbarkeit
          b-td {{property.location.accessibility}}
          b-td Miete unbebaut
          b-td {{property.pricelist.rents.noHouse}}
        b-tr
          b-td Position in Preisliste
          b-td 22
          b-td Miete 1 Haus
          b-td


</template>

<script>
export default {
  name      : 'PropertyInfo',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    property: {
      type    : Object,
      required: true
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
