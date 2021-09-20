<!---
  Jumbotron showing some waiting text
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.07.21
-->
<template lang="pug">
#keep-waiting
  b-jumbotron(:header="waitingText", :lead="infoText")
</template>

<script>
import getWaitingText from '../../lib/waitingTexts';

export default {
  name : 'keep-waiting',
  props: {
    waitingText: {
      type   : String,
      default: function () {
        return getWaitingText();
      }
    },
    infoText   : {
      type   : String,
      default: function () {
        return 'Die Daten werden geladen. Falls es nach 10 Sekunden nicht weiter geht, bitte Seite neu laden.'
      }
    }
  }
}
</script>

<style scoped>

</style>
