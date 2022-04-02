<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.04.22
-->
<template lang="pug">
  div
    div.time-stamp {{event.timestamp | formatTime}}
    div.title {{event.title}}


</template>

<script>
import {DateTime} from 'luxon';
import {formatTime} from '../../../common/lib/formatters';

export default {
  name      : 'GameEvent',
  components: {},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {
    event: {
      type   : Object,
      default: () => {
        return {
          timestamp: DateTime(),
          title    : 'none'
        }
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

.time-stamp {
  font-weight: 900;
  width: 100%;
  background-color: lightgrey;
  text-align: center;
}
.title {
  margin-bottom: 10px;
}
</style>
