<!---
  A viewer for PicBucket Pictures, including info and editor (if allowed)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.03.23
-->
<template lang="pug">
b-container(fluid)
  b-row
    b-col(sm="12" md="12" lg="4" xl="3")
      h5 {{$store.getters['teams/idToTeamName'](picture.teamId)}}
      compact-info(title="Upload") {{picture.timestamp | formatTime}}
      compact-info(v-if="extended" title="Aufnahmedatum") {{picture.lastModifiedDate | formatDateTime}}
        p(v-if="admin && picture.warningTooOldPictureActive()")
          font-awesome-icon.no-url.warning(icon="fa-triangle-exclamation")
          span &nbsp; Dieses Bild sollte überprüft werden: das Aufnahmedatum liegt deutlich vor dem Upload-Datum.
      compact-info(v-if="picture.position" title="Position bei Upload (GPS)")
        a(:href="mapUrl" target="_blank") {{picture.position | formatPosition}}
      compact-info(v-if="picture.getLocationText()" title="Adresse bei Upload") {{picture.getLocationText()}}
      compact-info(title="Bild in voller Auflösung öffnen")
        a(:href="picture.url" target="_blank") Auf neuer Seite öffnen
      div(v-if="properties.length > 0")
        compact-info(v-if="editAllowed" title="Bild einem Ort zuweisen")
          property-selector.mt-1(:properties="properties"
            :selectedPropertyId="picture.propertyId"
            @property-assigned="onPropertyAssigned")
        compact-info(v-if="!editAllowed" title="Dem Bild zugewiesenes Ort")
          p(v-if="!picture.propertyId") Kein Ort zugewiesen
          p(v-if="picture.propertyId")  {{propertyName}}


    b-col(sm="12" md="12" lg="8" xl="9")
      b-img(:src="picture.url" fluid center @click="onClose")
</template>

<script>
import {formatTime, formatPosition, formatDateTime} from '../../common/lib/formatters';
import CompactInfo from "./compactInfo.vue";
import {faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core';
import PropertySelector from "../../lib/components/PropertySelector.vue";

library.add(faTriangleExclamation);
export default {
  name      : "PictureViewer",
  components: {PropertySelector, CompactInfo, FontAwesomeIcon},
  filters   : {formatTime, formatPosition, formatDateTime},
  mixins    : [],
  model     : {},
  props     : {
    picture: {
      type   : Object,
      default: () => {
        return null;
      }
    },
    /**
     * Extended true: shows more details, otherwise very basic
     */
    extended: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * Admin true: shows infos for admins only
     */
    admin: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    /**
     * editAllowed true: basic edit functionality is available
     */
    editAllowed: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    disabled   : {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    properties : {
      type   : Array,
      default: () => {
        return [];
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    mapUrl() {
      return `https://maps.google.com?q=${this.picture.position.lat},${this.picture.position.lng}`;
    },
    propertyName() {
      let prop = this.$store.getters['propertyRegister/getPropertyById'](this.picture.propertyId);
      if (!prop) {
        return '';
      }
      return prop.location.name;
    }
  },
  created   : function () {
    console.log('showing picture', this.picture);
  },
  methods   : {
    onClose() {
      console.log('onClose');
      this.$emit('close');
    },
    /**
     * Property Selector assigned property, forward to next level
     * @param obj
     */
    onPropertyAssigned(obj) {
      let self = this;
      this.$emit('property-assigned', {picture: self.picture, propertyId: obj.propertyId});
    }
  }
}
</script>

<style lang="scss" scoped>
.warning {
  color: orange;
}
</style>
