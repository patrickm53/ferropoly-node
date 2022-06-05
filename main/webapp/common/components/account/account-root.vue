<!---
  Account Info
-->
<template lang="pug">
  #account
    menu-bar(show-user-box=true
      help-url="https://www.ferropoly.ch/hilfe/general/3-0/account")
    b-container(fluid=true v-if="dataValid")
      b-row
        b-col
          h1 Account Daten von {{getElement('personalData.forename')}} {{getElement('personalData.surname')}}
      b-row
        b-col(xs="12" sm="12" md="6" lg="4" xl="4")
          account-general(:info="getElement('personalData', {})" :avatar-url="avatarUrl")
        b-col(xs="12" sm="12" md="6" lg="4" xl="4" v-if="showGoogle")
          account-google(:info="getElement('google', {})")
        b-col(xs="12" sm="12" md="6" lg="4" xl="4" v-if="showFacebook")
          account-facebook(:info="getElement('facebook', {})")
        b-col(xs="12" sm="12" md="6" lg="4" xl="4" v-if="showMicrosoft")
          account-microsoft(:info="getElement('microsoft', {})")
    b-jumbotron(v-if="!dataValid" header="Fehler" lead="Benutzerdaten konnten nicht geladen werden:")
      p {{errorMessage}}
      b-button(href="/" variant="primary") Zurück zur Hauptseite

</template>

<script>
import MenuBar from '../menu-bar/menu-bar.vue'
import AccountGeneral from './account-general.vue'
import AccountGoogle from './account-google.vue'
import AccountFacebook from './account-facebook.vue'
import AccountMicrosoft from './account-microsoft.vue'
import {getUserInfo} from '../../adapters/userInfo'
import {get} from 'lodash';

export default {
  name      : 'AccountRoot',
  components: {MenuBar, AccountGeneral, AccountFacebook, AccountGoogle, AccountMicrosoft},
  filters   : {},
  model     : {},
  props     : {},
  data      : function () {
    return {
      userInfo    : {},
      avatarUrl   : '',
      dataValid   : true,
      errorMessage: ''
    };
  },
  computed  : {
    showGoogle() {
      return get(this.userInfo, 'google.valid', false);
    },
    showFacebook() {
      return get(this.userInfo, 'facebook.valid', false);
    },
    showMicrosoft() {
      return get(this.userInfo, 'microsoft.valid', false);
    }
  },
  created   : function () {
    getUserInfo((err, info) => {
      if (err) {
        console.error('Error while reading user info', err);
        this.errorMessage = `Status: ${err.status}, Status-Text: ${err.statusText}`;
        this.dataValid    = false;
        return;
      }
      this.avatarUrl = get(info, 'personalData.avatar', '');
      console.log('avatar', this.avatarUrl, info);
      if (this.avatarUrl.length === 0) {
        this.avatarUrl = get(info, 'personalData.generatedAvatar', '');
      }

      this.userInfo = info;
      console.log(info);
    })
  },
  methods   : {
    getElement: function (e, def) {
      let d = def || '';
      return get(this.userInfo, e, d);
    }
  }
}
</script>

<style scoped>

</style>
