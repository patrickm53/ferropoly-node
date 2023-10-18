/**
 * This module sends a mail to all teams when a new summary is available
 *
 * Created by kc on 16.4.2020.
 */
const logger    = require('../../common/lib/logger').getLogger('summary-mailer');
const mailer    = require('../../common/lib/mailer');
const gpModel   = require('../../common/models/gameplayModel');
const gameCache = require('./gameCache');
const _         = require('lodash');
const settings  = require('../settings');

let summaryMailer;

/**
 * The Summary Mailer Class
 * @param scheduler
 * @constructor
 */
function SummaryMailer(scheduler) {
  let self = this;

  this.scheduler = scheduler;
  mailer.init(settings);

  if (this.scheduler) {
    /**
     * This is the 'summary' event launched by the gameScheduler
     */
    this.scheduler.on('summary', async function (event) {
      logger.info(`Summary requested for ${event.gameId}`);
      // could be honestly discussed if it this is the right location here:
      // make the game public in order the recipients of the mail can see all data.
      await gpModel.makeGameplayPublic(event.gameId);
      self.sendInfo(event.gameId, err => {
        if (err) {
          return logger.error(err);
        }
        event.callback(err, event);
      });
    });
  }
}

/**
 * Sends the info, triggered by an event of the scheduler
 * @param gameId
 * @param callback
 */
SummaryMailer.prototype.sendInfo = function (gameId, callback) {
  try {
    gameCache.getGameData(gameId, (err, gameData) => {
      if (err) {
        return callback(err);
      }

      // Do not send any information for Demo games!
      if (gameData.gameplay.internal.isDemo) {
        logger.info(`NOT sending Summary Email, ${gameId} is a demo game!`);
        return callback();
      }

      let teams = _.valuesIn(gameData.teams);

      let bccString = '';
      teams.forEach(t => {
        bccString += _.get(t, 'data.teamLeader.email', '') + ',';
      });
      bccString += 'info@ferropoly.ch';

      let html = '';
      let text = '';

      html += '<h1>Ferropoly Spielinfo</h1>';
      html += '<p>Salü!</p>';
      html += '<p>Wir hoffen, Du hattest viel Spass am vergangenen Ferropoly!</p>';
      html += '<p>Die Zusammenfassung des Spiels steht nun für 30 Tage zur Ansicht unter diesem Link bereit: ';
      html += `<a href="${settings.server.url}/summary/${gameId}">${settings.server.url}/summary/${gameId}</a></p>`;
      html += '<p>Viele Grüsse vom Ferropoly-Team!</p>';

      text += 'Salü\nWir hoffen, Du hattest viel Spass am vergangenen Ferropoly!\n';
      text += 'Die Zusammenfassung des Spiels steht nun für 30 Tage zur Ansicht unter diesem Link bereit:\n';
      text += `${settings.server.url}/summary/${gameId}\n\n`;
      text += 'Viele Grüsse vom Ferropoly-Team!';

      mailer.send({
        to     : 'noreply@ferropoly.ch',
        cc     : _.get(gameData, 'gameplay.owner.organisatorEmail', undefined),
        bcc    : bccString,
        subject: 'Ferropoly Spielinfo',
        html   : html,
        text   : text
      }, err => {
        if (err) {
          return callback(err);
        }
        logger.info(`Summary Email for ${gameId} sent`);
        callback();
      });
    });
  }
  catch (ex) {
    logger.error(ex);
    callback(ex);
  }
};


module.exports = {
  /**
   * Create a marketplace. This should be done only once, afterwards get it using getMailer
   * @param scheduler
   * @returns {SummaryMailer}
   */
  createMailer: function (scheduler) {
    summaryMailer = new SummaryMailer(scheduler);
    return summaryMailer;
  },
  /**
   * Gets the summary mailer, throws an error, if not defined
   * @returns {*}
   */
  getMailer   : function () {
    if (!summaryMailer) {
      throw new Error('You must create a Summary Mailer first before getting it');
    }
    return summaryMailer;
  }
};
