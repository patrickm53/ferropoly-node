<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 20.02.2024
-->
<template lang="pug">
  div.shadow.rounded.info-box
    h3 GPS
    p(v-if="!positionAvailable") Keine aktuelle Position verfügbar
    p(v-if="positionAvailable") Aktuelle Position: &nbsp;
      a(:href="targetLink" target="_blank") {{lastPositionText}} &pm; {{accuracy}}m
    b-button(variant="primary" @click="updateGps") GPS aktualisieren
</template>
<script>

import geograph from '../../../common/lib/geograph';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'GpsInfo',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {}
  },
  computed  : {
    ...mapFields({
      lastPosition: 'travelLog.lastPosition'
    }),
    lastPositionText() {
      if (this.lastPosition && this.lastPosition.lat) {
        return `${this.lastPosition.lat}, ${this.lastPosition.lng}`
      }
      return '';
    },
    accuracy() {
      if (this.lastPosition && this.lastPosition.lat) {
        return `${this.lastPosition.accuracy}`
      }
      return '';
    },
    targetLink() {
      return `https://maps.google.ch/?q=${this.lastPosition.lat},${this.lastPosition.lng}`
    },
    positionAvailable() {
      return (this.lastPosition && this.lastPosition.lat);
    }
  },
  created   : function () {

  },
  methods   : {
    updateGps() {
      geograph.localize();
    }
  }
}

</script>


<style scoped lang="scss">
.checkin-info {
  font-size: 18px;
  display: compact;
}

.checkin-amount {
  font-size: 18px;
  text-align: right;
  display: compact;
}

.info-box {
  padding: 10px;
  margin-bottom: 20px;
}
</style>
