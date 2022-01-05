<!---
  Detailed information about a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  div
    div(v-if="property")
      h5 Allgemein
      b-table-simple(small)
        b-tr
          b-td.title Erreichbarkeit
          b-td {{property.location.accessibility | formatAccessibility}}
          b-td.title Miete unbebaut
          b-td {{property.pricelist.rents.noHouse | formatPrice}}
        b-tr
          b-td.title Position in Preisliste
          b-td {{property.pricelist.position + 1}}
          b-td.title Miete 1 Haus
          b-td {{property.pricelist.rents.oneHouse | formatPrice}}
        b-tr
          b-td.title Preisgruppe
          b-td {{property.pricelist.propertyGroup}}
          b-td.title Miete 2 Häuser
          b-td {{property.pricelist.rents.twoHouses | formatPrice}}
        b-tr
          b-td.title Kaufpreis
          b-td {{property.pricelist.price | formatPrice}}
          b-td.title Miete 3 Häuser
          b-td {{property.pricelist.rents.threeHouses | formatPrice}}
        b-tr
          b-td.title Preis pro Haus
          b-td {{property.pricelist.pricePerHouse | formatPrice}}
          b-td.title Miete 4 Häuser
          b-td {{property.pricelist.rents.fourHouses | formatPrice}}
        b-tr
          b-td.title
          b-td
          b-td.title Miete Hotel
          b-td {{property.pricelist.rents.hotel | formatPrice}}

      div(v-if="property.gamedata.owner")
        h5 Besitz
        b-table-simple(small)
          b-tr
            b-td.title Gehört Team
            b-td {{teamName(property.gamedata.owner)}}
            b-td.title Baustatus
            b-td {{property.gamedata.buildings | buildingStatus}}
          b-tr
            b-td.title Kaufdatum
            b-td {{property.gamedata.boughtTs | formatTime}}
            b-td.title Bebaubar?
            b-td {{property.gamedata.buildingEnabled | booleanYesNo}}


</template>

<script>
import {formatAccessibility, formatPrice, booleanYesNo, buildingStatus, formatTime} from '../../../common/lib/formatters';

export default {
  name      : 'PropertyInfo',
  components: {},
  filters   : {formatAccessibility, formatPrice, booleanYesNo, buildingStatus, formatTime},
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
  methods   : {
    teamName(id) {
      return this.$store.getters.teamIdToTeamName(id);
    },
  }
}
</script>

<style lang="scss" scoped>

.title {
  font-weight: bold;
}
</style>
