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
</template>

<script>
import {get} from 'lodash';

export default {
  name: 'AccountFacebook',
  components: {},
  filters: {},
  model: {},
  props: {
    info: {
      type: Object, default: () => {
        return {};
      }
    }
  },
  data: function () {
    return {};
  },
  methods: {
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
