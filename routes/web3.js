/**
 * Created by cjf on 2017/12/19.
 */

var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var logs = require('./logs.js');
var Webs = require('./webs.js');
var assert = require('assert');
var Web3 = require('web3');

function trans_trans(args, res) {
    try{
        //var trans = JSON.parse(args.trans);
        var trans = args.trans;
        var rpc = args[".rpc"];
        var webs = new Webs(rpc);
        //logs.logvar(args);
        //logs.logvar(JSON.stringify(trans));
        webs.trans(trans, function (error, result) {
            var out = JSON.stringify(result);
            logs.logvar(error, out);
            res.send({"err":false, "result":result});
        });
    }catch(err){
        //logs.logvar(typeof(err.stack), err.stack);
        res.send({"err":true, "result":err.stack});
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
        }

        logs.logvar(id);
        res.send({"err":false, "result":id});
    }catch(err){
        //logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

function query_log(args, res) {
    var id = args.id;
    var rpc = args[".rpc"];

    var log = Webs.prototype.log(id);
    //logs.log("id=", id, "log=", log);
    res.send(log);
}

function query_cons(args, res, cookies) {
    //logs.logvar('start', cons);
    var cons = utils.cons(args[".rpc"], cookies.account.account, function (cons) {
        logs.logvar(cons);
        res.send(cons);
    });
}

function query(args, res, cookies) {
    try{
        logs.logvar(cookies);
        var type = args["type"];
        if(type == 'log'){
            return query_log(args, res);
        }else if(type == 'cons'){
            return query_cons(args, res, cookies);
        }
    }catch(err){
        //logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

function trans_call(args, res) {
    try{
        logs.logvar(args);
        Webs.prototype.call(args, function (error, result) {
            logs.logvar(args);
            res.send({"err":false, "result":result});
        });
    }catch(err){
        //logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

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
    query(req.body, res, req.cookies);
});

router.get('/query', function(req, res, next) {
    query(req.query, res, req.cookies);
});


function test_1(args) {
    try{
        logs.logvar('*******************************************************************************');
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
