<!---
  Join as a new team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div

</template>

<script>

import InputText from '../../../common/components/form-controls/input-text.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name: "team-info",
  props: {},
  data: function() {
    return {};
  },
  model: {},
  created: function() {
  },
  computed: { ...mapFields([
      'teamInfo.name'
    ]),},
  methods: {},
  components: {InputText},
  filters: {},
  mixins: []
}
</script>

<style lang="scss" scoped>

</style>
