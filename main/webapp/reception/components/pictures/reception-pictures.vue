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
    b-row
      b-col(v-for="pic in pictures" cols="12" sm="6" md="4" lg="3")
        pictureCard(:picture-info="pic" extended=true @zoom="onZoom" )
  div(v-if="pictureInfo")
    b-img(:src="pictureInfo.url" fluid center @click="onClose")
</template>

<script>
import PictureCard from "../../../lib/components/pictureCard.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name      : "ReceptionPictures",
  components: {PictureCard},
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
