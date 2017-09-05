var express = require('express');
var router = express.Router();

var utils = require('./utils.js');
var user = utils.contract("Users");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('user');
});

router.post('/set', function(req, res, next) {
  var name = req.body.user;
  var amount = req.body.amount;
  var create = req.body.create;
  console.log("Test* set,name=", name, ",amount=", amount, ",create=", create);

  user.deployed().then(function(instance) {
    return instance.set(name, amount, create);
  }).then(function(result){
    //console.log(result);
    res.send(result);
  });
});

router.post('/add', function(req, res, next) {
  var name = req.body.user;
  var amount = req.body.amount;
  var create = req.body.create;
  console.log("Test* add,name=", name, ",amount=", amount, ",create=", create);

  user.deployed().then(function(instance) {
    return instance.add(name, amount, create);
  }).then(function(result){
    //console.log(result);
    res.send(result);
  });
});

router.post('/dec', function(req, res, next) {
  var name = req.body.user;
  var amount = req.body.amount;
  console.log("Test* dec,name=", name, ",amount=", amount);

  user.deployed().then(function(instance) {
    return instance.dec(name, amount);
  }).then(function(result){
    //console.log(result);
    res.send(result);
  });
});

router.post('/get', function(req, res, next) {
  var name = req.body.user;
  console.log("Test* dec,name=", name);

  user.deployed().then(function(instance) {
    return instance.get(name);
  }).then(function(result){
    //console.log(result);
    res.send(result);
  });
});

module.exports = router;
