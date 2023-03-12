<!---
  Panel with all pictures of a game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 12.03.23
-->
<template lang="pug">
div
  b-row
    b-col(v-for="pic in pictures" cols="3")
      pictureCard(:picture-info="pic" extended=true)
</template>

<script>
import PictureCard from "../../../lib/components/pictureCard.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name: "PicturesRoot",
  components: {PictureCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teamId   : 'checkin.team.uuid',
      gameId   : 'gameId',
      authToken: 'api.authToken',
      error    : 'api.error',
      pictures : 'picBucketStore.pictures'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
