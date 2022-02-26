<!---
  Property navigation tab
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 29.01.22
-->
<template lang="pug">
  div
    b-row.mt-1
      b-col(sm="6")
        ferro-card(title="Liegenschaften" size="sm")
          p Anzahl Liegenschaften: {{propertyNb}}
          own-property-list(
            :property-register="propertyRegister"
            :team-id="teamId"
            :enabled="enabled"
            @buy-house="onBuyHouse"
            :buying-disabled="buyingHouseDisabled")
        b-toast(id="building-error" title="Hausbau" variant="danger")
          p {{buildingErrorMessage}}
      b-col(sm="6")
        ferro-card(title="Konto" size="sm")
          team-account#team-account(:transactions="transactions")

</template>

<script>
import FerroCard from '../../../../common/components/ferro-card/ferro-card.vue';
import TeamAccount from '../../../../lib/components/teamAccount.vue';
import OwnPropertyList from './own-property-list.vue';
import {mapFields} from 'vuex-map-fields';
import {get} from 'lodash';
import axios from 'axios';
import {formatPrice} from '../../../../common/lib/formatters';

export default {
  name      : 'NavContentProperty',
  components: {FerroCard, TeamAccount, OwnPropertyList},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    enabled: {
      type   : Boolean,
      default: () => {
        return true;
      }
    }
  },
  data      : function () {
    return {
      buyingHouseDisabled : false,
      buildingErrorMessage: ''
    };
  },
  computed  : {
    ...mapFields({
      gameId          : 'gameId',
      teamId          : 'call.currentTeam.uuid',
      propertyRegister: 'propertyRegister.register',
      authToken       : 'authToken'
    }),
    /**
     * Transactions of the team
     * @returns {*}
     */
    transactions() {
      let transactions = this.$store.getters.teamAccountData(this.teamId);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.elementNb   = transactions.length;
      return transactions;
    },
    /**
     * Returns the number of properties
     * @returns {number}
     */
    propertyNb() {
      return this.propertyRegister.getNbOfPropertiesOfTeam(this.teamId);
    }
  },
  mounted   : function () {

  },
  created   : function () {

  },
  destroyed() {

  },
  methods: {
    onBuyHouse(property) {

      this.buyingHouseDisabled = true;
      axios.post(`/marketplace/buildHouse/${this.gameId}/${this.teamId}/${property.uuid}`,
          {
            authToken: this.authToken
          })
          .then(resp => {
            let res      = resp.data.result;
            let logEntry = {
              title: 'Hausbau',
              msg  : ''
            }

            console.log('Buy a property', resp, res);
            if (res.amount === 0) {
              logEntry.msg  = `In ${property.location.name} konnte nicht gebaut werden`;
              logEntry.type = 'logInfo'
            } else {
              logEntry.msg  = `Belastung für Hausbau in ${property.location.name}: ${formatPrice(res.amount)}`
              logEntry.type = 'logSuccess';
            }
            this.$store.dispatch(logEntry);
          })
          .catch(err => {
            console.error(err);
            let errorText = get(err, 'message', 'Fehler /marketplace/buildHouse');
            errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
            console.error(errorText);
            this.$store.dispatch({
              type : 'logFail',
              title: 'Programmfehler',
              msg  : errorText
            });
            this.buildingErrorMessage = `Fehler beim Hausbau: ${errorText}`;
            this.$bvToast.show('building-error')
          })
          .finally(() => {
            this.buyingHouseDisabled = false;
          })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
