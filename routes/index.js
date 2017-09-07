var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

function link(name, text) {
  return '<a href="/' + name + '">' + text  + '</a> <br>';
}

function link_table(names) {
  var ret = "";

  for (var f in names){
      ret += link(f, names[f]);
  }

  return ret;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var names = {"contract_test":"test contract", "pressure_test":"pressure test"};
  res.send(link_table(names));
});

module.exports = router;
