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
      p Upload: {{picture.timestamp | formatTime}}
      p(v-if="extended") Aufnahmedatum: {{picture.lastModifiedDate | formatDateTime}}
      p(v-if="picture.position") Position:&nbsp;
        a(:href="mapUrl" target="_blank") {{picture.position | formatPosition}}
      p(v-if="picture.getLocationText()") Adresse: {{picture.getLocationText()}}
    b-col(sm="12" md="12" lg="8" xl="9")
      b-img(:src="picture.url" fluid center @click="onClose")
</template>

<script>
import {formatTime, formatPosition, formatDateTime} from '../../common/lib/formatters';

export default {
  name      : "PictureViewer",
  components: {},
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
