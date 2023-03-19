<!---
  A simple list of picture cards, no business logic included
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.03.23
-->
<template lang="pug">
b-row
  b-col(v-for="pic in pictures" cols="12" sm="6" md="4" lg="3")
    pictureCard(:picture-info="pic" extended=true @zoom="onZoom" )
</template>

<script>
import PictureCard from './pictureCard.vue';

export default {
  name      : "PictureList",
  components: {PictureCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    pictures: {
      type   : Array,
      default: () => {
        return [];
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onZoom(pictureInfo) {
      this.$emit('zoom', pictureInfo)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
