/**
 * This is a handler displaying an error page. This is only suitable for UI errors, not for APIs
 * Created by kc on 16.10.15.
 */


module.exports = function(res, message, err, status) {
  res.status(status);
  res.render('error', {
    message: message,
    error: err
  });
};
