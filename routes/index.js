var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var webs = require('./webs.js');
var logs = require('./logs.js');

function root(args, res) {
  var cons = utils.cons(args.netword);

  //logs.logvar(cons);
  res.send(cons);
}

function test(args, res) {
    var names = {"contract test":"/contract_test", "pressure test":"/pressure_test"};
    res.send(webs.button_list(names));
}

/* GET home page. */
router.get('/cons', function(req, res, next) {
  logs.logvar(req.query, req.path);
  //res.sendFile();
  root(req.query, res);
});

router.post('/cons', function(req, res, next) {
  root(req.body, res);
});

router.get('/test', function(req, res, next) {
    root(req.query, res);
});

router.post('/test', function(req, res, next) {
    root(req.body, res);
});

module.exports = router;
