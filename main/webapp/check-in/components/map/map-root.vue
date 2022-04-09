<!---
  Check-In Map
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div.full-screen
    ferropoly-map(@map="onNewMap" ref="map" @zoom-changed="onZoomChanged" @center-changed="onCenterChanged")

</template>

<script>
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';
import {delay} from 'lodash';
import {
  getItem,
  setInt,
  setObject
} from '../../../common/lib/sessionStorage';

export default {
  name      : 'MapRoot',
  components: {FerropolyMap},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      map: null,
    };
  },
  computed  : {
    ...mapFields({
      teamId          : 'checkin.team.uuid',
      travelLog       : 'travelLog.log',
      propertyRegister: 'propertyRegister.register',
      gameId          : 'gameId'
    }),
  },
  created   : function () {
  },
  methods   : {
    onNewMap(map) {
      console.log('new Map!', map);
      this.map   = map;
      let zoom   = getItem(`${this.gameId}-checkinmap-zoom`, -1);
      let center = getItem(`${this.gameId}-checkinmap-center`, null);

      let travelLog = this.$store.getters['travelLog/teamLog'](this.teamId);
      if (!travelLog) {
        console.warn(`No travellog for ${this.teamId}`);
        return;
      }
      travelLog.setTrackColor('red');
      // If we were here before, use the same settings as before
      if (zoom < 0 || !center) {
        this.$refs.map.fitBounds(travelLog.getBounds());
      } else {
        this.$refs.map.setCenter(center);
        this.$refs.map.setZoom(zoom);
      }

      // mhm, this leaves me back with a bad feeling... why do I need to
      // set the bounds delayed...?
      delay(() => {
        // Make max size of the map on your phone!
        this.$refs.map.resizeHandler();
        travelLog.setMap(map);
        travelLog.updateMarker();
        this.propertyRegister.showAllPropertiesWithTeamProps(map, this.teamId);
      }, 500);

    }, onZoomChanged(zoom) {
      setInt(`${this.gameId}-checkinmap-zoom`, zoom);
    },
    onCenterChanged(center) {
      setObject(`${this.gameId}-checkinmap-center`, center);
    }
  }
}
</script>

<style lang="scss" scoped>
.full-screen {
  height: 100vh;
}
</style>
