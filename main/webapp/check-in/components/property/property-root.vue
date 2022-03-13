<!---
  View for the teams properties, what they possess
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  b-container(fluid=true)
    b-row
      b-col
        h1 Besitz
        p(v-if="properties.length === 0") Euer Team besitzt aktuell noch keine Orte.
        p(v-if="properties.length > 0") Euer Team besitzt aktuell {{properties.length}} Orte:
    b-row
      b-col.mt-2(v-for="property in properties" :key="property.uuid" xs="12" sm="6" lg="4")
        team-property(:property="property" :property-value="evaluateValue(property)")


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import TeamProperty from './team-property.vue';
import {sortBy} from 'lodash';
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'PropertyRoot',
  components: {TeamProperty},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teamId: 'checkin.team.uuid',
      propertyRegister: 'properties.register'
    }),
    properties() {
      let t = this.$store.getters['propertyRegister/getPropertiesForTeam'](this.teamId)
      return sortBy(t, p => {
        return p.location.name;
      });
    }
  },
  created   : function () {
  },
  methods   : {
    evaluateValue(prop) {
      return formatPrice(this.$store.getters['propertyRegister/getPropertyValue'](prop));
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
