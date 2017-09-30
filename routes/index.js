var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var webs = require('./webs.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var names = {"contract test":"/contract_test", "pressure test":"/pressure_test"};
  res.send(webs.button_list(names));
});

module.exports = router;
