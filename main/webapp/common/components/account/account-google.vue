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
  name      : "AccountGoogle",
  components: {},
  filters   : {},
  model     : {},
  props: {
    info: {
      type: Object, default: () => {
        return {};
      }
    }
  },
  data      : function () {
    return {};
  },
  methods   : {
    getElement: function (e, def) {
      console.log(this.info);
      let d = def || '';
      return get(this.info, e, d);
    }
  }
}
</script>

<style scoped>

</style>
