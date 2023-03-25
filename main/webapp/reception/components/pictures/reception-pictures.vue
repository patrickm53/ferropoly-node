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
    b-row.mt-1
      b-col
        b-form(inline)
          label.mr-2(for="filter") Team-Filter:
          b-form-select#filter(v-model="selectedFilter" :options="selectOptions")
          label.mr-2.ml-4(for="text") Text-Filter:
          b-form-input(v-model="textFilter" type="text")
    picture-list.mt-2(:pictures="pictures"  :team-id="selectedFilter" :text-filter="textFilter" @zoom="onZoom")
  div(v-if="pictureInfo")
    picture-viewer(:picture="pictureInfo" :properties="propertyRegister.properties" extended=true @property-assigned="onPropertyAssigned" @close="onClose")
</template>

<script>

import PictureList from "../../../lib/components/pictureList.vue";
import PictureViewer from "../../../lib/components/pictureViewer.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name      : "ReceptionPictures",
  components: {PictureList, PictureViewer},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      pictureInfo   : null,
      selectOptions : [
        {value: null, text: 'Alle'}
      ],
      selectedFilter: null,
      textFilter    : null
    };
  },
  computed  : {
    ...mapFields({
      pictures        : 'picBucketStore.pictures',
      teams           : 'teams.list',
      propertyRegister: 'propertyRegister.register'
    })
  },
  created   : function () {
    let self = this;
    this.teams.forEach(t => {
      self.selectOptions.push({value: t.uuid, text: t.data.name});
    })
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
