/**
 * User Account information
 * Created by kc on 30.12.15.
 */

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.render('account', {
    title     : 'Mein Account',
    hideLogout: false
  });
});


module.exports = router;
