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
        ferropoly-map(:map-options="mapOptions" @map="onNewMap" ref="map" @zoom-changed="onZoomChanged" @center-changed="onCenterChanged")
      b-col(cols="3")
        show-team-on-map-selector(:teams="teams" :travel-log="travelLog" @visibility-changed="onTeamVisibilityChanged")

</template>

<script>
import CallActiveWarning from '../../../reception/components/call-active-warning.vue';
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';
import ShowTeamOnMapSelector from './show-team-on-map-selector.vue';
import {forOwn} from 'lodash';
import {
  getItem,
  setInt,
  setObject
} from '../../../common/lib/sessionStorage';

export default {
  name      : 'MapRoot',
  components: {CallActiveWarning, FerropolyMap, ShowTeamOnMapSelector},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      gameId          : 'gameId',
      center          : 'map.center',
      zoom            : 'map.zoom',
      bounds          : 'map.bounds',
      map             : 'map.instance',
      propertyRegister: 'propertyRegister.register',
      teams           : 'teams.list',
      travelLog       : 'travelLog.log'
    }),
    mapOptions() {
      return {
        center: this.$store.getters.getMapCenter,
        zoom  : this.zoom
      }
    }
  },
  methods   : {
    /**
     * A new map instance was created, we're using this one now
     */
    onNewMap(map) {
      console.log('new Map!', map);
      this.map   = map;
      let zoom   = getItem(`${this.gameId}-travelmap-zoom`, -1);
      let center = getItem(`${this.gameId}-travelmap-center`, null);

      // If we were here before, use the same settings as before
      if (zoom < 0 || !center) {
        this.$refs.map.fitBounds(this.bounds);
      } else {
        this.$refs.map.setCenter(center);
        this.$refs.map.setZoom(zoom);
      }

      this.propertyRegister.showOnlyFreePropertiesOnMap(map);

      forOwn(this.travelLog, (value) => {
        if (value.visible) {
          value.setMap(this.map);
        } else {
          value.setMap(null);
        }
      })
    },
    onTeamVisibilityChanged(info) {
      console.log('onTeamVisibilityChanged', info.teamId, info.visible);
      let teamLog = this.travelLog[info.teamId];
      if (info.visible) {
        teamLog.setMap(this.map);
      } else {
        teamLog.setMap(null);
      }
    },
    onZoomChanged(zoom) {
      setInt(`${this.gameId}-travelmap-zoom`, zoom);
    },
    onCenterChanged(center) {
      console.log(center);
      setObject(`${this.gameId}-travelmap-center`, center);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
