/**
 * Created by cjf on 2017/8/29.
 */
var express = require('express');
var router = express.Router();

var Web3 = require('web3');
var contract = require("truffle-contract");
var provider = new Web3.providers.HttpProvider("http://192.168.153.128:8545");
var json = require('../solidity/build/contracts/TestInt.json');

var Test = contract(json);
Test.setProvider(provider);
Test.defaults({
    from : "0xd6084aeba0fd47f7e0bcc687acfe6e835faeae70"
});
console.log("test_int")

router.get('/', function(req, res, next) {
    res.send('test_int');
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

module.exports = router;
