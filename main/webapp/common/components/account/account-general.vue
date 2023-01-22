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
            | Aktiv. Du kannst Dein Passwort&nbsp;
            a(href="https://auth.ferropoly.ch" target="_blank") hier ändern.
          div(v-if="getElement('socialMediaActive')")
            | Inaktiv, Login über soziale Netzwerke aktiv. Du kannst ein Passwort für Deinen Account&nbsp;
            a(href="https://auth.ferropoly.ch" target="_blank") hier erstellen.
          h4 Registrierungsdatum
          | {{getElement('registrationDate') | formatDateTime}}
          div
            h4 Avatar
            img.avatar(:src="avatarUrl")
            p Als Avatar wird entweder Dein Microsoft- oder Google-Profilbild verwendet. Wenn dies nicht vorhanden ist, dann wird der Service von&nbsp;
              a(href='https://de.gravatar.com/' target='_blank') Gravatar
              | &nbsp;verwendet. Melde Dich dort an und hinterlege dort Dein Profilbild falls gewünscht.

</template>

<script>
import {get} from 'lodash'
import {formatDateTime} from '../../lib/formatters'

export default {
  name      : 'AccountGeneral',
  components: {},
  filters   : {formatDateTime},
  model     : {},
  props     : {
    info: {
      type: Object,
      default: () => {return {};}
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  data      : function () {
    return {};
  },
  computed  : {

  },
  methods   : {
    getElement: function (e) {
      return get(this.info, e, '');
    }
  }
}
</script>

<style scoped>

</style>
