<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  b-container(fluid)
    h1 Kontobuch
    team-account-mobile(:transactions="transactions")
  
</template>

<script>
import TeamAccountMobile from './team-account-mobile.vue';
import {mapFields} from 'vuex-map-fields';


export default {
  name: "AccountingRoot",
  components: {TeamAccountMobile},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teamId          : 'checkin.team.uuid',
    }),
    transactions() {
      return this.$store.getters.teamAccountData(this.teamId);
    },
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
