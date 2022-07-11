<!---
  The team Account summary, mobile version
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 03.04.22
-->
<template lang="pug">
  div
    b-pagination(
      v-model="currentPage"
      limit="10"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="accounting-table"
      @change="onPaginationChange"
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
      template(#cell(transaction)="data")
        span.details-available(@click="toggleDetails(data)" v-if="getProp(data, 'item.transaction.parts.length', 0) > 0") {{getProp(data, 'item.transaction', 'Fehler') | formatInfo}} &nbsp;
          font-awesome-icon.no-url(:icon="['fas', 'circle-info']")
        span(v-if="getProp(data, 'item.transaction.parts.length', 0) === 0") {{getProp(data, 'item.transaction', 'Fehler') | formatInfo}}
        br
        span &nbsp;
      template(#cell(timestamp)="data") {{data.item.timestamp | formatTime}}
      template(#cell(transaction.amount)="data") {{getProp(data, 'item.transaction.amount', 0) | formatPrice}}
      template(#cell(balance)="data") {{getProp(data, 'item.balance', 0) | formatPrice}}
      template(#cell(transaction.parts)="row")
      template(#row-details="row")
        b-card(v-if="getProp(row, 'item.transaction.parts.length', 0) > 0")
          b-table-simple(small)
            b-tbody
              b-tr(v-for="(value, key) in getProp(row, 'item.transaction.parts', [])" :key="key")
                b-td {{ value.propertyName }}
                b-td(v-if="value.buildingNb > 0 && value.buildingNb < 5") {{ value.buildingNb }}. Haus
                b-td(v-if="value.buildingNb > 4") Hotel
                b-td {{ value.amount | formatPrice}}

</template>

<script>
import {formatPrice, formatTime} from '../../../common/lib/formatters'
import {get} from 'lodash';
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
library.add(faCircleInfo);
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
  name      : 'TeamAccountMobile',
  components: {FontAwesomeIcon},
  filters   : {formatPrice, formatTime, formatInfo},
  mixins    : [],
  model     : {},
  props     : {
    teamId      : {
      type   : String,
      default: 'none'
    },
    title       : {
      // Optional title, team is used if not set
      type   : String,
      default: undefined
    },
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
      currentPage: 1000, // sets to the last page
      elementNb  : 0,
      fields     : [
        {key: 'timestamp', label: 'Zeit'},
        {key: 'transaction', label: 'Buchungstext'},
        {key: 'transaction.amount', label: 'Betrag', thClass: 'text-right', tdClass: 'text-right'},
        {key: 'balance', label: 'Saldo', thClass: 'text-right', tdClass: 'text-right'},
      //  {key: 'transaction.parts', label: 'Teiltransaktionen', thStyle: {width: '50% !important'}}
      ]
    };
  },
  computed  : {
    rows() {
      return this.transactions.length;
    },
  },
  created   : function () {
  },
  methods   : {
    onPaginationChange(page) {
      // not used yet
    },
    getProp(obj, path, def) {
      return get(obj, path, def);
    },
    toggleDetails(row) {
      if (get(row, 'item.transaction.parts.length', 0) > 0) {
        row.toggleDetails();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.details-available {
  color: blue;
}
</style>
