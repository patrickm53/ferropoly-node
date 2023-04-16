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
 * @param callback
 * @returns {Promise<*>}
 */
async function deletePicBucket(gameId, callback) {
  let res, err;
  try {
    if (!gameId) {
      return callback(new Error('No gameId supplied'));
    }
    logger.info('Deleting Pic Bucket for ' + gameId);
    res = await Model
      .deleteMany({gameId: gameId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Making the saving with callback again
 * @param pic
 * @param callback
 * @returns {Promise<void>}
 */
async function save(pic, callback) {
  let res, err;
  try {
    res = await pic.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}


/**
 * Finds an entry by its id
 * @param id
 * @param callback
 * @returns {Promise<void>}
 */
async function findPicById(id, callback) {
  let res, err;
  try {
    res = Model
      .find({_id: id})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Finds an entry by a filter
 * @param filter
 * @param callback
 * @returns {Promise<void>}
 */
async function findPicsByFilter(filter, callback) {
  let res, err;
  try {
    res = Model
      .find(filter)
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Assigns a property to an entry
 * @param id
 * @param propertyId
 * @param callback
 * @returns {Promise<void>}
 */
async function assignProperty(id, propertyId, callback) {
  let res, err;
  try {
    res = Model
      .findOneAndUpdate({_id: id}, {propertyId: propertyId})
      .exec();
    callback(null, res);
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

module.exports = {
  Model,
  deletePicBucket,
  findPicById,
  findPicsByFilter,
  save,
  assignProperty
}
