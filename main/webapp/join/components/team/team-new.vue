<!---

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

</template>

<script>
import InputText from '../../../common/components/form-controls/input-text.vue';
import InputPhone from '../../../common/components/form-controls/input-phone.vue';
import {mapFields} from 'vuex-map-fields';


export default {
  name      : 'team-new',
  props     : {},
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
    console.log('created', this.$store.getters.organizationValid);
  },
  computed  : {
    ...mapFields({
      name        : 'teamInfo.name',
      organization: 'teamInfo.organization',
      contact     : 'user.name',
      email       : 'user.personalData.email',
      phone       : 'teamInfo.phone',
      remarks     : 'teamInfo.remarks'
    }),
  },
  methods   : {},
  components: {InputText, InputPhone},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
