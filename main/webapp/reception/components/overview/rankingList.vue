<!---
  Ranking list in a card
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.12.21
-->
<template lang="pug">
  div
    ferro-card(title="Rangliste")
      template(v-slot:controls)
        a(:href="downloadUrl")
          font-awesome-icon.no-url(:icon="['fas', 'download']" @click="download")
        span &nbsp;&nbsp;
        font-awesome-icon(:icon="['fas', 'sync-alt']" @click="reload")
      b-table(striped hover :items="rankingList" :fields="fields")
        template(#cell(asset)="data") {{data.item.asset | formatPrice}}

</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {formatPrice} from '../../../common/lib/formatters';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSyncAlt, faDownload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {mapFields} from 'vuex-map-fields';

library.add(faSyncAlt);
library.add(faDownload);
export default {
  name      : 'RankingList',
  components: {FerroCard, FontAwesomeIcon},
  filters   : {formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      fields: [
        {key: 'rank', label: 'Rang'},
        {key: 'name', label: 'Team'},
        {key: 'asset', label: 'Vermögen'}
      ]
    };
  },
  computed  : {
    ...mapFields({
      gameDataLoaded: 'gameDataLoaded',
      rankingList   : 'rankingList.list',
      gameId        : 'gameId'
    }),
    downloadUrl() {
      return `/download/rankinglist/${this.gameId}`;
    }
  },
  created   : function () {
    console.log('creating ranking list');
    if (this.gameDataLoaded) {
      this.$store.dispatch({type: 'fetchRankingList'});
    }
  },
  methods   : {
    download() {
      console.log('download')
    },
    reload() {
      console.log('refresh');
      this.$store.dispatch({type: 'fetchRankingList'});

    }
  }
}
</script>

<style lang="scss" scoped>
.no-url {
  color: black;
}
</style>
