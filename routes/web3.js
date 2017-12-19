/**
 * Created by cjf on 2017/12/19.
 */

var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var args = require('./args.js');
var trans = require('./trans.js');
var logs = require('./logs.js');
var webs = require('./webs.js');
var assert = require('assert');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider());
logs.log("web3 start web3=", web3);

router.get('/*', function(req, res, next) {
    var host = req.query.host;
    var port = req.query.port;
    var number = req.query.number;
    var url = "http://" + host +  ':' + port;

    logs.log("host=", host, "port=", port, "number=", number, "url=", url);
    logs.log("req.query=", req.query);

    try {
        var web3 = new Web3(new Web3.providers.HttpProvider(url));

        web3.eth.getBlock(number, function(error, result) {
            if (!error) {
                console.log(result);
                res.send(result);
            }else {
                console.error(error);
                res.send(error);
            }
        })
    } catch (err) {
        res.send(err);
        logs.log("err=", err);
    }
    //res.send(req.query);
});


module.exports = router;
