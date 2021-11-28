<!--
  - Copyright (c) 2021 Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  -->

<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 28.11.21
-->
<template lang="pug">
  b-form-row
    b-col
      p {{member.login}}
    b-col
      p {{forename}} {{surname}}


</template>

<script>
import {get} from 'lodash';

export default {
  name      : 'team-entry',
  props     : {
    member: {
      type   : Object,
      default: function () {
        return {
          login       : '',
          personalData: {
            avatar  : '',
            forename: '',
            surname : ''
          }
        }
      }
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    forename() {
      return get(this.member, 'personalData.forename', '');
    },
    surname() {
     return get(this.member, 'personalData.surname', '');
    }
  },
  methods   : {},
  components: {},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
