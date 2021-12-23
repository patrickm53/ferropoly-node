<!---
  Login control
-->
<template lang="pug">
  #login
    #wrap
      menu-bar(show-user-box=false :elements-right="menuElementsRight")
      .login-box.ls-box-shape
        h3 {{appName}} Login
        #login-with-password(v-if='passwordLogin')
          form(action='login' method='post')
            label(for='inputUserName' class='sr-only') Loginname
            input(type='text' name='username' id='inputUserName' class='form-control' placeholder='Benutzername' required autofocus)
            label(for='inputPassword' class='sr-only') Passwort
            input(type='password' name='password' id='inputPassword' class='form-control' placeholder='Passwort' required)
            br
            button#button-login.btn.btn-lg.btn-primary.btn-block(type='submit') Login
          br
          button.btn.btn-xs.btn-default.btn-block(@click='enableSocialMediaLogin')
            | Login mit Social Networks
        #login-with-social-networks(v-if='!passwordLogin')
          b-button(href='/auth/google' block large variant="danger")
            b-icon-google
            | &nbsp;Login mit Google
          //a#button-dropbox.btn.btn-lg.btn-primary.btn-block(href='/auth/dropbox')
            i.fa.fa-dropbox
            | &nbsp;Login mit Dropbox
          b-button(href='/auth/facebook' block large variant="primary")
            b-icon-facebook
            | &nbsp;Login mit Facebook
          b-button(href='/auth/microsoft' block large variant="success")
            font-awesome-icon.no-url(:icon="['fab', 'windows']")
            | &nbsp;Login mit Microsoft
          //a#button-twitter.btn.btn-lg.btn-primary.btn-block(href='/auth/twitter')
            i.fa.fa-twitter
            | &nbsp;Login mit Twitter
          button.btn.btn-sm.btn-default.btn-block(@click="enablePasswordLogin")
            | Login mit Passwort

</template>

<script>
import $ from 'jquery'
import MenuBar from '../menu-bar/menu-bar.vue'
import {BIconGoogle, BIconFacebook} from 'bootstrap-vue';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faWindows} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

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
      passwordLogin    : false
    };
  },
  created   : function () {
    // Set background randomly
    let i = Math.floor(((new Date().getMilliseconds() / 10) % 14) + 1);
    console.log('Background', i);
    $('body').addClass('bg' + i);
  },
  methods   : {
    enablePasswordLogin   : function () {
      this.passwordLogin = true;
    },
    enableSocialMediaLogin: function () {
      this.passwordLogin = false;
    }
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
  max-width: 330px;
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
