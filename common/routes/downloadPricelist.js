/**
 * Supplies a route for downloading pricelist as Excel sheet
 *
 * This route is provided as router and as handler function as it could be needed differently in
 * the programs.
 *
 * Created by kc on 14.12.15.
 */



var express   = require('express');
var router    = express.Router();
var pricelist = require('../lib/pricelist');
var xlsx      = require('node-xlsx');

/**
 * Handler for priceslist download
 * @param req
 * @param res
 */
function handler(req, res) {
  pricelist.getArray(req.params.gameId, function (err, report) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }

    var buffer = xlsx.build([{name: report.sheetName, data: report.data}]);

    res.set({
      'Content-Type'       : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Description': 'File Transfer',
      'Content-Disposition': 'attachment; filename=' + report.fileName,
      'Content-Length'     : buffer.length
    });
    res.send(buffer);
  })
}

router.get('/:gameId', handler);

module.exports = {
  router : router,
  handler: handler
};
