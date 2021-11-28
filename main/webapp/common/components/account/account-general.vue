<!---
  General account info
-->
<template lang="pug">
  #general-info
    b-card(no-body)
      b-card-header.title Allgemein
      b-card-body
        b-card-text
          h4 Loginname
          b-form-input(v-model="info.email" size="sm" disabled=true)
          p Teile diesen Loginname der Spielleitung mit, damit Du mit Deinem Login auf sein Spiel zugreifen kannst.
          h4 Zugang mit Loginname / Passwort
          div(v-if="!getElement('socialMediaActive')")
            | Aktiv. Gegenwärtig kann das Passwort leider nicht geändert werden.
          div(v-if="getElement('socialMediaActive')")
            | Inaktiv, Login über soziale Netzwerke aktiv.
          h4 Registrierungsdatum
          | {{getElement('registrationDate') | formatDateTime}}
          div
            h4 Avatar
            img.avatar(:src="avatarUrl")
            p Als Avatar wird entweder Dein Facebook- oder Google-Profilbild verwendet. Wenn dies nicht vorhanden ist, dann wird der Service von&nbsp;
              a(href='https://de.gravatar.com/' target='_blank') Gravatar
              | &nbsp;verwendet. Melde Dich dort an und hinterlege dort Dein Profilbild falls gewünscht.

</template>

<script>
import {get} from 'lodash'
import {formatDateTime} from '../../lib/formatters'

export default {
  name      : 'account-general',
  props     : {
    info: {
      type: Object,
      default: {}
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  computed  : {

  },
  methods   : {
    getElement: function (e) {
      return get(this.info, e, '');
    }
  },
  components: {},
  filters   : {formatDateTime}
}
</script>

<style scoped>

</style>
