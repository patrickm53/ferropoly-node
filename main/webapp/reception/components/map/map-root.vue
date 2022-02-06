<!---
  Map element of the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.02.22
-->
<template lang="pug">
  b-container(fluid)
    call-active-warning
    b-row
      b-col(cols="9")
        ferropoly-map(:map-options="mapOptions" @map="onNewMap")
      b-col(cols="3")
        h1 ToDo

</template>

<script>
import CallActiveWarning from '../call-active-warning.vue';
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'MapRoot',
  components: {CallActiveWarning, FerropolyMap},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      center: 'map.center',
      zoom  : 'map.zoom',
      map   : 'map.instance',
      properties: 'properties.list',
      teams: 'teams.list',
      travelLog: 'travelLog.log'
    }),
    mapOptions() {
      return {
        center: this.$store.getters.getMapCenter,
        zoom  : this.zoom
      }
    }
  },
  created   : function () {

  },
  methods   : {
    /**
     * A new map instance was created, we're using this one now
     */
    onNewMap(map) {
      console.log('new Map!', map);
      this.map = map;
      this.properties.forEach(p => {
       // p.setMap(map);
      });
      console.log('Travellog is', this.travelLog);
      this.teams.forEach(t => {
        let log = this.$store.getters.teamLog(t.uuid);
        console.log('LOG', log);
        if (log) {
          log.setMap(map);
        }

      });
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
