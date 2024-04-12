/**
 * The Model for the pic Bucket, a minimized model. There are no unit tests as this
 * model is only used in one specific single place.
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
  location        : Object,  // Object retrieved by google geocode API
  uploaded        : {type: Boolean, default: false},
  timestamp       : {type: Date, default: Date.now},
  lastModifiedDate: Date
});


const Model = mongoose.model('PicBucket', picBucketSchema);

/**
 * Deletes the pic bucket data for a gameplay. Only the data in the DB, the pictures
 * in the google cloud are removed automatically by a cloud setting
 * @param gameId
 * @returns {Promise<*>}
 */
async function deletePicBucket(gameId) {
  if (!gameId) {
    throw new Error('No gameId supplied');
  }
  logger.info(`${gameId}: Deleting Pic Bucket`);
  return await Model
    .deleteMany({gameId: gameId})
    .exec();
}


/**
 * Making the saving with callback again
 * @param pic
 * @returns {Promise<void>}
 */
async function save(pic) {
  await pic.save();
}


/**
 * Finds an entry by its id
 * @param id
 * @returns {Promise<void>}
 */
async function findPicById(id,) {
  return await Model
    .findOne({_id: id})
    .exec();
}

/**
 * Finds an entry by a filter
 * @param filter
 * @returns {Promise<void>}
 */
async function findPicsByFilter(filter) {
  return await Model
    .find(filter)
    .exec();
}

/**
 * Assigns a property to an entry
 * @param id
 * @param propertyId
 * @returns {Promise<void>}
 */
async function assignProperty(id, propertyId) {
  return await Model
    .findOneAndUpdate({_id: id}, {propertyId: propertyId})
    .exec();
}

module.exports = {
  Model,
  deletePicBucket,
  findPicById,
  findPicsByFilter,
  save,
  assignProperty
}
