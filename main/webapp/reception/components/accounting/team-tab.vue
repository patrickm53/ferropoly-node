<!---
  A single tab with data about all transactions of a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.12.21
-->
<template lang="pug">
  b-tab(:title="titleText")
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
      template(#cell(transaction)="data") {{data.item.transaction | formatInfo}}
      template(#cell(timestamp)="data") {{data.item.timestamp | formatTime}}
      template(#cell(transaction.amount)="data") {{data.item.transaction.amount | formatPrice}}
      template(#cell(balance)="data") {{data.item.balance | formatPrice}}
      template(#cell(transaction.parts)="row")
        b-button(v-if="row.item.transaction.parts.length > 0" size="sm" @click="row.toggleDetails") Details ({{row.item.transaction.parts.length}})  {{ row.detailsShowing ? 'verbergen' : 'anzeigen' }}
      template(#row-details="row")
        b-card
          b-table-simple(small)
            b-tbody
              b-tr(v-for="(value, key) in row.item.transaction.parts" :key="key")
                b-td {{ value.propertyName }}
                b-td(v-if="value.buildingNb") {{ value.buildingNb }} {{value.buildingNb > 4 ? 'Hotel' : '. Haus'}}
                b-td {{ value.amount | formatPrice}}
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatPrice, formatTime} from '../../../common/lib/formatters'


/**
 * Formatter for the info about the transaction
 * @param transaction
 * @returns {string}
 */
function formatInfo(transaction) {
  let retVal = transaction.info
  if (transaction.origin.category === 'team') {
    retVal += ' (';
    retVal += transaction.amount < 0 ? 'an ' : 'von ';
    retVal += transaction.origin.teamName + ')';
  }
  return retVal;
}


export default {
  name      : 'TeamTab',
  components: {},
  filters   : {formatPrice, formatTime, formatInfo},
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
    return {
      perPage    : 10,
      currentPage: 1,
      elementNb  : 0,
      fields     : [
        {key: 'timestamp', label: 'Zeit'},
        {key: 'transaction', label: 'Buchungstext'},
        {key: 'transaction.amount', label: 'Betrag', thClass: 'text-right', tdClass: 'text-right'},
        {key: 'balance', label: 'Saldo', thClass: 'text-right', tdClass: 'text-right'},
        {key: 'transaction.parts', label: 'Teiltransaktionen', thStyle: {width: '50% !important'}}
      ]
    };
  },
  computed  : {
    ...mapFields({}),
    rows() {
      return this.elementNb
    },
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
    console.log('created tab');
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
