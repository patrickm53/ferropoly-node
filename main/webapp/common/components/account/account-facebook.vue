<!---
  Facebook Account Info
-->
<template lang="pug">
#facebook-info
  b-card(no-body)
    b-card-header.title Facebook
    b-card-body
      b-card-text
        h4 Facebook Profil ID
        | {{getElement('id')}}
        h4 Email-Adresse
        | {{getElement('email')}}
        h4 Avatar
        img.avatar(:src="getElement('avatar')")
</template>

<script>
import {get} from "lodash";

export default {
  name      : "account-facebook",
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
