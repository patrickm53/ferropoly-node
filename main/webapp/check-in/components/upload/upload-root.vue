<!---
  Picture upload handling
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

</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCamera} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {mapFields} from "vuex-map-fields";
import {announcePicture, confirmPicture, uploadPicture} from "../../lib/picUploader";
import {get} from "lodash";
import PictureCard from "../../../lib/components/PictureCard.vue";

library.add(faCamera);
export default {
  name      : "UploadRoot",
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
          self.error.active   = true;
          self.error.infoText = 'Der Ferropoly Server meldet ein Problem bei der Anmeldung der Bilder:';
          self.error.message  = err.message || err;
          return;
        }
        console.info('can upload now');
        uploadPicture(info.uploadUrl, image, err => {
          if (err) {
            self.error.active   = true;
            self.error.infoText = 'Der Google Server meldet ein Problem beim Upload des Hauptbildes:';
            self.error.message  = err.message || err;
            return console.error(err);
          }
          console.log('uploaded image');

          uploadPicture(info.thumbnailUrl, thumb, err => {
            if (err) {
              self.error.active   = true;
              self.error.infoText = 'Der Google Server meldet ein Problem beim Upload des Thumbnails:';
              self.error.message  = err.message || err;
              return console.error(err);
            }
            console.log('uploaded thumbnail');

            confirmPicture(info.id, {}, (err, data) => {
              if (err) {
                self.error.active   = true;
                self.error.infoText = 'Der Ferropoly Server meldet ein Problem beim Abschluss des Uploads:';
                self.error.message  = err.message || err;
                return console.error(err);
              }
              console.log('Uploaded, finished', data);
              this.$bvToast.toast('Das Bild wurde erfolgreich hochgeladen', {
                title        : 'Ferropoly Bildupload',
                autoHideDelay: 5000,
                appendToast  : true,
                variant      : 'success',
                solid        : true
              })
              this.file = null;

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
      const thumbnail = options.thumbnail;
      const maxWidth  = thumbnail ? 360 : 1400;
      const maxHeight = thumbnail ? 240 : 1400;

      console.log('processFile', dataURL, _options);

      let image = new Image();
      image.src = dataURL;

      image.onload = function () {
        console.log('image.onload');
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
          // landscape
          newHeight = height * (maxWidth / width);
          newWidth  = maxWidth;
        } else {
          // portrait
          newWidth  = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        if (thumbnail) {
          // see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage and
          // https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
          const sx = 0;
          const sw = width;
          const sh = width / 4 * 3;
          const sy = (height - sh) / 2;
          console.log(`Thumb params: sx=${sx} sw=${sw} sy=${sy} sh=${sh} having image with w=${width} and h=${height}`);
          canvas.width  = 360;
          canvas.height = 270;
          context.drawImage(this, sx, sy, sw, sh, 0, 0, 360, 270);
        } else {
          canvas.width  = newWidth;
          canvas.height = newHeight;
          context.drawImage(this, 0, 0, newWidth, newHeight);
        }
        canvas.toBlob(callback, 'image/jpeg', 0.8)
      };

   /*   image.onerror = function (args) {
        alert('There was an error processing your file!');
        console.error('Processing error', args);
      };*/
    },
    /**
     * User wants to upload a file
     */
    onUpload() {
      const self = this;
      console.log('having a file', this.file);
      let reader       = new FileReader();
      reader.onloadend = function () {
        console.log('Going to process pic...');
        self.processFile(reader.result, {}, large => {
          console.log('Going to process thumbnail...');
          self.processFile(reader.result, {thumbnail: true}, thumb => {
            console.log('Going to send pic and thumbnail...');
            self.sendFile(large, thumb);
          })
        });
      }

      reader.onerror = function () {
        alert('Es gab einen Fehler beim Lesen der Datei!');
      }
      reader.readAsDataURL(self.file);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
