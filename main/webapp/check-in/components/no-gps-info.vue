<!---
  Info displayed when there is no GPS
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.04.22
-->
<template lang="pug">
  div
    b-jumbotron(header="Kein GPS" lead="Leider ist GPS nicht aktiviert, deshalb funktioniert die App nur eingeschränkt.")
      p Für eine volle Funktionalität, aktiviere bitte auf deinem Gerät GPS und lass die Verwendung zu. Für Infos zum Datenschutz besuche bitte die &nbsp;
        a(href="https://ferropoly.ch/datenschutz-cookies/" target="_blank") Ferropoly Webseite
        | .


</template>

<script>
export default {
  name      : 'NoGpsInfo',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
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

</style>
