<!---
  Login control
-->
<template lang="pug">
  #login
    #wrap
      menu-bar(show-user-box=false :elements-right="menuElementsRight")
      .login-box.ls-box-shape
        h3 {{appName}} Login
        b-row
          b-col.mt-3(xs="12" sm="12" md="6")
            form(action='login' method='post')
              label(for='inputUserName' class='sr-only') Loginname
              input(type='text' name='username' id='inputUserName' class='form-control' placeholder='Benutzername' required autofocus)
              label(for='inputPassword' class='sr-only') Passwort
              input.mt-2(type='password' name='password' id='inputPassword' class='form-control' placeholder='Passwort' required)
              br
              button#button-login.btn.btn-primary.btn-block(type='submit') Login mit Passwort
          b-col.mt-3(xs="12" sm="12" md="6")
            b-button(href='/auth/google' block large variant="danger")
              b-icon-google
              | &nbsp;Login mit Google
            b-button.mt-3(href='/auth/facebook' block large variant="primary")
              b-icon-facebook
              | &nbsp;Login mit Facebook
            b-button.mt-3(href='/auth/microsoft' block large variant="success")
              font-awesome-icon.no-url(:icon="['fab', 'windows']")
              | &nbsp;Login mit Microsoft
        b-row.mt-3(v-if="preview")
          b-col
            p Dies ist eine Preview-Version, Login ist nur mit Social Media Accounts und den Demo-User Logins möglich.
              | Mehr Infos dazu auf der &nbsp;
              a(href="https://www.ferropoly.ch/server/") Ferropoly Webseite
              |.
        b-row.mt-3(v-if="!preview")
          b-col
            p Loge Dich mit einem bestehenden Social Media Account ein oder&nbsp;
              a(href="https://auth.ferropoly.ch") erstelle Dein kostenloses Login
              |.

</template>

<script>
import $ from 'jquery'
import MenuBar from '../menu-bar/menu-bar.vue'
import {BIconGoogle, BIconFacebook} from 'bootstrap-vue';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faWindows} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import axios from 'axios';
import {get} from 'lodash';

library.add(faWindows);

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name      : 'Login',
  components: {MenuBar, BIconGoogle, BIconFacebook, FontAwesomeIcon},
  filters   : {},
  model     : {},
  props     : {
    appName: {
      type   : String,
      default: function () {
        return 'Ferropoly Editor';
      }
    }
  },
  data      : function () {
    return {
      menuElementsRight: [
        {title: 'Impressum / Kontakt', href: 'https://www.ferropoly.ch', hide: false}
      ],
      debug: false,
      preview: false
    };
  },
  created   : function () {
    let self = this;
    // Set background randomly
    let i = Math.floor(((new Date().getMilliseconds() / 10) % 15) + 1);
    console.log('Background', i);
    $('body').addClass('bg' + i);

    axios.get('/appinfo/login')
        .then(resp => {
          self.preview = get(resp, 'data.settings.preview', false);
          self.debug = get(resp, 'data.settings.preview', false);
          console.log('Welcome to Ferropoly!', resp.data);
        })
        .catch(ex => {
          console.error(ex);
        })
  },
  methods   : {

  }
}
</script>

<style scoped>
body {
  /* background-image: url("/images/ferropoly_background01.jpg");*/
  background-clip: border-box;
  background-size: cover;
}

/* Wrapper for page content to push down footer */
#login {
  min-height: 100%;
  height: auto;
  /* Negative indent footer by its height */
  margin: 0 auto -20px;
  /* Pad bottom by footer height */
  padding: 0 0 20px;
}

.login-box {
  max-width: 630px;
}

.ls-box-shape {
  padding: 15px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  margin-top: 30px;
}

.form-signin :focus {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}


</style>
