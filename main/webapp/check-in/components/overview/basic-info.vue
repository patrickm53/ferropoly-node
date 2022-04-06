<!---
  Basic info of a game for checkin
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.04.22
-->
<template lang="pug">
  div.shadow.rounded.info-box
    b-row
      b-col(xs="7")
        .checkin-info Vermögen
      b-col(xs="5")
        .checkin-amount {{balance | formatPrice}}
    b-row
      b-col(xs="7")
        .checkin-info Gekaufte Orte
      b-col(xs="5")
        .checkin-amount {{nbProperties}}
    b-row
      b-col(xs="7")
        .checkin-info Parkplatz
      b-col(xs="5")
        .checkin-amount {{chancelleryAsset | formatPrice}}


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'BasicInfo',
  components: {},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teamId          : 'checkin.team.uuid',
      propertyRegister: 'properties.register',
      chancelleryAsset: 'checkin.chancelleryAsset',
      nbProperties    : 'checkin.nbProperties'
    }),
    propertyNb() {
      let t = this.$store.getters['propertyRegister/getPropertiesForTeam'](this.teamId) || [];
      return t.length;
    },
    balance() {
      return this.$store.getters.teamAccountBalance(this.teamId);
    }
  },
  created   : function () {
  },
  methods   : {
  }
}
</script>

<style lang="scss" scoped>
.checkin-info {
  font-size: 18px;
  display: compact;
}

.checkin-amount {
  font-size: 18px;
  text-align: right;
  display: compact;
}

.info-box {
  padding: 10px;
  margin-bottom: 20px;
}
</style>
