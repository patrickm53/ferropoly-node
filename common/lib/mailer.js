/**
 * Mailer module
 *
 * Settings for the mailer are configured in its specific 'settings' file!
 *
 * Created by kc on 20.06.15.
 */


const _             = require('lodash');
const nodemailer    = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const logger        = require('./logger').getLogger('common:lib:mailer');
let transporter;
let options;


module.exports = {
  /**
   * Initializing the mailer
   * @param _options
   */
  init: function (_options) {
    options = _options;
    //activate for debug only
    //logger.info('options for mailer', options.mailer);
    transporter = nodemailer.createTransport(smtpTransport(options.mailer));
  },

  /**
   * Sends a message to a receiver
   * @param mailContents : data to send
   * @param callback : callback after mail was sent
   */
  send: function (mailContents, callback) {
    if (!mailContents || !mailContents.to || !mailContents.subject || !mailContents.text) {
      return callback(new Error('Incomplete parameters for sending mail'));
    }

    transporter.sendMail({
      from   : options.mailer.senderAddress,
      to     : mailContents.to,
      cc     : mailContents.cc,
      bcc    : mailContents.bcc,
      subject: mailContents.subject,
      text   : mailContents.text,
      html   : mailContents.html
    }, function (err, info) {
      if (err) {
        logger.error('cant send mail', err);
      }
      logger.info(info);
      callback(err, info);
    });
  }
};
