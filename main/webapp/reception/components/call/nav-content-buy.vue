<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.22
-->
<template lang="pug">
  div
    b-row
      b-col(sm="6")
        ferro-card(title="Liegenschaft kaufen" size="sm")
          property-selector(
            :properties="properties"
            per-page="8"
            @buy-property="onPropertyBought"
            :disabled="buyingPropertyActive")
      b-col(sm="6")
        b-row
          b-col(sm="6")
            ferro-card(title="Häuserbau" size="sm")
              b-button Überall Häuser bauen
              p Zur Besitzliste um einzelne Häuser zu bauen
          b-col(sm="6")
            ferro-card(title="Gambling" size="sm")
              gambling-controls
        b-row
          b-col(sm="12")
            ferro-card(title="Anruf-Log" size="sm")
              call-log(:log-entries="log")

</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import PropertySelector from './property-selector.vue';
import GamblingControls from './gambling-controls.vue';
import CallLog from './call-log.vue';
import {mapFields} from 'vuex-map-fields';
import axios from 'axios';
import {get} from 'lodash';
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'NavContentBuy',
  components: {FerroCard, PropertySelector, GamblingControls, CallLog},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      buyingPropertyActive: false
    };
  },
  computed  : {
    ...mapFields({
      properties: 'properties.list',
      gameId    : 'gameId',
      teamUuid  : 'call.currentTeam.uuid',
      authToken : 'authToken',
      log: 'call.log'
    }),
  },
  created   : function () {
  },
  methods   : {
    onPropertyBought(p) {
      this.buyingPropertyActive = true;
      console.log(`Buy ${p.uuid}`);
      axios.post(`/marketplace/buyProperty/${this.gameId}/${this.teamUuid}/${p.uuid}`,
          {authToken: this.authToken}
      )
          .then(resp => {
            let res   = resp.data.result;
            let title = `Kauf ${get(res, 'property.location.name', 'unbekanntes Ort')}`
            if (res.owner) {
              // belongs to another team
              this.$store.dispatch({
                type: 'logFail',
                title,
                msg : `Das Grundstück ist bereits verkauft, Mietzins ${formatPrice(res.amount)}`
              });
            } else if (res.amount === 0) {
              // our own
              this.$store.dispatch({type: 'logInfo', title, msg: 'Das Grundstück gehört der anrufenden Gruppe'});
            } else {
              // bought !!!
              this.$store.dispatch({
                type: 'logSuccess',
                title,
                msg : `Grundstück gekauft, Preis: ${formatPrice(res.amount)}`
              });
            }
            this.$store.dispatch({type:'updateTravelLog', teamUuid: this.teamUuid});
          })
          .catch(err => {
            console.error(err);
            let errorText = get(err, 'message', 'Fehler /marketplace/buyProperty');
            errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
            console.error(errorText);
            this.$store.dispatch({
              type: 'logFail',
              title: 'Programmfehler',
              msg : errorText
            });
          })
          .finally(() => {
            this.buyingPropertyActive = false;
          })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
