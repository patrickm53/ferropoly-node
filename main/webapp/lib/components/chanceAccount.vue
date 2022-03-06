<!---
  The Chance Account: all chance transactions
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 01.01.22
-->
<template lang="pug">
  div
    b-pagination(
      v-model="currentPage"
      limit="10"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="accounting-table"
    )
    b-table(
      id="accounting-table"
      striped
      borderless
      hover
      small
      :per-page="perPage"
      :current-page="currentPage"
      :items="transactions"
      :fields="fields")
      template(#cell(transaction.origin.uuid)="data") {{teamName(data.item.transaction.origin.uuid)}}
      template(#cell(timestamp)="data") {{data.item.timestamp | formatTime}}
      template(#cell(transaction.amount)="data") {{data.item.transaction.amount | formatPrice}}
      template(#cell(balance)="data") {{data.item.transaction.info}}


</template>

<script>
import {formatPrice, formatTime} from '../../common/lib/formatters'


export default {
  name      : 'ChanceAccount',
  components: {},
  filters   : {
    formatPrice, formatTime
  },
  mixins    : [],
  model     : {},
  props     : {
    transactions: {
      type   : Array,
      default: function () {
        return [];
      }
    }
  },
  data      : function () {
    return {
      perPage    : 10,
      currentPage: 1,
      elementNb  : 0,
      fields     : [
        {key: 'timestamp', label: 'Zeit'},
        {key: 'transaction.origin.uuid', label: 'Team'},
        {key: 'transaction.info', label: 'Info'},
        {key: 'transaction.amount', label: 'Betrag', thClass: 'text-right', tdClass: 'text-right'}
      ]
    };
  },
  computed  : {
    rows() {
      return this.transactions.length;
    }
  },
  created   : function () {
  },
  methods   : {
    teamName(id) {
      return this.$store.getters['teams/idToTeamName'](id);
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
