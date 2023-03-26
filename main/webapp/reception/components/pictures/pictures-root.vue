<!---
  Panel with all pictures of a game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 12.03.23
-->
<template lang="pug">
b-container(fluid)
  call-active-warning
  reception-pictures(
    @property-assigned="onPropertyAssigned"
    admin
    edit-allowed
    :get-property-by-id="getPropertyById"
    :get-team-name-by-id="getTeamNameById"
    :pictures="pictures"
    :teams="teams"
    :properties="propertyRegister.properties"
    extended)
</template>

<script>
import ReceptionPictures from "../../../lib/components/ReceptionPictures.vue";
import CallActiveWarning from "../call-active-warning.vue";
import {mapFields} from "vuex-map-fields";

export default {
  name      : "PicturesRoot",
  components: {ReceptionPictures, CallActiveWarning},
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
    },
    onPropertyAssigned(obj) {
      this.$store.dispatch('assignProperty', obj);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
