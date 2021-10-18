<!---
  Modal Dialog when deleting a game

  11.4.2021 KC
-->
<template lang="pug">
div
  b-modal#agb(ref="modal-delete-dialog" title="Spiel löschen?" hide-header-close=true cancel-title="Abbrechen"
    ok-title="Lösche mein Spiel!" @ok="deleteGame")
    .modal-body
      p Diese Aktion löscht das Spiel mit sämtlichen Daten. Diese Aktion KANN NICHT RÜCKGÄNGIG GEMACHT werden!
      p
      p Möchtest Du fortfahren?

</template>

<script>
export default {
  name      : "modal-delete-game",
  props     : [],
  data      : function () {
    return {};
  },
  model     : {},
  methods   : {
    /**
     * Confirming deletion of the game
     */
    deleteGame() {
      this.$emit('delete-gameplay-confirmed');
    },
    /**
     * Show this modal dialog
     */
    showModal() {
      this.$refs['modal-delete-dialog'].show();
    }
  },
  components: {}
}
</script>

<style scoped>

</style>
