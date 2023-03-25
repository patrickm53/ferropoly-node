<!---
  A simple list of picture cards, no business logic included
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.03.23
-->
<template lang="pug">
#image-list
  b-container(fluid)
    b-row(align-h="center")
      b-col(v-for="pic in pictures"  v-if="filterMatch(pic)")
        pictureCard(:picture-info="pic" extended=true @zoom="onZoom" )

</template>

<script>
import PictureCard from './pictureCard.vue';
import $ from "jquery";

export default {
  name      : "PictureList",
  components: {PictureCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    pictures  : {
      type   : Array,
      default: () => {
        return [];
      }
    },
    teamId    : {
      type   : String,
      default: () => {
        return null;
      }
    },
    propertyId: {
      type   : String,
      default: () => {
        return null;
      }
    },
    textFilter: {
      type   : String,
      default: () => {
        return null;
      }
    },

  },
  data      : function () {
    return {};
  },
  computed  : {},
  mounted   : function () {
    this.resizeHandler();
  },
  created   : function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#image-list');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      if (offsetElement) {
        element.height(hDoc - offsetElement.top);
      }
    },
    onZoom(pictureInfo) {
      this.$emit('zoom', pictureInfo)
    },
    /**
     * Checks the filter conditions
     * @param pictureInfo
     * @returns {boolean}
     */
    filterMatch(pictureInfo) {
      let match = 0;
      let filtersNbMustMatch = 1;
      if (this.teamId) {
        pictureInfo.teamId === this.teamId ? match++ : match;
      }
      if (!this.teamId) {
        match++;
      }
      if (this.propertyId) {
        pictureInfo.propertyId === this.propertyId ? match++ : match;
        filtersNbMustMatch++;
      }

      // This filter is exclusive (AND)
      if (this.textFilter) {
        let prop = this.$store.getters['propertyRegister/getPropertyById'](pictureInfo.propertyId);
        if (!prop) {
          return false;
        }
        let re = new RegExp(this.textFilter, 'i');
        return (match > 0) && ((prop.location.name.search(re) >= 0) || (pictureInfo.getLocationText() && pictureInfo.getLocationText().search(re) >= 0));
      }
      return match >= filtersNbMustMatch;
    }
  }
}
</script>

<style lang="scss" scoped>
#image-list {
  overflow: auto;
  height: 200px;
}

@media print {
  body, html, #image-list {
    height: 100% !important;
    width: 100% !important;
    display: inline-block;
  }
}
</style>
