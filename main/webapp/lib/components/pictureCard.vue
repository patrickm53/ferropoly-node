<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.03.23
-->
<template lang="pug">
div.card.mt-2
  b-img(:src="pictureInfo.thumbnail" @click="onClick")
  h3 {{uploadDate}}
  div(v-if="extended")
    p {{$store.getters['teams/idToTeamName'](pictureInfo.teamId)}}
    p(v-b-tooltip.hover :title="tooltipGps") {{pictureInfo.getLocationText()}}
</template>

<script>
import PictureInfo from "../pictureInfo";
import {formatTime} from '../../common/lib/formatters';

export default {
  name: "PictureCard",
  components: {},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {
    pictureInfo: {
      type: Object,
      default: ()=> {
        return new PictureInfo({});
      }
    },
    extended: {
      type: Boolean,
      default: ()=> {
        return false;
      }
    }
  },
  data      : function () {
    return {
      tooltipGps: 'Die Adresse wurde aufgrund des letzten GPS Standortes bestimmt'
    };
  },
  computed  : {
    uploadDate() {
      return formatTime(this.pictureInfo.timestamp.toISO());
    }
  },
  created   : function () {
  },
  methods   : {
    onClick() {
      this.$emit('zoom', this.pictureInfo)
    }
  }
}
</script>

<style lang="scss" scoped>

.card {
  border: solid silver;
  border-width: 0;
}
</style>
