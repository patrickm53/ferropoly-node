/**
 * A Bucket for pictures for a game, e.g. the validation, that a team was there.
 *
 * Integrates an own model
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.02.23
 **/

const mongoose   = require('mongoose');
const logger     = require('../../common/lib/logger').getLogger('picBucket');
const {DateTime} = require('luxon');
const _          = require('lodash');
const {Storage}  = require('@google-cloud/storage');

/**
 * The mongoose schema for a picture
 */
const picBucketSchema = mongoose.Schema({
  _id       : String,
  gameId    : String,
  teamId    : String, // Set only if relevant, otherwise undefined
  filename  : String,
  message   : String, // This is a message for the picture
  url       : String, // The public URL
  propertyId: String, // Property ID of an associated property (if any)
  uploaded  : {type: Boolean, default: false},
  timestamp : {type: Date, default: Date.now}
});

const picBucket = mongoose.model('PicBucket', picBucketSchema);
const storage   = new Storage();

module.exports = function (settings) {

  const bucketName     = _.get(settings, 'picBucket.bucket', null);
  /**
   * Announces an upload of a picture
   * @param gameId
   * @param teamId
   * @param options
   * @param callback
   */
  const announceUpload = function (gameId, teamId, options, callback) {
    let fileBase        = _.get(options, 'filename', `${DateTime.now().toMillis()}.jpg`);
    let filename        = `${gameId}/${fileBase}`
    const uploadOptions = {
      version    : 'v4',
      action     : 'write',
      expires    : Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'image/jpeg',
    };

    // Get a v4 signed URL for uploading file
    const bucket = storage.bucket(bucketName);
    const file   = bucket.file(filename);
    file.getSignedUrl(uploadOptions)
        .then(data => {
          logger.info(`${gameId} Data upload announced`);

          let pic        = new picBucket();
          pic.gameId     = gameId;
          pic.teamId     = teamId;
          pic.filename   = filename;
          pic.message    = _.get(options, 'message', undefined);
          pic.url        = `${settings.picBucket.baseUrl}/${bucketName}/${filename}`;
          pic.propertyId = _.get(options, 'propertyId', undefined);
          pic._id        = `${gameId}-${teamId}-${fileBase}`;
          pic.save(err => {
            if (err) {
              return callback(err);
            }
            return callback(null, {uploadUrl: data[0], id: pic._id});
          });
        })
        .catch(err => {
          logger.error(err);
          return callback(err);
        });
  };

  /**
   * Confirms the upload of an announced file
   * @param id of the entry created while announcing
   * @param callback
   */
  const confirmUpload = function (id, callback) {
    picBucket.find({_id: id}, (err, docs) => {
      if (err) {
        return callback(err);
      }
      let entry = docs[0];
      entry.uploaded = true;
      entry.save(callback);
    })
  }

  /**
   * Returns a list of the elements fitting the filter
   * @param gameId
   * @param options see in the function
   * @param callback
   */
  const list = function(gameId, options, callback) {
    let filter = {gameId: gameId};

    // Not providing a teamId in the options returns ALL teams
    let teamId = _.get(options, 'teamId', null);
    if (teamId && teamId.length > 0) {
      filter.teamId = teamId;
    }

    // Not setting the uploaded filter does return ALL elements
    let uploaded = _.get(options, 'uploaded', undefined);
    if (!_.isUndefined(uploaded)) {
      filter.uploaded = uploaded;
    }

    picBucket.find(filter, (err, docs)=>{
      if (err) {
        return callback(err);
      }
      return callback(null, docs);
    });
  }


  return {announceUpload, confirmUpload, list}
}
