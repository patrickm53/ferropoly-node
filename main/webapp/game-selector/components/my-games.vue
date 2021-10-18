<!---
  All my Games

  9.4.2021 KC
-->
<template lang="pug">
div
  modal-delete-game(ref="delete-confirm" v-on:delete-gameplay-confirmed="deleteGameplayConfirmed")
  modal-error(title="Fehler" ref='delete-error')
  h1 Meine Spiele
  b-row
    b-col(v-if="gameplays.length === 0")
      p  Du hast noch keine Spiele angelegt.&nbsp;
        a(href='/newgame') Neues Spiel anlegen.
    b-col(v-for="gp in gameplays" :key="gp.internal.gameId" xs="12" sm="12" md="6" lg="4" xl="4")
      game-card(:gameplay="gp" v-on:delete-gameplay="deleteGameplay")
</template>

<script>
import {readMyGames, deleteGameplay} from "../../common/adapter/gameplay";
import GameCard from './game-card.vue';
import ModalDeleteGame from "./modal-delete-game.vue";
import ModalError from '../../common/components/modal-error/modal-error.vue';

export default {
  name      : "my-games",
  props     : [],
  data      : function () {
    return {
      gameplays       : [],
      gameplayToDelete: ''
    };
  },
  model     : {},
  created   : function () {
    this.updateGameplays();
  },
  methods   : {
    /**
     * Event Handler from a card: deleting a gameplay was requested. Show Modal dialog
     * @param gpId
     */
    deleteGameplay: function (gpId) {
      console.log('DELETING', gpId);
      this.gameplayToDelete = gpId;
      this.$refs['delete-confirm'].showModal()
    },
    /**
     * Modal dialog confirms deletion
     */
    deleteGameplayConfirmed: function () {
      console.log('NOW deleting gameplay', this.gameplayToDelete);
      deleteGameplay(this.gameplayToDelete, err => {
        if (err) {
          console.error(err);
          this.$refs['delete-error'].showError('Fehler', 'Das Spiel konnte nicht gelöscht werden, folgende Meldung wurde gesendet:', err);
        }
        this.updateGameplays();
      })
    },
    /**
     * Update the collection of gameplays
     */
    updateGameplays: function () {
      let self = this;
      readMyGames((err, gameplays) => {
        self.gameplays = gameplays;
        this.$emit('gameplays-changed', gameplays);
      });
    }
  },
  components: {GameCard, ModalDeleteGame, ModalError}
}
</script>

<style scoped>

</style>
