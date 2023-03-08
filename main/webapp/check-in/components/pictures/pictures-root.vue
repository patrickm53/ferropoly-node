<!---
  Picture handling
  Still happy that Jaccob Lee provided a cook book for this:
  https://medium.com/hootsuite-engineering/mobile-photo-uploads-with-html5-f7ea174ef128
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.03.23
-->
<template lang="pug">
b-container(fluid)
  h1 Bilder hochladen
  p Während dem Spiel kannst Du Bilder an die Zentrale senden: um zu belegen, dass ihr an einem Ort seid oder einfach so zum Spass.
  p Die Bilder sind nach dem Spiel für alle teilnehmenden Teams sichtbar und werden 30 Tage nach dem Spiel automatisch gelöscht.
  p &nbsp;
  b-form-file.mx-auto(v-model="file"
    size="lg"
    variant="primary"
    style="width: 100%;"
    accept="image/jpeg, image/png"
    :state="Boolean(file)"
    placeholder="Foto aufnehmen")
  b-button.mx-auto.mt-3(
    :disabled="!Boolean(file)"
    variant="primary"
    style="width: 100%;"
    @click="onUpload")
    div &nbsp;
    font-awesome-icon(:icon="['fas', 'camera']")
    span &nbsp; Bild senden
    div &nbsp;
  div(v-if="pictures.length > 0")
    h2 Unsere Bilder
    pictureCard(v-for="pic in pictures" :picture-info="pic" )


</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCamera} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {mapFields} from "vuex-map-fields";
import {announcePicture, confirmPicture, uploadPicture} from "../../lib/picUploader";
import {get} from "lodash";
import PictureCard from "../../../lib/components/pictureCard.vue";

library.add(faCamera);
export default {
  name      : "PicturesRoot",
  components: {FontAwesomeIcon, PictureCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      file    : undefined,
      thumbUrl: undefined
    };
  },
  computed  : {
    ...mapFields({
      teamId   : 'checkin.team.uuid',
      gameId   : 'gameId',
      authToken: 'api.authToken',
      error    : 'api.error',
      pictures : 'picBucketStore.pictures'
    }),
  },
  created   : function () {
  },
  methods   : {
    /**
     * Sends a file, the whole process of announcing, uploading and confirming
     * @param image Large image to save
     * @param thumb Thumbnail
     */
    sendFile(image, thumb) {
      const self = this;
      announcePicture(this.gameId, this.teamId, {
        authToken       : self.authToken,
        lastModifiedDate: get(self, 'file.lastModifiedDate', undefined)
      }, (err, info) => {
        if (err) {
          console.error(err);
          self.error.active    = true;
          self.error.infoText = 'Der Ferropoly Server meldet ein Problem bei der Anmeldung der Bilder:';
          self.error.message  = err.message || err;
          return;
        }
        console.info('can upload now');
        uploadPicture(info.uploadUrl, image, err => {
          if (err) {
            self.error.active    = true;
            self.error.infoText = 'Der Google Server meldet ein Problem beim Upload des Hauptbildes:';
            self.error.message  = err.message || err;
            return console.error(err);
          }
          console.log('uploaded image');

          uploadPicture(info.thumbnailUrl, thumb, err => {
            if (err) {
              self.error.active    = true;
              self.error.infoText = 'Der Google Server meldet ein Problem beim Upload des Thumbnails:';
              self.error.message  = err.message || err;
              return console.error(err);
            }
            console.log('uploaded thumbnail');

            confirmPicture(info.id, {}, (err, data) => {
              if (err) {
                self.error.active    = true;
                self.error.infoText = 'Der Ferropoly Server meldet ein Problem beim Abschluss des Uploads:';
                self.error.message  = err.message || err;
                return console.error(err);
              }
              console.log('Uploaded, finished', data);
              self.thumbUrl = get(data, 'thumbnail');
            })
          })
        })
      })
    },
    /**
     * Processes a file, we do not upload the XXL file from the camera
     * @param dataURL
     * @param _options
     * @param callback
     */
    processFile(dataURL, _options, callback) {
      const self      = this;
      let options     = _options || {};
      const maxWidth  = options.maxWidth || 1200;
      const maxHeight = options.maxHeight || 1200;

      let image = new Image();
      image.src = dataURL;

      image.onload = function () {
        let width        = image.width;
        let height       = image.height;
        let shouldResize = (width > maxWidth) || (height > maxHeight);

        if (!shouldResize) {
          self.sendFile(dataURL);
          return;
        }

        let newWidth;
        let newHeight;

        if (width > height) {
          newHeight = height * (maxWidth / width);
          newWidth  = maxWidth;
        } else {
          newWidth  = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        let canvas = document.createElement('canvas');

        canvas.width  = newWidth;
        canvas.height = newHeight;

        let context = canvas.getContext('2d');

        context.drawImage(this, 0, 0, newWidth, newHeight);

        canvas.toBlob(callback, 'image/jpeg', 0.8)
      };

      image.onerror = function () {
        alert('There was an error processing your file!');
      };
    },
    /**
     * User wants to upload a file
     */
    onUpload() {
      const self = this;
      console.log('having a file', this.file);
      let reader       = new FileReader();
      reader.onloadend = function () {
        self.processFile(reader.result, {}, large => {
          self.processFile(reader.result, {maxWidth: 360, maxHeight: 360}, thumb => {
            self.sendFile(large, thumb);
          })
        });
      }

      reader.onerror = function () {
        alert('There was an error reading the file!');
      }
      reader.readAsDataURL(self.file);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
