<!---
  A single tab with data
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.12.21
-->
<template lang="pug">
  b-tab(:title="teamName")
    b-pagination(
      v-model="currentPage"
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
      :filter-function="filterEntries",
      :filter="teamId"
      :per-page="perPage"
      :current-page="currentPage"
      :items="accountingList"
      :fields="fields"
      @filtered="onFiltered")
      template(#cell(transaction)="data") {{data.item.transaction | formatInfo}}
      template(#cell(timestamp)="data") {{data.item.timestamp | formatTime}}
      template(#cell(transaction.amount)="data") {{data.item.transaction.amount | formatPrice}}
      template(#cell(balance)="data") {{data.item.balance | formatPrice}}
      template(#cell(transaction.parts)="data") {{data.item.transaction.parts | formatTransaction}}


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatPrice, formatTime} from '../../../common/lib/formatters'


/**
 * Formats the transaction field
 * @param transactions
 * @returns {string}
 */
function formatTransaction(transactions) {
  let retVal = '';
  transactions.forEach(t => {
    if (retVal.length > 0) {
      retVal += '; '
    }
    retVal += `${t.propertyName}: ${formatPrice(t.amount)}`
  });
  return retVal;
}

function formatInfo(transaction) {
  return '** ' + transaction.info
}


export default {
  name      : 'TeamTab',
  components: {},
  filters   : {formatPrice, formatTime, formatTransaction, formatInfo},
  mixins    : [],
  model     : {},
  props     : {
    teamId: {
      type   : String,
      default: 'none'
    }
  },
  data      : function () {
    return {
      perPage    : 10,
      currentPage: 1,
      elementNb  : 0,
      fields     : [
        {key: 'timestamp', label: 'Zeit'},
        {key: 'transaction', label: 'Buchungstext'},
        {key: 'transaction.amount', label: 'Betrag', thClass:'text-right', tdClass:'text-right'},
        {key: 'balance', label: 'Saldo', thClass:'text-right', tdClass:'text-right'},
        {key: 'transaction.parts', label: 'Teiltransaktionen'}
      ]
    };
  },
  computed  : {
    ...mapFields({
      accountingList: 'teamAccount.list'
    }),
    rows() {
      return this.elementNb
    },
    teamName() {
      return this.$store.getters.teamIdToTeamName(this.teamId)
    },
  },
  created   : function () {
  },
  methods   : {
    onFiltered(list, nb) {
      console.log('filtered', nb);
      this.elementNb = nb;
    },
    filterEntries(item, filter) {
      return item.teamId === filter;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
