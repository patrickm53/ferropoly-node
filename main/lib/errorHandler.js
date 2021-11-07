/**
 * This is a handler displaying an error page. This is only suitable for UI errors, not for APIs
 * Created by kc on 16.10.15.
 */


module.exports = function(res, message, err, status) {
  res.status(status);
  if (status === 401) {
    return res.render('error/401');
  }
  if (status === 403) {
    return res.render('error/403');
  }
  if (status === 404) {
    return res.render('error/404');
  }
  return res.render('error/generic', {
    status: `Status ${status}`,
    message: message,
    error: err
  });
};
