<!---
  Just one property of the team being displayed
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 13.03.22
-->
<template lang="pug">
  div
    b-card(:title="locationName")
      div Kaufzeit: {{boughtTs}}
      div Anzahl Häuser: {{buildingNb | buildingStatus}}
      div Wert: {{propertyValue}}
      div(v-if="buildingNb < 5") Hausbau möglich: {{buildingEnabled}}
      div(v-if="buildingNb > 4") &nbsp;


</template>

<script>
import {get} from 'lodash';
import {formatGameTime, buildingStatus} from '../../../common/lib/formatters';

export default {
  name      : 'TeamProperty',
  components: {},
  filters   : {buildingStatus},
  mixins    : [],
  model     : {},
  props     : {
    property: {
      type   : Object,
      default: () => {
        return {
          location : {
            name: 'x'
          },
          pricelist: {
            position     : 0,
            price        : 0,
            pricePerHouse: 0,
            propertyGroup: 0,
            rents        : {
              noHouse    : 0,
              oneHouse   : 0,
              twoHouses  : 0,
              threeHouses: 0,
              fourHouses : 0,
              hotel      : 0
            }
          }
        }
      }
    },
    propertyValue: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    locationName() {
      return get(this.property, 'location.name', 'Fehler!');
    },
    boughtTs() {
      let ts = get(this.property, 'gamedata.boughtTs', null);
      return formatGameTime(ts);
    },
    buildingNb() {
      return get(this.property, 'gamedata.buildings', 0);
    },
    buildingEnabled() {
      if (get(this.property, 'gamedata.buildingEnabled', false)) {
        return 'Ja';
      }
      return 'Nein';
    }

  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
