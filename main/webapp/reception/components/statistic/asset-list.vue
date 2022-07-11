<!---
  The list with the asset, this is not a ranking list! (even it can be sorted)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 20.02.22
-->
<template lang="pug">
  div
    b-table(
      striped
      borderless
      hover
      small
      sort-by="name"
      :items="list"
      :fields="fields")
      template(#cell(asset)="data") {{data.item.asset | formatPrice}}

</template>

<script>
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name: "AssetList",
  components: {},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {
    list: {
      type: Array,
      default: ()=> {
        return [];
      }
    }
  },
  data      : function () {
    return {
      fields: [
        {key: 'rank', label: 'Rang'},
        {key: 'name', label: 'Team'},
        {key: 'asset', label: 'Vermögen'}
      ]
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
