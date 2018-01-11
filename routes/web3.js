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

if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    XMLHttpRequest = window.XMLHttpRequest // jshint ignore: line
// node
} else {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest // jshint ignore: line
}

var XHR2 = require('xhr2') // jshint ignore: line

function rpc_call(url, name, params, fun) {
    var xhr = new XHR2();
    //var xhr = new XMLHttpRequest();

    xhr.onload = function(event) {
        fun(false, xhr.responseText);
    };

    xhr.onerror = function(event) {
        fun(true, event.type);
    };

    xhr.open('POST', url, true);
    var data = {"jsonrpc":"2.0","id":"2","method":name,"params":JSON.parse(params)};
    data = JSON.stringify(data);
    logs.logvar(data);
    xhr.send(data);
}
/*
rpc_call("http://192.168.153.128:8545", "net_version", "[]", function (err, result) {
    logs.logvar(err, result);

    rpc_call("http://192.168.153.128:8545", "eth_protocolVersion", "[]", function (err, result) {
        logs.logvar(err, result);
    })
})
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
    var params = args.params;
    var url = args[".rpc"];

    //logs.logvar(args, url, fun, params);
    rpc_call(url, fun, params, function (error, result) {
        //logs.logvar(error, result);
        if (!error) {
            logs.logvar(result);
            res.send(result);
        }else {
            //logs.log(error);
            res.send({});
        }
    });
};

function trans_call(args, res) {
    var trans = JSON.parse(args.trans);
    var rpc = args[".rpc"];

    logs.logvar(trans);
    webs.trans(rpc, trans, function (error, result) {
        logs.logvar(error, result);
        res.send({"err":error, "result":result});
    });
};

function call(args, res) {
    webs.call(args, function (error, result) {
        logs.logvar(error, result);
        res.send({"err":error, "result":result});
    });
};

router.post('/', function(req, res, next) {
    root(req.body, res);
});

router.get('/', function(req, res, next) {
    root(req.query, res);
});

router.post('/trans', function(req, res, next) {
    trans_call(req.body, res);
});

router.get('/trans', function(req, res, next) {
    console.log("end:index=");
    logs.logvar("11111111111");
    trans_call(req.query, res);
});

router.post('/call', function(req, res, next) {
    call(req.body, res);
});

router.get('/call', function(req, res, next) {
    call(req.query, res);
});

module.exports = router;
