<!---
  Reception Pictures Test
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.03.23
-->
<template lang="pug">
b-container(fluid)
  b-row
    b-col(cols="2")
      h1 Settings
      b-form-checkbox(v-model="admin") admin
      b-form-checkbox(v-model="editAllowed") editAllowed
      b-form-checkbox(v-model="extended") extended
    b-col(cols="10")
      reception-pictures(
      :admin="admin"
      :edit-allowed="editAllowed"
      :extended="extended"
      :properties="properties"
      :pictures="pictures"
      :get-team-name-by-id="getTeamNameById"
      :get-property-by-id="getPropertyById"
      @property-assigned="onPropertyAssigned"
      )
</template>

<script>
import ReceptionPictures from "../../lib/components/ReceptionPictures.vue";
import {getPlayers} from "../fixtures/players";
import {getProperties} from "../fixtures/properties";
import {getPictures} from "../fixtures/pictures";
import {find} from "lodash";


export default {
  name      : "TestReceptionPictures",
  components: {ReceptionPictures},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      admin      : false,
      editAllowed: false,
      extended   : false,
      teams      : getPlayers(),
      properties : getProperties(),
      pictures   : getPictures()
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    getPropertyById(id) {
      return find(this.properties, {'uuid': id});
    },
    getTeamNameById(id) {
      let team = find(this.teams, {'uuid': id});
      return team.data.name;
    },
    onPropertyAssigned(obj) {
      console.log('ASSIGNED', obj);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
