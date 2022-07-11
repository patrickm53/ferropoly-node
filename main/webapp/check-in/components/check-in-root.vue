<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange"
      :help-url="helpUrl"
      show-online-status=true
      :online="online")
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false"
    )
    modal-info-yes-no(ref="info1" size="sm" @yes="onAccept" @no="onDeny")
    overview-root(v-if="panel==='panel-overview'")
    rules-root(v-if="panel==='panel-rules'")
    pricelist-root(v-if="panel==='panel-pricelist'")
    div(v-if="gpsWarningMessageActive")
      no-gps-info(v-if="panel==='panel-accounting'")
      no-gps-info(v-if="panel==='panel-property'")
      no-gps-info(v-if="panel==='panel-map'")
    div(v-if="!gpsWarningMessageActive")
      accounting-root(v-if="panel==='panel-accounting'")
      property-root(v-if="panel==='panel-property'")
      map-root(v-if="panel==='panel-map'")

</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import ModalError from '../../common/components/modal-error/modal-error.vue';
import ModalInfoYesNo from '../../common/components/modal-info-yes-no/modal-info-yes-no.vue';
import MapRoot from './map/map-root.vue';
import NoGpsInfo from './no-gps-info.vue';
import OverviewRoot from './overview/overview-root.vue';
import PricelistRoot from './pricelist/pricelist-root.vue';
import PropertyRoot from './property/property-root.vue';
import RulesRoot from './rules/rules-root.vue';
import AccountingRoot from './accounting/accounting-root.vue';
import {getItem, setBoolean, setString} from '../../common/lib/localStorage';
import {mapFields} from 'vuex-map-fields';
import geograph from '../../common/lib/geograph';
import {DateTime} from 'luxon';

export default {
  name      : 'CheckInRoot',
  components: {
    MenuBar,
    ModalError,
    MapRoot,
    OverviewRoot,
    PricelistRoot,
    PropertyRoot,
    RulesRoot,
    AccountingRoot,
    ModalInfoYesNo,
    NoGpsInfo
  },
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      helpUrls     : {
        'panel-overview'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/overview',
        'panel-map'       : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/map',
        'panel-property'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/property',
        'panel-accounting': 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/accounting',
        'panel-pricelist' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/pricelist',
        'panel-rules'     : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/checkin/rules'
      },
      nextGpsUpdate: DateTime.fromISO(getItem('nextGpsUpdate', '2020-02-20T02:20:22'))
    };
  },
  computed  : {
    ...mapFields({
      menuElements   : 'checkin.menuElements',
      panel          : 'checkin.panel',
      online         : 'api.online',
      teamId         : 'checkin.team.uuid',
      organisatorName: 'gameplay.owner.organisatorName',
      error          : 'api.error',
      authToken      : 'api.authToken',
      gpsAllowed     : 'checkin.gps.usageAllowed',
      gpsActive      : 'checkin.gps.active'
    }),
    apiErrorActive: {
      get() {
        return this.error.active;
      },
      set() {
        this.$store.commit('resetApiError');
      }
    },
    apiErrorText() {
      return this.error.infoText;
    },
    apiErrorMessage() {
      return this.error.message;
    },
    gpsWarningMessageActive() {
      return !(this.gpsAllowed && this.gpsActive);
    },
    helpUrl: {
      get() {
        return this.helpUrls[this.panel];
      }
    }
  },
  mounted   : function () {
    this.gpsAllowed = getItem('GpsAllowed', false);

    this.panelRules = {
      'panel-overview'  : () => {
        return this.gpsAllowed
      },
      'panel-map'       : () => {
        return this.gpsAllowed
      },
      'panel-property'  : () => {
        return this.gpsAllowed
      },
      'panel-accounting': () => {
        return this.gpsAllowed
      },
      'panel-pricelist' : () => {
        return this.gpsAllowed
      },
      'panel-rules'     : () => {
        return this.gpsAllowed
      }

    }

    if (this.gpsAllowed) {
      this.activateGps();
    } else {
      this.$refs.info1.showDialog({
        title  : 'GPS & Ferropoly',
        info   : 'Während dem Spiel wird dein Standort der Zentrale übermittelt, dazu muss das GPS in deinem Handy aktiviert sein. Die Standortdaten werden nur während dem Spiel erfasst und gespeichert, 30 Tage nach dem Spiel werden sie automatisch gelöscht.',
        message: 'Für die Verwendung der Ferropoly App musst Du der Verwendung von GPS zustimmen, bitte bestätige dies mit Click auf "ja".'
      });
    }
  },
  methods   : {
    /**
     * Panel change from menu bar / component
     * @param panel
     */
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.$store.commit('setPanel', panel);
    },
    onAccept() {
      this.gpsAllowed = true;
      setBoolean('GpsAllowed', true);
      this.activateGps();
    },
    onDeny() {
      console.warn('Usage of GPS was denied, that\'s not what we call fairplay!');
    },
    /**
     * Returns true, when it's time to send new GPS coordinates to the system
     * @returns {boolean}
     */
    gpsUpdateNeeded() {
      let now = DateTime.now();
      // console.log('GPS Update needed', this.nextGpsUpdate.toISO(), now.toISO());
      return this.nextGpsUpdate < now;
    },
    /**
     * Sets the timestamp for the next update
     * @param state
     */
    setNextUpdate(state) {
      this.nextGpsUpdate = DateTime.now().plus({minutes: 5});
      setString('nextGpsUpdate', this.nextGpsUpdate);
    },
    /**
     * Activates GPS and cyclic scans
     */
    activateGps() {
      let self = this;
      console.log('Activating GPS', geograph.getLastLocation());
      geograph.on('player-position-update', (pos) => {
        //console.log('GPS on player-position-update', self.$parent.fsocket, this.$store.getters['gameIsActive'], this.gpsUpdateNeeded());

        if (self.$parent.fsocket && this.$store.getters['gameIsActive'] && this.gpsUpdateNeeded()) {
          // An entry sent to the system is returned with the systems timestamp. Therefore, do not add
          // to the store
          console.log('Sending GPS info to system', pos);
          if (!self.$parent.fsocket.emitToGame('player-position', {
            cmd      : 'positionUpdate',
            position : pos,
            timestamp: DateTime.now()
          })) {
            console.log('GPS sending over socket failed, retry later');
            return;
          }
          this.setNextUpdate();
        } else {
          // This is temporary, for this session: adding the current location to the store
          this.$store.dispatch({
            type : 'travelLog/updateGpsPosition',
            entry: {
              position : pos,
              timestamp: DateTime.now(),
              teamId   : this.teamId
            }
          });
        }
        self.gpsActive = true;
      });
      geograph.on('player-position-error', () => {
        console.log('GPS INVALID');
        self.gpsActive = false;
      });
      geograph.startPeriodicScan();
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
