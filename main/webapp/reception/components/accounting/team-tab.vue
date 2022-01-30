<!---
  A single tab with data about all transactions of a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.12.21
-->
<template lang="pug">
  b-tab(:title="titleText")
    team-account(:transactions="transactions")
</template>

<script>
import TeamAccount from '../../../lib/components/teamAccount.vue';

export default {
  name      : 'TeamTab',
  components: {TeamAccount},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    teamId: {
      type   : String,
      default: 'none'
    },
    title : {
      // Optional title, team is used if not set
      type   : String,
      default: undefined
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    transactions() {
      let transactions = this.$store.getters.teamAccountData(this.teamId);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.elementNb   = transactions.length;
      return transactions;
    },
    teamName() {
      return this.$store.getters.teamIdToTeamName(this.teamId)
    },
    /**
     * Title text of the tab
     * @returns {*}
     */
    titleText() {
      if (this.title) {
        return title;
      }
      return this.teamName;
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
