<!---
  Root Element for the check-in pricelist
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div
    b-table(striped
    small
    :items="propertyRegister.properties"
      :fields="fields"
      responsive="sm"
      sort-icon-left)
      // eslint-disable-next-line vue/valid-v-slot
      template(#cell(pricelist.position)="data") {{data.item.pricelist.position + 1}}
      template(#cell(location)="data") {{data.item.location.name}} &nbsp;
        font-awesome-icon.no-url.flag(:icon="['fas', 'flag']" v-if="propertyBelongsToTeam(data.item)")
      template(#cell(pricelist.price)="data") {{data.item.pricelist.price | formatPrice}}


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatPrice} from '../../../common/lib/formatters';
import {get} from 'lodash';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faFlag} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

library.add(faFlag);

export default {
  name      : 'PricelistRoot',
  components: {FontAwesomeIcon},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      fields: [
        {key: 'pricelist.position', label: 'Pos', sortable: true},
        {key: 'location', label: 'Ort', sortable: true},
        {key: 'pricelist.propertyGroup', label: 'Gruppe', sortable: true},
        {key: 'pricelist.price', label: 'Kaufpreis', sortable: true},
      ]
    };
  },
  computed  : {
    ...mapFields({
      propertyRegister: 'propertyRegister.register'
    }),
  },
  created   : function () {
  },
  methods   : {
    propertyBelongsToTeam(location) {
      let owner = get(location, 'gamedata.owner', null);
      if (!owner) {
        return false;
      }
      console.log('OWNER', location);
      return true;
    }
  }
}
</script>


<style lang="scss" scoped>
.flag {
  color: red;
}
</style>
