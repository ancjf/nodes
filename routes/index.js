var express = require('express');
var router = express.Router();
var fs = require('fs');


function link(name) {
  return "<a href=" + name + ">" + name + "</a><br>";
}

function link_table(files) {
  var ret = "";

  for (var f in files){
      var name = files[f].split(".")[0];
      console.log("name=", name);

      ret += link(name);
  }

  console.log(ret);
  return ret;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var dir = './solidity/build/contracts/';
  var files = fs.readdirSync(dir);
  console.log(files);

  res.send(link_table(files));

  //res.render('index', { title: 'Express' });
});

module.exports = router;
