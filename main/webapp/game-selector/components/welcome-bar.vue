<!---
 The welcome bar
-->
<template lang="pug">
div
  #info-header(:style="{backgroundImage: backgroundImage}")
    #info-welcome
      h1.info-header {{greetingText}}
</template>

<script>
import {DateTime} from "luxon";

export default {
  name : "welcome-bar",
  props: {
    userName: {
      type: String,
      default: () => {
        return '';
      }
    }
  },
  data : function () {
    return {
      welcomeText    : '',
      backgroundImage: ''
    };
  },
  model: {},
  /**
   * Called when component is being created
   */
  created   : function () {
    // Define Background
    let index            = DateTime.now().minute % 10;
    this.backgroundImage = `url("/images/ferropoly_header_0${index}.jpg")`;
  },
  methods   : {},
  computed: {
    greetingText() {
      // Be kind and say hello
      let currentHour      = DateTime.now().hour;
      let greeting         = 'Hallo'
      if (currentHour < 4) {
        greeting = 'Hallo';
      } else if (currentHour < 10) {
        greeting = 'Guten Morgen';
      } else if (currentHour < 17) {
        greeting = 'Hallo';
      } else {
        greeting = 'Guten Abend';
      }
      greeting += ' ' + this.userName;
      return greeting;
    }
  },
  components: {}
}
</script>

<style scoped>
#info-header {
  height: 180px;
  min-height: 180px;
  position: relative;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  width: 100%;
}

#info-welcome {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, .4);
}

h1.info-header {
  margin-top: 10px;
  margin-left: 20px;
  margin-bottom: 20px;
  color: white;
}
</style>
