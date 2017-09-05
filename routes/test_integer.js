/**
 * Created by cjf on 2017/8/29.
 */
var express = require('express');
var router = express.Router();

var utils = require('./utils.js');
var test = utils.contract("TestInt");

router.get('/', function(req, res, next) {
    res.send('test_integer');
});

router.get('/get', function(req, res, next) {
    console.log("Test get", test);

    test.deployed().then(function(instance) {
        return instance.get.call();
    }).then(function(result){
        console.log(result);
        res.send(result);
    });
});

router.get('/set', function(req, res, next) {
    console.log("Test set", test);

    test.deployed().then(function(instance) {
        return instance.set("0x01");
    }).then(function(result){
        console.log(result);
        res.send(result);
    });
});

function  testSet(count, val) {
    if(0 >= count)
        return;

    console.log("testSet:count=", count, ",val=", val);

    test.deployed().then(function(instance) {
        return instance.set(val);
    }).then(function(result){
        testSet(count-1);
    });
}

router.post('/set', function(req, res, next) {
    var val = req.body.val;
    var count = req.body.count;
    console.log("Test* set,val=", val, ",count=", count);

    //testSet(count, val);
   // return;

    test.deployed().then(function(instance) {
        return instance.set(val);
    }).then(function(result){
        //console.log(result);
        res.send(result);
    });
});

module.exports = router;
