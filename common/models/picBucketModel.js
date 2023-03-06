/**
 * The Model for the pic Bucket, a minimized model
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.23
 **/
const mongoose        = require('mongoose');
const logger          = require('../lib/logger').getLogger('picBucketModel');
/**
 * The mongoose schema for a picture
 */
const picBucketSchema = mongoose.Schema({
  _id             : String,
  gameId          : String,
  teamId          : String, // Set only if relevant, otherwise undefined
  filename        : String,
  message         : String, // This is a message for the picture
  url             : String, // The public URL
  thumbnail       : String, // URL to the thumbnail
  user            : String,
  propertyId      : String, // Property ID of an associated property (if any)
  position        : {
    lat     : Number,
    lng     : Number,
    accuracy: Number
  },
  uploaded        : {type: Boolean, default: false},
  timestamp       : {type: Date, default: Date.now},
  lastModifiedDate: Date
});


const Model = mongoose.model('PicBucket', picBucketSchema);

deletePicBucket = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Deleting Pic Bucket for ' + gameId);
  Model.deleteMany({gameId: gameId}, callback);
}
module.exports  = {
  Model,
  deletePicBucket
}
