<!---
  A preview card for pictures
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.03.23
-->
<template lang="pug">
div.card.mt-0(@click="onClick")
  b-img-lazy(:src="pictureInfo.thumbnail" blank-width="200" blank-height="150" )
  h3 {{uploadDate}}
    font-awesome-icon.no-url.warning(v-if="admin && pictureInfo.warningTooOldPictureActive()"
      icon="fa-triangle-exclamation"
      v-b-tooltip.hover
      :title="tooltipWarning")
  div(v-if="extended")
    p {{getTeamNameById(pictureInfo.teamId)}}
    p(v-b-tooltip.hover :title="tooltipGps") {{pictureInfo.getLocationText()}}
</template>

<script>
import PictureInfo from "../pictureInfo";
import {formatTime} from '../../common/lib/formatters';
import {faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core';
library.add(faTriangleExclamation);
export default {
  name: "PictureCard",
  components: {FontAwesomeIcon},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {
    pictureInfo: {
      type: Object,
      default: ()=> {
        return new PictureInfo({});
      }
    },
    /**
     * Extended true: shows more details, otherwise very basic
     */
    extended: {
      type: Boolean,
      default: ()=> {
        return false;
      }
    },
    /**
     * Admin true: shows infos for admins only
     */
    admin: {
      type: Boolean,
      default: ()=> {
        return false;
      }
    },
    /**
     * Function for returning the team name for a given ID
     */
    getTeamNameById: {
      type   : Function,
      default: (p) => {
        console.log('dummy only!', p);
        return null;
      }
    }
  },
  data      : function () {
    return {
      tooltipGps: 'Die Adresse wurde aufgrund des letzten GPS Standortes bestimmt',
      tooltipWarning: 'Dieses Bild benötigt eine Überprüfung'
    };
  },
  computed  : {
    uploadDate() {
      return formatTime(this.pictureInfo.timestamp.toISO());
    }
  },
  created   : function () {
  },
  methods   : {
    onClick() {
      this.$emit('zoom', this.pictureInfo)
    }
  }
}
</script>

<style lang="scss" scoped>

.card {
  border: 0 solid silver;
  width: 360px;
}

.warning {
  color: orange;
}
</style>
