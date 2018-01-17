/**
 * Created by cjf on 2017/12/19.
 */

var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var args = require('./args.js');
var trans = require('./trans.js');
var logs = require('./logs.js');
var Webs = require('./webs.js');
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

function trans_trans(args, res) {
    try{
        //var trans = JSON.parse(args.trans);
        var trans = args.trans;
        var rpc = args[".rpc"];
        var webs = new Webs(rpc);
        //logs.logvar(args);
        //logs.logvar(JSON.stringify(trans));
        webs.trans(trans, function (error, result) {
            //var out = JSON.stringify(result);
            //logs.logvar(error, out);
            res.send({"err":error, "result":result});
        });
    }catch(err){
        res.send({"err":true, "result":err});
    }
};

function test(args, res) {
    try{
        var count = Number(args["count"]);
        var perCount = Number(args["perCount"]);
        var conname = args[".contract"];
        var fun = args[".function"];
        var address = args["address"];
        var rpc = args[".rpc"];

        var webs = new Webs(rpc);
        logs.logvar(conname);

        if(conname === undefined){
            var cons = utils.cons(rpc);
            id = webs.test(count, perCount, cons);
        }else if(fun === undefined){
            var cons = utils.cons(rpc);
            id = webs.test_con(count, perCount, cons[conname]);
        }else{
            id = webs.test_fun(count, perCount, fun, conname, address);
            logs.logvar(id);
        }

        logs.logvar(id);
        res.send({"err":false, "result":id});
    }catch(err){
        logs.logvar(err);
        res.send({"err":true, "result":err});
    }
};

function query_log(args, res) {
    var id = args.id;
    var rpc = args[".rpc"];

    var log = Webs.prototype.log(id);
    //logs.log("id=", id, "log=", log);
    res.send(log);
}

function query_cons(args, res) {
    var cons = utils.cons(args[".rpc"]);

    //logs.logvar(cons);
    res.send(cons);
}

function query(args, res) {
    try{
        var type = args["type"];
        if(type == 'log'){
            return query_log(args, res);
        }else if(type == 'cons'){
            return query_cons(args, res);
        }
    }catch(err){
        logs.logvar(err);
        res.send({"err":true, "result":err});
    }
};

function trans_call(args, res) {
    try{
        logs.logvar(args);
        Webs.prototype.call(args, function (error, result) {
            logs.logvar(args);
            res.send({"err":error, "result":result});
        });
    }catch(err){
        res.send({"err":error, "result":err});
    }
};

router.post('/', function(req, res, next) {
    root(req.body, res);
});

router.get('/', function(req, res, next) {
    root(req.query, res);
});

router.post('/call', function(req, res, next) {
    trans_call(req.body, res);
});

router.get('/call', function(req, res, next) {
    trans_call(req.query, res);
});

router.post('/trans', function(req, res, next) {
    trans_trans(req.body, res);
});

router.get('/trans', function(req, res, next) {
    trans_trans(req.query, res);
});

router.post('/test', function(req, res, next) {
    test(req.body, res);
});

router.get('/test', function(req, res, next) {
    test(req.query, res);
});

router.post('/query', function(req, res, next) {
    query(req.body, res);
});

router.get('/query', function(req, res, next) {
    query(req.query, res);
});


function test_1(args) {
    try{
        logs.logvar('*******************************************************************************');
        var id = args["id"];
        if(id !== undefined){
            res.send({"err":error, "result":webs.log(id)});
            return;
        }

        var count = Number(args["count"]);
        var perCount = Number(args["perCount"]);
        var conname = args[".contract"];
        var fun = args[".function"];
        var address = args["address"];
        var rpc = args[".rpc"];

        var webs = new Webs(rpc);
        logs.logvar(conname);

        if(conname === undefined){
            var cons = utils.cons(webs.web3.version.network);
            id = webs.test(count, perCount, cons);
        }else if(fun === undefined){
            var cons = utils.cons(webs.web3.version.network);
            id = webs.test_con(count, perCount, cons[conname]);
        }else{
            id = webs.test_con(count, perCount, fun, conname, address);
        }

        logs.logvar(id);
    }catch(err){
        logs.logvar(err);
        res.send({"err":true, "result":err});
    }
}

/*
//test_1({"count":5,"perCount":2});
var cons = utils.cons('http://192.168.153.128:8545/');
var con = cons['TestInt'];
var address = con.networks['5678'].address;
//test_1({".rpc":"http://192.168.153.128:8545","count":5,"perCount":2,"conname":"TestInt",".function":con.abi[1],"address":address});
*/

module.exports = router;
