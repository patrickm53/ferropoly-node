<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.03.23
-->
<template lang="pug">
div
  reception-pictures(no-pic-lead="Es gibt von diesem Spiel leider keine Bilder."
  no-pic-text=""
  :get-property-by-id="getPropertyById"
  :get-team-name-by-id="getTeamNameById"
  :pictures="pictures"
  :teams="teams"
  :properties="propertyRegister.properties"

  extended)

</template>

<script>
import ReceptionPictures from "../../../lib/components/ReceptionPictures.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name      : "SummaryPicturesRoot",
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
      pictures        : 'picBucketStore.pictures',
      teams           : 'teams.list',
      propertyRegister: 'propertyRegister.register'
    })
  },
  created   : function () {
  },
  methods   : {
    getPropertyById(propertyId) {
      return this.$store.getters['propertyRegister/getPropertyById'](propertyId);
    },
    getTeamNameById(teamId) {
      return this.$store.getters['teams/idToTeamName'](teamId);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
