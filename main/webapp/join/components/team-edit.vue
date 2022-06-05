<!---
  Editor for a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div
    h1 Anmeldung
    input-text(
      v-model="name"
      label="Name Deines Teams"
      feedback="Muss zwischen 4 und 60 Zeichen sein"
      :state="$store.getters.nameValid"
    )
    input-text(
      v-model="organization"
      label="Zu welchem Verein / welcher Organisation gehört ihr?"
      feedback="Muss zwischen 4 und 60 Zeichen sein"
      :state="$store.getters.organizationValid"
    )
    input-text(
      v-model="contact"
      label="Ansprechperson"
      disabled=true
    )
    input-text(
      v-model="email"
      label="Email-Adresse"
      disabled=true
    )
    input-phone(
      v-model="phone"
      label="Telefonnummer"
      :state="$store.getters.phoneValid"
      feedback="Gib bitte deine Telefonnummer an"
    )
    input-textarea(
      label="Bemerkungen"
      v-model="remarks"
      rows="4"
      max-rows="8"
    )
    b-button(variant="primary"
      :disabled="!$store.getters.joiningButtonEnabled"
      v-on:click="joinGame" v-if="!teamExists") Anmelden
    b-button(variant="primary"
      :disabled="!$store.getters.joiningButtonEnabled"
      v-on:click="joinGame" v-if="teamExists") Änderungen speichern

</template>

<script>
import InputText from '../../common/components/form-controls/input-text.vue';
import InputPhone from '../../common/components/form-controls/input-phone.vue';
import InputTextarea from '../../common/components/form-controls/input-textarea.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'TeamEdit',
  components: {InputText, InputPhone, InputTextarea},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      name        : 'teamInfo.name',
      organization: 'teamInfo.organization',
      contact     : 'user.name',
      email       : 'user.personalData.email',
      phone       : 'teamInfo.phone',
      remarks     : 'teamInfo.remarks',
      id          : 'teamInfo.id'
    }),
    teamExists() {
      if (!this.id) {
        return false;
      }
      return this.id.length > 0;
    }
  },
  created   : function () {
    console.log('created', this.$store.getters.organizationValid);
  },
  methods   : {
    joinGame() {
      console.log('join the game');
      this.$store.dispatch('joinGame', {});
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
