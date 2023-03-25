<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.03.23
-->
<template lang="pug">
b-container(fluid)
  div(v-if="pictureInfo === null")
    picture-list(:pictures="pictures" :team-id="teamId" @zoom="onZoom")
  div(v-if="pictureInfo")
    picture-viewer(:picture="pictureInfo"
      :properties="propertyRegister.properties"
      extended=true
      @property-assigned="onPropertyAssigned"
      @close="onClose")

</template>

<script>
import PictureList from "../../../../lib/components/pictureList.vue";
import {mapFields} from "vuex-map-fields";
import PictureViewer from "../../../../lib/components/pictureViewer.vue";

export default {
  name      : "NavContentPictures",
  components: {PictureViewer, PictureList},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      pictureInfo: null,
    };
  },
  computed  : {
    ...mapFields({
      teamId          : 'call.currentTeam.uuid',
      pictures        : 'picBucketStore.pictures',
      propertyRegister: 'propertyRegister.register'
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
      this.pictureInfo = null;
    },
    /**
     * A property was assigned to a picture
     * @param obj
     */
    onPropertyAssigned(obj) {
      // obj has "picture" and "propertyId"
      console.log('property assigned', obj)
      this.$store.dispatch('assignProperty', obj);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
