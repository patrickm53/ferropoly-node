<!---
  This is the root element of the about app
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.04.22
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements" show-user-box=true @print="onPrint")
    b-container(fluid)
      b-row.mt-1(v-if="ezActive")
        b-col
          img.full-width(src="/images/ferropoly_ez.svg")
          b-button.no-print(@click="hideEz") zurück zum Hauptfenster
      b-row.mt-1(v-if="!ezActive")
        b-col(xs="12" md="4")
          ferro-card(title="Hilfe & Infos")
            div Hilfe zur Software, Spielregeln und weitere Infos zum Spiel sind auf der Ferropoly Webseite zu finden:&nbsp;
              a(href="https://www.ferropoly.ch" target="_blank") www.ferropoly.ch

          ferro-card(title="Datenschutz")
            div Es werden nur für das Spiel notwendige Daten erfasst. Mit dem Login über Google und Facebook sind die öffentlich zugänglichen Daten:
            ul
              li Name
              li Email-Adresse
              li Avatar Bild
            p Während dem Spiel werden zudem die Positionsdaten der Spieler aufgenommen. Sämtliche während dem Spiel erfassten Daten werden 30 Tage nach dem Spiel automatisch gelöscht.

        b-col(xs="12" md="4")
          ferro-card(title="Nutzungsbedingungen")
            div
              | Die Nutzung dieser Software unterliegt den AGB, welche bei der Anmeldung zu diesem Dienst akzeptiert wurden und auf der Ferropoly Webseite publiziert sind.
            div.info Die wichtigsten Punkte:
            ul
              li Die Durchführung des Spiels erfolgt für Teilnehmer wie Organisator auf eigene Gefahr. Der Betreiber der Webseite kann u.a. für Datenverlust und Serverausfälle nicht haftbar gemacht werden.
              li Eine gewerbliche Benutzung der Software (Organisation von Spielen gegen Vergütung über den effektiven Spesen) ist ohne ausdrückliche Genehmigung des Autors explizit untersagt.

        b-col(xs="12" md="4")
          ferro-card(title="Sponsoring")
            div Diese Software darf gratis für die Durchführung von Spielen verwendet werden. Hinter dieser Software steckt viel Arbeit und für den Betrieb der Server wende ich einen Teil meines Sackgeldes wie auch meiner Freizeit auf.
            div Deshalb würde ich mich darüber sehr freuen, wenn Dir ein ausgetragenes Spiel einen Beitrag wert wäre!
            b-button(@click="showEz" variant="primary" ) Beitrag bezahlen

          ferro-card(title="über diese Software")
            div.info {{title}} V{{version}}
            div
              | © 2015-{{currentYear}} Christian Kuster, CH-8342 Wernetshausen,&nbsp;
              a(:href="emailUrl") {{email}}
            div Source-Code und Bugtracking auf Bitbucket:
            div
              a(:href="gitRepo" target="_blank") {{gitRepo}}

</template>

<script>
import MenuBar from '../menu-bar/menu-bar.vue'
import FerroCard from '../ferro-card/ferro-card.vue';
import {DateTime} from 'luxon';
import packageInfo from '../../../../../package.json';

export default {
  name      : 'AboutRoot',
  components: {MenuBar, FerroCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      menuElements: [
        {title: 'Drucken', href: '#', event: 'print', hide: true}
      ],
      ezActive    : false
    };
  },
  computed  : {
    currentYear() {
      return DateTime.now().toFormat('yyyy')
    },
    title() {
      return packageInfo.title;
    },
    version() {
      return packageInfo.version;
    },
    gitRepo() {
      return packageInfo.repository.url;
    },
    email() {
      return packageInfo.author.email;
    },
    emailUrl() {
      return 'mailto:' + packageInfo.author.email;
    }
  },
  created   : function () {
  },
  methods   : {
    showEz() {
      this.ezActive             = true;
      this.menuElements[0].hide = false;
    },
    hideEz() {
      this.ezActive             = false;
      this.menuElements[0].hide = true;
    },
    onPrint() {
      window.print();
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  font-weight: bold;
}

.full-width {
  width: 100%;
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
