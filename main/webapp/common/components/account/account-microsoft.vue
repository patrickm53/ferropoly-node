<!---
  Microsoft Account Info
-->
<template lang="pug">
#microsoft-info
  b-card(no-body)
    b-card-header.title Microsoft
    b-card-body
      b-card-text
        h4 Microsoft Profil ID
        | {{getElement('id')}}
        h4 Email-Adresse
        | {{getElement('email')}}
        //h4 Avatar
        //img.avatar(:src="getElement('avatar')")
</template>

<script>
import {get} from "lodash";

export default {
  name      : "AccountMicrosoft",
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
