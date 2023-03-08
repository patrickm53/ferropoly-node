/**
 * Pic Bucket access for check-in and reception
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.03.23
 **/


import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get} from 'lodash';
import PictureInfo from "../pictureInfo";

const {getPicBucketField, updatePicBucketField} = createHelpers({
  getterType  : 'getPicBucketField',
  mutationType: 'updatePicBucketField'
});

const picBucket = {
  state    : () => ({
    pictures: []
  }),
  getters  : {
    getPicBucketField,
  },
  mutations: {
    updatePicBucketField
  },
  actions  : {
    /**
     * Fetchs all pictures of a team (or a game)
     * @param state
     * @param getters
     * @param options
     * @returns {Promise<unknown>}
     */
    fetchPictures({state, getters}, options) {
      return new Promise((resolve, reject) => {
        if (!options.gameId) {
          console.log('GameId not loaded yet, wait for pictures');
          return reject({active: false});
        }
        let teamId = get(options, 'teamId', '');
        if (teamId.length > 0) {
          teamId = '/' + teamId;
        }

        console.log('fetching pics', options);

        axios.get(`/picbucket/${options.gameId}${teamId}`)
             .then(resp => {
               const list = resp.data;
               console.log('Got the pictures', list);
               list.forEach(p => {
                 state.pictures.push(new PictureInfo(p));
               })
               return resolve(state.pictures);
             })
             .catch(err => {
               console.error(err);
               return reject({
                 message : get(err, 'response.data.message', null) || err.message,
                 infoText: 'Es gab einen Fehler beim Laden der Bilder:',
                 active  : true
               });
             })
      });
    },
    updatePictureList({state}, options) {
      state.pictures.push(new PictureInfo(options.info));
    }
  }
}

export default picBucket;
