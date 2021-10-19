<!---
  Test on Root Level, every test has to be added here

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.04.21
-->
<template lang="pug">
#test-root
  menu-bar(:elements="menuElements"
    :show-user-box="showUserBox"
    @panel-change="onPanelChange"
    @test-event="onTestEvent"
    help-url="https://www.ferropoly.ch/")
  b-container(fluid=true)
    div(v-if="panel==='top'")
      h1 Ferropoly Component Tests
</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import {getItem, setItem} from '../../common/lib/sessionStorage';

// EASY START
const defaultPanel = getItem('test-panel', 'top');

export default {
  name      : 'test-root',
  props     : {},
  data      : function () {
    return {
      menuElements: [
        // take care of the Id's as we're accessing them directly
        /* 0 */  {title: 'Hauptfenster', href: '#', event: 'panel-change', eventParam: 'top'},
        /* 1 */  {
          title   : 'Spiel-Components', href: '#', type: 'dropdown',
          elements: [
            {title: 'Spieler Info', href: '#', event: 'panel-change', eventParam: 'playerInfo'}
          ]
        },
      ],
      panel       : defaultPanel,
      showUserBox : true
    };
  },
  model     : {},
  created   : function () {
  },
  computed  : {},
  methods   : {
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.panel = panel;
      setItem('test-panel', panel);
    },
    onTestEvent(data) {
      console.log('onTestEvent', data);
    }
  },
  components: {
    MenuBar

  },
  filters   : {}
}
</script>

<style scoped>

</style>
