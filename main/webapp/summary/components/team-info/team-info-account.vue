<!---
  Team Info account
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.04.22
-->
<template lang="pug">
  div
    b-row.mt-2
      b-col(xs="12")
        team-account(:team-id="teamId" :transactions="transactions" )
  


</template>

<script>
import TeamAccount from '../../../lib/components/teamAccount.vue';
export default {      name: 'TeamInfoAccount',
  components: {TeamAccount},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {teamId: {
      type   : String,
      default: () => {
        return 'none'
      }
    }},
  data      : function () {
    return {};
  },
  computed  : {
    transactions() {
      return this.$store.getters['teamAccountData'](this.teamId);
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
