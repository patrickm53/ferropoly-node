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
          ferropoly-map(@map="onNewMap" ref="map" y-size-reduction=10 )

</template>

<script>
import FerroCard from '../../../../common/components/ferro-card/ferro-card.vue';
import FerropolyMap from '../../../../common/components/ferropoly-map/ferropoly-map.vue';
import {mapFields} from 'vuex-map-fields';
import {delay} from 'lodash';
import TravelLogList from '../../../../lib/components/travel-log-list.vue';

export default {
  name      : 'NavContentLog',
  components: {TravelLogList, FerropolyMap, FerroCard},
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
        this.propertyRegister.showAllPropertiesWithTeamProps(map, {
          showTeamMarkers: true,
          teamMarker     : {
            idToTeamName: this.$store.getters['teams/idToTeamName'],
            icon        : {
              fillColorFunc: this.$store.getters['teams/idToColor']
            }
          }
        });
        travelLog.setMap(map);
        //  this.propertyRegister.showOnlyFreePropertiesOnMap(map);
      }, 500);

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
