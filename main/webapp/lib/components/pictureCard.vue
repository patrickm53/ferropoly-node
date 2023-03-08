<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.03.23
-->
<template lang="pug">
div
  b-card(
    :img-src="pictureInfo.thumbnail"
    :title="uploadDate"
  )
    b-card-text
      | {{pictureInfo.lastModifiedDate | formatDate}}

</template>

<script>
import PictureInfo from "../pictureInfo";
import {formatTime, formatDate} from '../../common/lib/formatters';

export default {
  name: "PictureCard",
  components: {},
  filters   : {formatTime, formatDate},
  mixins    : [],
  model     : {},
  props     : {
    pictureInfo: {
      type: Object,
      default: ()=> {
        return new PictureInfo({});
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    uploadDate() {
      return formatTime(this.pictureInfo.timestamp.toISO());
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
