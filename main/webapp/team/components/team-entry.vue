<!--
  - Copyright (c) 2021 Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  -->

<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 28.11.21
-->
<template lang="pug">
  div
    modal-info-yes-no(ref="delete-member")
    b-form-row
      b-col(sm="1")
        font-awesome-icon.important(:icon="['fas', 'trash-alt']" @click="removeMember(member)" )
      b-col
        p {{member.login}}
      b-col
        p {{forename}} {{surname}}


</template>

<script>
import {get} from 'lodash';
import ModalInfoYesNo from '../../common/components/modal-info-yes-no/modal-info-yes-no.vue';

export default {
  name      : 'team-entry',
  props     : {
    member: {
      type   : Object,
      default: function () {
        return {
          login       : '',
          personalData: {
            avatar  : '',
            forename: '',
            surname : ''
          }
        }
      }
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    forename() {
      return get(this.member, 'personalData.forename', '');
    },
    surname() {
     return get(this.member, 'personalData.surname', '');
    }
  },
  methods   : {
    removeMember(m) {
      // Show dialog when player shall be deleted
      this.$refs['delete-member'].showDialog({
        title   : 'Ferropoly',
        info    : `Soll ${m.login} wirklich aus dem Team entfernt werden?`,
        callback: function (confirmed) {
          if (confirmed) {
            this.$store.dispatch('removeMember', {member: m});
          }
        }
      });
    }
  },
  components: {ModalInfoYesNo},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
