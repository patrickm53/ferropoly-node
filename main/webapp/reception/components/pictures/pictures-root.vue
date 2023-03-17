<!---
  Panel with all pictures of a game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 12.03.23
-->
<template lang="pug">
reception-pictures
</template>

<script>
import {mapFields} from "vuex-map-fields";
import ReceptionPictures from "./reception-pictures.vue";

export default {
  name: "PicturesRoot",
  components: {ReceptionPictures},
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
