var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var webs = require('./webs.js');

function root(res) {
  var names = {"contract test":"/contract_test", "pressure test":"/pressure_test"};
  res.send(webs.button_list(names));
}
/* GET home page. */
router.get('/', function(req, res, next) {
  root(res);
});

router.post('/', function(req, res, next) {
  root(res);
});

router.get('/test', function(req, res, next) {
  root(res);
});

router.post('/test', function(req, res, next) {
  root(res);
});

module.exports = router;
