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
//logs.log("web3 start web3=", web3);
/*
web3.extend({
    methods: [{
        name: 'getPeers',
        call: 'admin_peers',
    }]
});
*/
function result_fun(result) {
    if(typeof(result) == "number")
        result = result.toString();
    if(result == null)
        result = "null";

    return result;
}

function root(args, res) {
    var fun = args.fun;
    var arg = args.arg;
    var type = args.type;
    //var url = "http://" + host +  ':' + port;
    var url = args[".rpc"];

    //logs.log("url=", url, "url=", url, "fun=", fun, "arg=", arg, "type=", type);
    //logs.log("args=", args);

    var callback = function (error, result) {
        if (!error) {
            //logs.log(result);
            res.send(result_fun(result));
        }else {
            //logs.log(error);
            res.send({});
        }
    }

    try {
        var line;
        var result
        var web3 = new Web3(new Web3.providers.HttpProvider(url));

        //logs.log("web3.eth.blockNumber=", web3.eth.blockNumber);

        if(type == 'fun.sync') {
            line = 'web3.' + fun + '(' + arg + ', callback)';
            eval(line);
        }else if(type == 'fun'){
            line = 'web3.' + fun + '(' + arg + ')';
            //logs.log("line=", line);
            result = eval(line);

            //logs.log("line=", line, "result=", result, ',typeof(result)=', typeof(result));
            res.send(result_fun(result));
        }else{
            line = 'result = web3.' + fun;
            //logs.log("line=", line);
            eval(line);

            //logs.log("line=", line, "result=", result, ',typeof(result)=', typeof(result));
            res.send(result_fun(result));
        }

        //logs.log("web3=", web3);
        //web3.eth.getBlock(number, callback)
    } catch (err) {
        res.send(err);
        //logs.log("err=", err);
    }
    //res.send(args);
};

router.post('/', function(req, res, next) {
    logs.log("req.body=", req.body);
    root(req.body, res);
});

router.get('/*', function(req, res, next) {
    root(req.query, res);
});

module.exports = router;
