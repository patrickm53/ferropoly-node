/**
 * Generic Modals functions
 */

var genericModals = {
  /**
   * Shows an error
   * @param title  Title to be displayed
   * @param body   Body message HTML
   * @param resp   response object (of a REST call, optional)
   * @param callback optional function to be called after sucess
   */
  showError: function (title, body, resp, callback) {
    if (_.isFunction(body)) {
      resp = body;
      body = null;
    }
    if (_.isFunction(resp)) {
      callback = resp;
      resp     = null;
    }

    if (resp) {
      body += '<br/>Fehlermeldung:<br/>\n';
      if (resp.data) {
        var info = resp.data;
        if (resp.data.message) {
          info = resp.data.message;
        }
        body += info + '<br/><br/>';
      }
      body += 'Status: ' + resp.status + ', ' + resp.statusText + '<br/>\n';

    }

    if (callback) {
      var btnError = $('#mod-error-btn');
      btnError.on('click', function () {
        btnError.off('click');
        callback();
      });
    }
    $('#mod-error-title').text(title);
    $('#mod-error-body').html(body);
    $('#modal-error').modal('show');
    console.info('Generic error-modal fired!', title, body, resp);
  },
  /**
   * An modal for a successful action is displayed
   * @param title
   * @param body   optional body of the dialog
   * @param callback optional callback
   */
  showSuccess : function (title, body, callback) {
    if (_.isFunction(body)) {
      body     = null;
      callback = body;
    }

    if (callback) {
      var btnError = $('#mod-success-btn');
      btnError.on('click', function () {
        btnError.off('click');
        callback();
      });
    }
    $('#mod-success-title').text(title);
    $('#mod-success-body').html(body);
    $('#modal-success').modal('show');
    console.info('Generic success-modal fired!', title, body);
  }
};

