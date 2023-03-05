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
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCamera} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {mapFields} from "vuex-map-fields";
import {announcePicture, uploadPicture} from "../../lib/picUploader";

library.add(faCamera);
export default {
  name      : "PicturesRoot",
  components: {FontAwesomeIcon},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      file: undefined
    };
  },
  computed  : {
    ...mapFields({
      teamId   : 'checkin.team.uuid',
      gameId   : 'gameId',
      authToken: 'api.authToken'

    }),
  },
  created   : function () {
  },
  methods   : {
    sendFile(fileData) {
      const self   = this;
      let formData = new FormData();

      formData.append('imageData', fileData);
      console.log('thats it', formData);
      announcePicture(this.gameId, this.teamId, {authToken: self.authToken}, (err, info) => {
        if (err) {
          console.error(err);
          return;
        }
        console.info('can upload now');
        uploadPicture(info.uploadUrl, fileData, err => {
          if (err) {
            return console.error(err);
          }
          console.log('uploaded');
        })
      })
    },
    processFile(dataURL, fileType) {
      const self      = this;
      const maxWidth  = 800;
      const maxHeight = 800;

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

        dataURL = canvas.toDataURL(fileType);

        self.sendFile(dataURL);
      };

      image.onerror = function () {
        alert('There was an error processing your file!');
      };
    },
    onUpload(e) {
      const self = this;
      console.log('having a file', this.file);
      let reader       = new FileReader();
      reader.onloadend = function () {
        self.processFile(reader.result, self.file.type);
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
