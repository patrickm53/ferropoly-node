<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 28.11.21
-->
<template lang="pug">
  b-row
    b-col
      ferro-card(
        title="Mitglied hinzufügen"
        size="sm"
      )
        b-form-row
          b-col
            p Gib den Loginnamen an, unter welcher sich diese Person im Ferropoly angemeldet hat. Dieser ist auf der&nbsp;
              a(href="/account") Account
              | &nbsp; Seite zu finden.
        b-form-row
          b-col
            input-text(v-model="newMember", label="Loginname")
        b-form-row
          b-col
            b-button(variant="primary" @click="addMember") hinzufügen


</template>

<script>
import InputText from '../../common/components/form-controls/input-text.vue';
import FerroCard from '../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'team-add',
  props     : {},
  data      : function () {
    return  {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'newMember'
    ])
  },
  methods   : {
    addMember() {
      this.$store.dispatch('addTeamMember');
    }
  },
  components: {InputText, FerroCard},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
