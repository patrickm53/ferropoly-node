<!---
  Check-In Map
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div
    ferropoly-map(@map="onNewMap" ref="map")
  
</template>

<script>
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';
import {delay} from 'lodash';

export default {
  name: "MapRoot",
  components: {FerropolyMap},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      map             : null,
    };
  },
  computed  : {
    ...mapFields({
      teamId          : 'checkin.team.uuid',
      travelLog       : 'travelLog.log',
      propertyRegister: 'propertyRegister.register'
    }),
  },
  created   : function () {
  },
  methods   : {
    onNewMap(map) {
      console.log('new Map!', map);
      this.map      = map;
      let travelLog = this.$store.getters['travelLog/teamLog'](this.teamId);
      if (!travelLog) {
        console.warn(`No travellog for ${this.teamId}`);
        return;
      }
      // mhm, this leaves me back with a bad feeling... why do I need to
      // set the bounds twice...?
      this.$refs.map.fitBounds(travelLog.getBounds());
      delay(() => {
        this.$refs.map.fitBounds(travelLog.getBounds());
        travelLog.setMap(map);
        this.propertyRegister.showAllPropertiesOnMap(map);
      }, 500);

    },
  }
}
</script>

<style lang="scss" scoped>

</style>
