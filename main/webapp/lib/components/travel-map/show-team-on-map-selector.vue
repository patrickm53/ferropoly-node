<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.02.22
-->
<template lang="pug">
  div
    b-table(
      small
      :items="teams"
      :fields="fields"
      )
      template(#cell(data.name)="data") {{data.item.data.name}}
      template(#cell(color)="data")
        team-color-tag(:color="data.item.color")
      template(#cell(uuid)="data")
        b-form-checkbox(
          :checked="isChecked(data.item.uuid)"
          @change="onChanged(data.item.uuid)"
        )

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import TeamColorTag from './team-color-tag.vue';

export default {
  name: "ShowTeamOnMapSelector",
  components: {TeamColorTag},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
  },
  data      : function () {
    return {
      fields: [
        {key: 'data.name', label: 'Name'},
        {key: 'uuid', label: 'sichtbar'},
        {key: 'color', label: ''},      ]
    };
  },
  computed  : {
    ...mapFields({
      teams: 'teams.list',
      travelLog: 'travelLog.log'
    }),
  },
  created   : function () {
  },
  methods   : {
    isChecked(uuid) {
      return this.travelLog[uuid].isVisible();
    },
    onChanged(teamId) {
      console.log('checkbox changed', teamId);
      let newState = !this.isChecked(teamId);
      this.$emit('visibility-changed', {teamId: teamId, visible: newState});
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
