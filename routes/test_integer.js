/**
 * Created by cjf on 2017/8/29.
 */
var express = require('express');
var router = express.Router();

var web3 = require('web3');
var contract = require("truffle-contract");
var truffle = require('../solidity/truffle.js');
var provider = new web3.providers.HttpProvider("http://" + truffle.networks.development.host + ":" +  truffle.networks.development.port);
var json = require('../solidity/build/contracts/TestInt.json');

var Test = contract(json);
Test.setProvider(provider);
Test.defaults({
    from : "0xd6084aeba0fd47f7e0bcc687acfe6e835faeae70"
});
console.log("test_int")

router.get('/', function(req, res, next) {
    res.send('test_integer');
});

router.get('/get', function(req, res, next) {
    console.log("Test get", Test);

    Test.deployed().then(function(instance) {
        return instance.get.call();
    }).then(function(result){
        console.log(result);
        res.send(result);
    });

});

router.get('/set', function(req, res, next) {
    console.log("Test set", Test);

    Test.deployed().then(function(instance) {
        return instance.set("0x01");
    }).then(function(result){
        console.log(result);
        res.send(result);
    });

});

router.post('/set', function(req, res, next) {
    var val = req.body.val;
    console.log("Test set,val=", val);

    Test.deployed().then(function(instance) {
        return instance.set(val);
    }).then(function(result){
        console.log(result);
        res.send(result);
    });

});

module.exports = router;
