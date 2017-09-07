var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

function link(name) {
  return '<a href="/' + name + '">' + name  + '</a> <br>';
}

function link_table(names) {
  var ret = "";

  for (var f in names){
      var name = names[f];
      //console.log("name=", name);

      ret += link(name);
  }

  //console.log(ret);
  return ret;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var names = ["contract_test", "pressure_test"];
  res.send(link_table(names));
});

module.exports = router;
