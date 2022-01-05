<!---
  This is a special price list, not like the one in the common folder: it is tailored for the
  reception and contains therefore a few "goodies" while stripping away some unused parts.
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  #property-list
    b-table(striped
    small
    :items="properties"
      :fields="fields"
      responsive="sm"
      @row-clicked="onRowClicked")
      // eslint-disable-next-line vue/valid-v-slot
      template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
      template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}
      // {{teamName(data.item.gamedata.owner)}}
      template(#cell(gamedata.buildings)="data")
        font-awesome-icon.no-url(:icon="['fas', 'hotel']" v-if="data.item.gamedata.buildings===5")
        font-awesome-icon.no-url(:icon="['fas', 'home']" v-if="showFirstHouse(data.item.gamedata.buildings)")
        font-awesome-icon.no-url(:icon="['fas', 'home']" v-if="showSecondHouse(data.item.gamedata.buildings)")
        font-awesome-icon.no-url(:icon="['fas', 'home']" v-if="showThirdHouse(data.item.gamedata.buildings)")
        font-awesome-icon.no-url(:icon="['fas', 'home']" v-if="showFourthHouse(data.item.gamedata.buildings)")
        font-awesome-icon.building-enabled.no-url(:icon="['fas', 'home']" v-if="showBuildingEnabled(data.item.gamedata)")

</template>

<script>

import {formatPrice} from '../../../common/lib/formatters';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faHotel} from '@fortawesome/free-solid-svg-icons'
import {faHome} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import $ from 'jquery';
library.add(faHotel);
library.add(faHome);

export default {
  name      : 'PropertyList',
  components: {FontAwesomeIcon},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {
    properties: {
      type   : Array,
      default: function () {
        return [];
      }
    }
  },
  data      : function () {
    return {
      fields: [
        {key: 'pricelist.position', label: 'Pos', sortable: true},
        {key: 'location.name', label: 'Ort', sortable: true},
        {key: 'pricelist.propertyGroup', label: 'Gruppe', sortable: true},
        {key: 'pricelist.price', label: 'Kaufpreis', sortable: true},
        {
          key            : 'gamedata.owner',
          label          : 'Besitzer',
          sortable       : true,
          sortByFormatted: true,
          formatter      : (value) => {
            return this.$store.getters.teamIdToTeamName(value);
          }
        },
        {key: 'gamedata.buildings', label: 'Status', sortable: true},
      ]
    };
  },
  computed  : {},
  mounted: function () {
    this.resizeHandler();
  },
  created   : function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods   : {
    onRowClicked(item) {
      this.$emit('property-selected', item);
    },
    teamName(id) {
      return this.$store.getters.teamIdToTeamName(id);
    },
    showFirstHouse(buildings) {
      return (buildings < 5) && (buildings > 0);
    },
    showSecondHouse(buildings) {
      return (buildings < 5) && (buildings > 1);
    },
    showThirdHouse(buildings) {
      return (buildings < 5) && (buildings > 2);
    },
    showFourthHouse(buildings) {
      return (buildings < 5) && (buildings > 3);
    },
    showBuildingEnabled(gamedata) {
      return (gamedata.buildingEnabled && (gamedata.buildings < 5) && (gamedata.buildings > -1));
    },
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#property-list');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      console.log('rh', hDoc, offsetElement);
      if (offsetElement) {
        element.height(hDoc - offsetElement.top);
      }
    },
  }
}
</script>

<style lang="scss" scoped>

.building-enabled {
  color: lightgrey;
}

#property-list {
  overflow: auto;
  font-size: 12px;
  height: 200px;
}

</style>
