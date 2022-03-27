<!---
  Card with some game events
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.03.22
-->
<template lang="pug">
  div
    ferro-card(title="Spielinfo")
      b-table(
        borderless
        hover
        small
        :items="eventList"
        :fields="fields")
        template(#cell(timestamp)="data") {{data.item.timestamp | formatTime}}



</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';
import {formatTime} from '../../../common/lib/formatters';
import {slice} from 'lodash';

export default {      name: 'GameEvents',
  components: {FerroCard},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      fields: [
        {key: 'timestamp', label: 'Zeit'},
        {key: 'title', label: 'Ereignis'}
      ]
    };
  },
  computed  : {
    ...mapFields({
      events: 'gameLog.entries',
    }),
    eventList() {
      console.log('events', this.events);
      let start = 0;
      if(this.events.length === 0) {
        return [];
      }
      if (this.events.length < 5) {
        start = 0;
      }
      else {
        start = this.events.length - 5;
      }
      return slice(this.events, start);
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
