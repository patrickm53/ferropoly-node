/**
 * Tests for the Pic Bucket
 */

const expect      = require('expect.js');
const path        = require("path");
const _           = require('lodash');
const ferropolyDb = require('../../../common/lib/ferropolyDb');
let picBucket     = undefined;
describe('PicBucket Tests Initialisation', () => {

  it('will fail without settings', () => {
    let failed = true;
    try {
      picBucket = require('../../../main/lib/picBucket')();
      failed    = false;
    } catch (ex) {
      failed = true;
    } finally {
      expect(failed).be(true);
    }
  });

  it('will fail without credentials', () => {
    let failed = true;
    try {
      picBucket = require('../../../main/lib/picBucket')({
        bucket : 'ferropoly-test',
        baseUrl: 'https://storage.googleapis.com'
      });
      failed    = false;
    } catch (ex) {
      failed = true;
    } finally {
      expect(failed).to.be(true);
    }
  })


  it('will work with credentials', () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '..', '..', '..', '..', 'ferropoly-service.json');
    let failed                                 = true;
    try {
      picBucket = require('../../../main/lib/picBucket')({
        bucket : 'ferropoly-test',
        baseUrl: 'https://storage.googleapis.com'
      });
      failed    = false;
    } catch (ex) {
      failed = true;
    } finally {
      expect(failed).to.be(false);
    }
  })

});

describe('PicBucket operation', () => {
  before(done => {
    ferropolyDb.init(require('../../../main/settings.js'), done);
  })

  let info     = undefined;
  const teamId = 'demo-team';
  const gameId = 'unit-test';

  it('will provide a link', done => {
    picBucket.announceUpload(gameId, teamId, {}, (err, data) => {
      expect(err).to.be(null);
      expect(data).to.be.an('object');
      info = data;
      done();
    })
  });

  it('will be possible to upload a file and will be notified', done => {
    picBucket.on('new', (info) => {
      expect(info).to.be.an('object');
      done();
    });
    picBucket.confirmUpload(info.id, (err, doc) => {
      expect(err).to.be(null);
      expect(doc.url).to.be.an('string')
      expect(doc.uploaded).to.be(true);
      expect(doc.teamId).to.be(teamId)
      expect(doc.gameId).to.be(gameId)
    })
  });

  it('will find the file in the list of files', done => {
    picBucket.list(gameId, {}, (err, docs) => {
      expect(err).to.be(null);
      expect(_.find(docs, {_id: info.id})).to.be.an('object');
      done();
    })
  });

  it('is possible to check the connectivity', done => {
    picBucket.on('error', err => {
      done(err);
    })
    picBucket.testConnectivity(() => {
      done();
    });
  }).timeout(10000);

  it('will delete all files again', done => {
    picBucket.deleteAllPics(gameId, err => {
      expect(err).to.be(null);
      picBucket.list(gameId, {}, (err, docs) => {
        expect(err).to.be(null);
        expect(docs.length).to.be(0);
        done();
      })
    })
  })
})
