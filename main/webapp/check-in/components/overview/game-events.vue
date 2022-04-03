<!---
  Game events, not the same as in the reception, but quite
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.04.22
-->
<template lang="pug">
  div
    h4 Live-Ticker
    game-event(v-for="event in eventList" :event="event" :key="event.id")

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {orderBy, slice} from 'lodash';
import {formatTime} from '../../../common/lib/formatters';
import gameEvent from './game-event.vue';

export default {
  name      : 'GameEvents',
  components: {gameEvent},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      timer: ''
    };
  },
  computed  : {
    ...mapFields({
      events: 'gameLog.entries',
    }),
    eventList() {
      console.log('events', this.events);
      let start = 0;
      if (this.events.length === 0) {
        return [];
      }
      if (this.events.length < 10) {
        start = 0;
      } else {
        start = this.events.length - 10;
      }
      return orderBy(slice(this.events, start), e => {
        return e.timestamp
      }, 'desc');
    }
  },
  created   : function () {
    this.timer = setInterval(this.updateList, 5000)
  },
  methods   : {
    updateList() {
      this.$store.dispatch('gameLog/updateTimeinfo');
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
