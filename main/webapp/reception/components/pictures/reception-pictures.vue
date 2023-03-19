<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.03.23
-->
<template lang="pug">
b-container(fluid)
  div(v-if="pictures.length === 0")
    b-jumbotron(header="Bilder Gallerie" lead="Leider hat noch kein Team Bilder hochgeladen!")
      p Sobald Bilder verfügbar sind, findest Du diese hier.
  div(v-if="pictureInfo === null")
    picture-list(:pictures="pictures" @zoom="onZoom")
  div(v-if="pictureInfo")
    b-img(:src="pictureInfo.url" fluid center @click="onClose")
</template>

<script>

import PictureList from "../../../lib/components/pictureList.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name      : "ReceptionPictures",
  components: {PictureList},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      pictureInfo: null
    };
  },
  computed  : {
    ...mapFields({
      pictures: 'picBucketStore.pictures'
    }),
  },
  created   : function () {
  },
  methods   : {
    onZoom(info) {
      console.info('zoom', info);
      this.pictureInfo = info;
    },
    onClose() {
      console.log('onClose');
      this.pictureInfo = null;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
