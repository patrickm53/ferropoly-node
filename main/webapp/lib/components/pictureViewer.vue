<!---
  A viewer for PicBucket Pictures, including info and editor (if allowed)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.03.23
-->
<template lang="pug">
b-container(fluid)
  b-row
    b-col(sm="12" md="12" lg="4" xl="3")
      h5 {{$store.getters['teams/idToTeamName'](picture.teamId)}}
      compact-info(title="Upload") {{picture.timestamp | formatTime}}
      compact-info(v-if="extended" title="Aufnahmedatum") {{picture.lastModifiedDate | formatDateTime}}
      compact-info(v-if="picture.position" title="Position")
        a(:href="mapUrl" target="_blank") {{picture.position | formatPosition}}
      compact-info(v-if="picture.getLocationText()" title="Adresse bei Upload (gemäss GPS)") {{picture.getLocationText()}}
      compact-info(title="Bild in voller Auflösung öffnen")
        a(:href="picture.url" target="_blank") Auf neuer Seite öffnen

    b-col(sm="12" md="12" lg="8" xl="9")
      b-img(:src="picture.url" fluid center @click="onClose")
</template>

<script>
import {formatTime, formatPosition, formatDateTime} from '../../common/lib/formatters';
import CompactInfo from "./compactInfo.vue";

export default {
  name      : "PictureViewer",
  components: {CompactInfo},
  filters   : {formatTime, formatPosition,formatDateTime},
  mixins    : [],
  model     : {},
  props     : {
    picture: {
      type   : Object,
      default: () => {
        return null;
      }
    },
    extended: {
      type: Boolean,
      default: ()=> {
        return false;
      }
    },
    disabled: {
      type: Boolean,
      default: ()=> {
        return false;
      }
    },
  },
  data      : function () {
    return {};
  },
  computed  : {
    mapUrl() {
      return `https://maps.google.com?q=${this.picture.position.lat},${this.picture.position.lng}`;
    }
  },
  created   : function () {
    console.log('showing picture', this.picture);
  },
  methods   : {
    onClose() {
      console.log('onClose');
      this.$emit('close');
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
