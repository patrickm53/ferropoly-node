<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.02.22
-->
<template lang="pug">
  div
    b-row.mt-1
      b-col(sm="4")
        ferro-card(title="Reiselog" size="sm")
          travel-log-list(:travel-log="travelLogForTeam")
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
import {delay, get} from 'lodash';
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
      map: null
    };
  },
  computed  : {
    ...mapFields({
      teamId    : 'call.currentTeam.uuid',
      travelLog : 'travelLog.log',
      properties: 'properties.list'
    }),
    travelLogForTeam() {
      return this.$store.getters.teamLog(this.teamId).getTrackPoints();
    }
  },
  created   : function () {
  },
  methods   : {
    onNewMap(map) {
      console.log('new Map!', map);
      this.map      = map;
      let travelLog = this.$store.getters.teamLog(this.teamId);
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
        this.showFreeProperties();
      }, 500);

    },
    onNewPropertyViewSelected(p) {
      console.log('new property view', p);
      switch (p) {
        case 'own':
          this.showOwnProperties();
          break;
        case 'all':
          this.showAllProperties();
          break;
        case 'free':
          this.showFreeProperties();
          break;
        default:
          console.warn(`Don't know what to do: ${p}`);
      }
    },
    showAllProperties() {
      this.properties.forEach(p => {
        p.setMap(this.map);
      });
    },
    showFreeProperties() {
      this.properties.forEach(p => {
        if (p.isAvailable()) {
          p.setMap(this.map);
        } else {
          p.setMap(null);
        }
      });
    },
    showOwnProperties() {
      this.properties.forEach(p => {
        if (get(p, 'gamedata.owner', '') === this.teamId) {
          p.setMap(this.map);
        } else {
          p.setMap(null);
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
