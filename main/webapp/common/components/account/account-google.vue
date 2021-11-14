<!---
  Googgle Account Info
-->
<template lang="pug">
#google-info
  b-card(no-body)
    b-card-header.title Google
    b-card-body
      b-card-text
        h4 Google Profil ID
        | {{getElement('id')}}
        h4 Email-Adresse
        | {{getElement('email')}}
        h4 Avatar
        img.avatar(:src="getElement('avatar')")
</template>

<script>
import {get} from "lodash";

export default {
  name      : "account-google",
  props     : {info: Object, default: {}},
  data      : function () {
    return {};
  },
  model     : {},
  methods   : {
    getElement: function (e, def) {
      console.log(this.info);
      let d = def || '';
      return get(this.info, e, d);
    }
  },
  components: {},
  filters   : {}
}
</script>

<style scoped>

</style>
