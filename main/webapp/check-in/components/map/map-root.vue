<!---
  Check-In Map
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div.full-screen
    ferropoly-map(@map="onNewMap" ref="map" @zoom-changed="onZoomChanged")

</template>

<script>
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';
import {delay} from 'lodash';
import {
  getItem,
  setInt
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
      gameId          : 'gameId',
      bounds          : 'map.bounds'
    }),
  },
  created   : function () {
  },
  beforeDestroy() {
    // Close all Info tags on the map
    this.propertyRegister.closeInfoWindows();
  },
  methods: {
    onNewMap(map) {
      console.log('new Map!', map);
      this.map = map;
      let zoom = getItem(`${this.gameId}-checkinmap-zoom`, -1);

      let travelLog = this.$store.getters['travelLog/teamLog'](this.teamId);
      if (!travelLog) {
        console.warn(`No travellog for ${this.teamId}`);
        return;
      }
      travelLog.setTrackColor('red');
      // If we were here before, use the same settings as before
      if (zoom < 0) {
        this.$refs.map.fitBounds(this.bounds);
      } else {
        this.$refs.map.setZoom(zoom);
      }

      let latestLocation = travelLog.getLatestLocation();
      console.log('latestLocation', latestLocation);
      let center = this.$store.getters.getMapCenter;
      console.log('default center', center);
      if (latestLocation) {
        let latestPosition = latestLocation.getPosition();
        if (latestPosition.lng) {
          center = latestPosition;
        }
      }
      console.log('final center', center);
      this.$refs.map.setCenter(travelLog.getLatestLocation().getPosition());
      // mhm, this leaves me back with a bad feeling... why do I need to
      // set the bounds delayed...?
      delay(() => {
        // Make max size of the map on your phone!
        this.$refs.map.resizeHandler();
        travelLog.setMap(map);
        travelLog.updateMarker();
        this.propertyRegister.showAllPropertiesWithTeamProps(map, {teamId: this.teamId});
      }, 500);

    }, onZoomChanged(zoom) {
      setInt(`${this.gameId}-checkinmap-zoom`, zoom);
    }
  }
}
</script>

<style lang="scss" scoped>
.full-screen {
  height: 100vh;
}
</style>
