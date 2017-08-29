/**
 * Created by cjf on 2017/8/29.
 */
var express = require('express');
var router = express.Router();

var truffle = require('../solidity/truffle.js');
var httpProvider = "http://" + truffle.networks.development.host + ":" +  truffle.networks.development.port;

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));

var contract = require("truffle-contract");

var provider = new Web3.providers.HttpProvider(httpProvider);
var json = require('../solidity/build/contracts/TestInt.json');

var defaultAccount = web3.eth.defaultAccount;
if(defaultAccount === undefined){
    defaultAccount = web3.eth.accounts[0];
}
console.log(defaultAccount);

var Test = contract(json);
Test.setProvider(provider);
Test.defaults({
    from : defaultAccount
});

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
