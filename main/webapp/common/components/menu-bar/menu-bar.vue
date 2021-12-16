<!---
  The menu bar for Ferropoly

  Configuration Sample: See test-root.vue in the Editor Project

  11.4.21 KC
-->
<template lang="pug">
#menu
  b-navbar(toggleable='lg' type='dark' variant='dark')
    b-navbar-brand(href='/')
      img(:src='favicon' height="24" width="24")
      | &nbsp; Ferropoly
    b-navbar-toggle(target='nav-collapse')
    b-collapse#nav-collapse(is-nav='')
      b-navbar-nav
        div(v-for="el in elements" :key="el.title" v-if="!el.hide")
          // Ordinary Navbar Item
          b-nav-item(v-if="isNavbarItem(el)" :href="el.href" v-on:click="onClick(el.event, el.eventParam)") {{el.title}}
          // Dropdown Item
          b-nav-item-dropdown(v-if="isNavbarDropdown(el)"
            :href="el.href"
            :text="el.title"
            v-on:click="onClick(el.event, el.eventParam)")
            b-dropdown-item(v-for="eld in el.elements"
              :href="eld.href"
              v-on:click="onClick(eld.event, eld.eventParam)"
              :key="eld.title"
              v-if="!eld.hide") {{eld.title}}
      // Right aligned nav items
      b-navbar-nav.ml-auto
        b-navbar-nav(v-for="el in elementsRight" :key="el.title" v-if="!el.hide")
          b-nav-item(:href="el.href" v-on:click="onClick(el.event)") {{el.title}}

        b-nav-item(v-if="helpUrl.length > 0" :href="helpUrl" target="_blank")
          b-icon-question-circle-fill
        b-nav-item-dropdown(right='' v-if="showUserBox && !showOnlineStatus")
          template(#button-content='')
            b-icon-person-circle
          b-dropdown-item(href='/account') Mein Account
          b-dropdown-item(href='/logout') Abmelden
        b-nav-item(right='' v-if="showOnlineStatus")
          span(v-if="online").online
            font-awesome-icon(:icon="['fas', 'cloud']")
            span &nbsp;online
          span(v-if="!online").offline
            font-awesome-icon(:icon="['fas', 'cloud']")
            span &nbsp;offline
</template>

<script>
import {BIconQuestionCircleFill, BIconPersonCircle} from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCloud } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCloud);

export default {
  name      : "menu-bar",
  model     : {},
  components: {BIconQuestionCircleFill, BIconPersonCircle,FontAwesomeIcon},
  props     : {
    favicon    : {
      // Fav-Icon displayed in the menu bar
      type   : String,
      default: function () {
        return '/favicon/apple-touch-icon-180x180.png';
      }
    },
    elements   : {
      // Elements of the menu bar. Contains different types of elements
      type   : Array,
      default: function () {
        return [];
      }
    },
    elementsRight   : {
      // Elements of the menu bar on the right side
      type   : Array,
      default: function () {
        return [];
      }
    },
    helpUrl: {
      // URL to help, shows (?)
      type: String,
      default: function() {
        return '';
      }
    },
    showUserBox: {
      // show logout box / about user
      type   : Boolean,
      default: false
    },
    showOnlineStatus: {
      // show cloud symbol
      type: Boolean,
      default: false
    },
    online: {
      // Status of the connection if online
      type: Boolean,
      default: false
    }
  },
  data      : function () {
    return {};
  },
  methods   : {
    /**
     * Click handler for a menu
     * @param event
     * @param data
     */
    onClick: function (event, data) {
      if (event) {
        this.$emit(event, data);
      }
    },
    /**
     * Returns true if the element is an "ordinary" navbar item
     * @param element
     * @returns {boolean}
     */
    isNavbarItem(element) {
      if (!element.type) {
        return true;
      }
      return element.type === 'item'
    },
    /**
     * Returns true if the element is a navbar dropdown
     * @param element
     * @returns {boolean}
     */
    isNavbarDropdown(element) {
      if (!element.type) {
        return false;
      }
      return element.type === 'dropdown'
    }
  },

}
</script>

<style scoped>
.online {
  color: green;
}
.offline {
  color: red;
}
</style>
