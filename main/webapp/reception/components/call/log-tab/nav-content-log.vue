<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.02.22
-->
<template lang="pug">
  div
    b-row.mt-1
      b-col(sm="4")
        ferro-card(title="Reiselog" size="sm")
          travel-log-list(:travel-log="travelLogForTeam" @location-selected="onLocationSelected")
      b-col(sm="8")
        ferro-card(title="Standortverlauf" size="sm")
          property-display-selector(@change="onNewPropertyViewSelected")
          ferropoly-map(@map="onNewMap" ref="map" y-size-reduction=10 )

</template>

<script>
import FerroCard from '../../../../common/components/ferro-card/ferro-card.vue';
import FerropolyMap from '../../../../common/components/ferropoly-map/ferropoly-map.vue';
import PropertyDisplaySelector from './property-display-selector.vue';
import {mapFields} from 'vuex-map-fields';
import {delay} from 'lodash';
import TravelLogList from './travel-log-list.vue';

export default {
  name      : 'NavContentLog',
  components: {TravelLogList, PropertyDisplaySelector, FerropolyMap, FerroCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      map             : null,
      selectedLocation: null,
    };
  },
  computed  : {
    ...mapFields({
      teamId          : 'call.currentTeam.uuid',
      travelLog       : 'travelLog.log',
      propertyRegister: 'propertyRegister.register'
    }),
    travelLogForTeam() {
      return this.$store.getters['travelLog/teamLog'](this.teamId).getTrackPoints();
    }
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
        this.propertyRegister.showOnlyFreePropertiesOnMap(map);
      }, 500);

    },
    onNewPropertyViewSelected(p) {
      console.log('new property view', p);
      switch (p) {
        case 'own':
          this.propertyRegister.showOnlyPropertiesOfTeamOnMap(this.map, this.teamId);
          break;
        case 'all':
          this.propertyRegister.showAllPropertiesOnMap(this.map);
          break;
        case 'free':
          this.propertyRegister.showOnlyFreePropertiesOnMap(this.map);
          break;
        default:
          console.warn(`Don't know what to do: ${p}`);
      }
    },
    /**
     * Event with a newly selected location
     * @param location
     */
    onLocationSelected(location) {
      if (this.selectedLocation) {
        this.selectedLocation.setMarker(null);
      }
      this.selectedLocation = location;
      this.selectedLocation.setMarker(this.map);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
