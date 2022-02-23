<!---
  The navigation Tab with all buying / gambling in it
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.22
-->
<template lang="pug">
  div
    b-row.mt-1
      b-col(sm="6")
        ferro-card(title="Liegenschaft kaufen" size="sm")
          property-selector#prop-selector(
            ref="propSelector"
            :properties="properties"
            per-page="40"
            @buy-property="onBuyProperty"
            :disabled="buyingPropertyActive")
          modal-info-yes-no(ref="buyConfirmationDialog" @yes="onBuyPropertyConfirmed" @no="onBuyPropertyDenied")
      b-col(sm="6")
        b-row
          b-col(sm="6")
            ferro-card(title="Häuserbau" size="sm")
              #building
                b-button(@click="buildHouses" :disabled="buildingHousesActive") Überall Häuser bauen
                p Zur Besitzliste um einzelne Häuser zu bauen
          b-col(sm="6")
            ferro-card(title="Gambling" size="sm")
              #gambling
                gambling-controls(
                  :min="gamblingMin"
                  :max="gamblingMax"
                  @win="onGamblingWin"
                  @loose="onGamblingLoose"
                  :disabled="gamblingActive"
                )
        b-row
          b-col(sm="12")
            ferro-card(title="Anruf-Log" size="sm")
              call-log#log(:log-entries="log" ref="logCard")

</template>

<script>
import FerroCard from '../../../../common/components/ferro-card/ferro-card.vue';
import PropertySelector from './property-selector.vue';
import GamblingControls from './gambling-controls.vue';
import CallLog from './call-log.vue';
import {mapFields} from 'vuex-map-fields';
import axios from 'axios';
import {get, max} from 'lodash';
import {formatPrice} from '../../../../common/lib/formatters';
import $ from 'jquery';
import ModalInfoYesNo from '../../../../common/components/modal-info-yes-no/modal-info-yes-no.vue';

export default {
  name      : 'NavContentBuy',
  components: {ModalInfoYesNo, FerroCard, PropertySelector, GamblingControls, CallLog},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      buyingPropertyActive: false,
      gamblingActive      : false,
      buildingHousesActive: false
    };
  },
  computed  : {
    ...mapFields({
      properties    : 'properties.list',
      gameId        : 'gameId',
      teamUuid      : 'call.currentTeam.uuid',
      authToken     : 'authToken',
      gamblingMinVal: 'gameplay.gameParams.chancellery.minLottery',
      gamblingMaxVal: 'gameplay.gameParams.chancellery.maxLottery',
      log           : 'call.log'
    }),
    gamblingMin() {
      return this.gamblingMinVal.toString();
    },
    gamblingMax() {
      return this.gamblingMaxVal.toString();
    }
  },
  mounted   : function () {
    this.resizeHandler();
  },
  created   : function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    /**
     * Event when a property shall be bought
     * @param p
     */
    onBuyProperty(p) {
      this.buyingPropertyActive = true;
      console.log(`Buy ${p.uuid}`);
      let property = this.$store.getters.getPropertyById(p.uuid);
      let teamName = this.$store.getters.teamIdToTeamName(this.teamUuid);
      this.$refs.buyConfirmationDialog.showDialog({
        title  : 'Kauf bestätigen',
        info   : `Bitte bestätigen, dass ${teamName} folgendes Grundstück kaufen will:<br/>`,
        message: `<h4>${property.location.name}</h4><p>Kaufpreis: ${formatPrice(property.pricelist.price)}</p>`,
        context: property
      });

    },
    onBuyPropertyConfirmed(p) {
      console.log('BUY CONFIRMED', p);
      axios.post(
          `/marketplace/buyProperty/${this.gameId}/${this.teamUuid}/${p.uuid}`,
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
            this.$store.dispatch({type: 'updateTravelLog', teamUuid: this.teamUuid});
          })
          .catch(err => {
            console.error(err);
            let errorText = get(err, 'message', 'Fehler /marketplace/buyProperty');
            errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
            console.error(errorText);
            this.$store.dispatch({
              type : 'logFail',
              title: 'Programmfehler',
              msg  : errorText
            });
          })
          .finally(() => {
            this.buyingPropertyActive = false;
          })
    },
    onBuyPropertyDenied(p) {
      console.log('Buying property canceled', p);
      this.buyingPropertyActive = false;
    },
    /**
     * Creates the maximum Size of the control boxes
     */
    resizeHandler() {
      // Property Selector
      let element       = $('#prop-selector');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      if (offsetElement) {
        element.height(hDoc - offsetElement.top - 20);
      }

      // The two cards close each other: same size
      let buildingCard = $('#building');
      let gamblingCard = $('#gambling');
      let cardHeight   = max([buildingCard.height(), gamblingCard.height()]);
      buildingCard.height(cardHeight);
      gamblingCard.height(cardHeight);

      // Log takes the rest
      let logCard       = $('#log');
      let logCardOffset = logCard.offset();
      if (logCardOffset) {
        logCard.height(hDoc - logCardOffset.top - 20);
      }
      if (this.$refs.propSelector) {
        // only here after rendering!
        this.$refs.propSelector.resizeHandler();
      }
      if (this.$refs.logCard) {
        // only here after rendering!
        this.$refs.logCard.resizeHandler();
      }
    },
    onGamblingWin(v) {
      console.log('we have a winner');
      this.gamble(parseInt(v));
    },
    onGamblingLoose(v) {
      console.log('we have a looser');
      this.gamble(parseInt(v) * -1);
    },
    /**
     * Runs the gambling route
     * @param amount
     */
    gamble(amount) {
      console.log(`Gambling ${amount}`);
      this.gamblingActive = true;
      axios.post(`/chancellery/gamble/${this.gameId}/${this.teamUuid}`,
          {
            authToken: this.authToken,
            amount   : amount
          })
          .then(resp => {
            let res      = resp.data.result;
            let logEntry = {
              title: res.infoText,
              msg  : formatPrice(res.amount)
            }
            if (res.amount < 0) {
              logEntry.type = 'logFail';
            } else {
              logEntry.type = 'logSuccess';
            }
            this.$store.dispatch(logEntry);
          })
          .catch(err => {
            console.error(err);
            let errorText = get(err, 'message', 'Fehler /chancellery/gamble');
            errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
            console.error(errorText);
            this.$store.dispatch({
              type : 'logFail',
              title: 'Programmfehler',
              msg  : errorText
            });
          })
          .finally(() => {
            this.gamblingActive = false;
          })
    },
    /** Build houses everywhere */
    buildHouses() {
      console.log(`Building houses`);
      this.buildingHousesActive = true;
      axios.post(`/marketplace/buildHouses/${this.gameId}/${this.teamUuid}`,
          {
            authToken: this.authToken
          })
          .then(resp => {
            let res      = resp.data.result;
            let logEntry = {
              title: 'Hausbau',
              msg  : ''
            }
            if (res.amount === 0) {
              logEntry.msg  = 'Es konnten keine Häuser gebaut werden';
              logEntry.type = 'logInfo';
            } else {
              logEntry.msg = `Belastung: ${formatPrice(res.amount)}, Gebaute Häuser: `;
              res.log.forEach(e => {
                logEntry.msg += `${e.propertyName} (${e.buildingNb} / ${formatPrice(e.amount)}) `;
              })
              logEntry.type = 'logSuccess';
            }
            this.$store.dispatch(logEntry);
          })
          .catch(err => {
            let errorText = get(err, 'message', 'Fehler /marketplace/buildHouses');
            errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
            console.error(err, errorText);
            this.$store.dispatch({
              type : 'logFail',
              title: 'Programmfehler',
              msg  : errorText
            });
          })
          .finally(() => {
            this.buildingHousesActive = false;
          })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
