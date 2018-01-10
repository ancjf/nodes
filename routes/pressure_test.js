/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var args = require('./args.js');
var trans = require('./trans.js');
var logs = require('./logs.js');
var webs = require('./webs.js');
var assert = require('assert');

function pressure_test_transaction(stat, con, con_fun, count, perCount, callback) {
    var back_count = 0;

    for(var i = 0; i < perCount; i++){
        trans.trans(con, con_fun, JSON.stringify("{}"), function (result) {
            stat = trans.stat(stat, result);

            back_count++
            assert.ok(back_count <= perCount, "back_count > perCount");
            if(back_count >= perCount){
                logs.logvar(count, result.con.contract_name, result.fun.name, back_count);

                if(count > 1){
                    pressure_test_transaction(stat, con, con_fun, count-1, perCount, callback);
                }else{
                    callback(stat);
                }

            }
        });
    }
}

function pressure_test_contract(stat, con, count, perCount, callback) {
    var abi = utils.funs(con);
    var back_count = 0;

    for(var i = 0; i < perCount; i++){
        var number = utils.get_random_num(0, abi.length);
        //logs.logvar(number, abi.length);
        //logs.logvar(number, abi.length, count, i);

        trans.trans(con, abi[number], JSON.stringify("{}"), function (result) {
            stat = trans.stat(stat, result);

            back_count++
            assert.ok(back_count <= perCount, "back_count > perCount");
            if(back_count >= perCount){
                //logs.logvar(count, result.con.contract_name, result.fun.name);

                if(count > 1){
                    pressure_test_contract(stat, con, count-1, perCount, callback);
                }else{
                    callback(stat);
                }
            }
        });
    }
}

function pressure_test(rpc, stat, count, perCount, callback) {
    var names = utils.names(rpc);
    if(0 == names.length){
        logs.log("No have contract");
        callback(stat);
        return;
    }

    var number = utils.get_random_num(0, names.length);
    var name = names[number];
    var con = utils.contract(name, rpc);
    //logs.logvar(name, names);

    if(con.contract_name == undefined){
        logs.logvar(names, name);
        //res.send(stat.id);
        return;
    }

    //res.send(stat.id);
    pressure_test_contract(stat, con, 1, perCount, function (result) {
        //logs.logvar(stat, result);
        //stat = trans.stat_add(stat, result);
        stat = result;
        //logs.logvar(count, perCount, name);
        if(count > 1){
            pressure_test(rpc, stat, count-1, perCount, callback);
        }else{
            callback(stat);
        }
    });
}

function test_transaction(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var rpc = args[".rpc"];
    //var funname = args[".function"];

    //logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",args=", args);
    var con = utils.contract(conname, rpc);
    //var fun = utils.fun(con, funname);
    var fun = args[".function"];
    var funname = fun.name;
    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);

    if(fun.name == undefined){
        logs.logvar(count, perCount, conname, funname, fun);
        //res.send(stat);
        res.send(stat.id);
        return;
    }

    logs.logvar(count, perCount, conname, funname);
    res.send(stat.id);

    pressure_test_transaction(stat, con, fun, count, perCount, function (result) {

        var end = new Date().getTime();
        result.costTime = end - begin;

        logs.log("result=", logs.inspect(result));
        //res.send(result);
        //res.send(stat.id);
    });
}

function test_contract(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var funname = args[".function"];
    var rpc = args[".rpc"];

    var con = utils.contract(conname, rpc);
    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);

    logs.logvar(count, perCount, conname, funname);
    res.send(stat.id);
    pressure_test_contract(stat, con, count, perCount, function (result) {

        var end = new Date().getTime();
        result.costTime = end - begin;
        logs.log("result=", logs.inspect(result));
        //res.send(result);
    });
}

function test(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var fun = args[".function"];
    var rpc = args[".rpc"];

    logs.logvar(conname);

    if(conname != undefined && conname.length > 0){
        if(fun != undefined){
            test_transaction(args, res);
            return;
        }else if(conname.length > 0){
            test_contract(args, res);
            return;
        }
    }

    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);
    //logs.log("rpc=", rpc, ",count=", count, ",perCount=", perCount, ",conname=", conname, ",stat=", stat);
    res.send(stat.id);

    pressure_test(rpc, stat, count, perCount, function (result) {
        var end = new Date().getTime();
        result.costTime = end - begin;
        logs.log("result=", logs.inspect(result));
        //res.send(result);
    });
}

function contract(args, res) {
    res.send("");
}

function log(args, res) {
    var id = args.id;
    var remove = args.remove;
    //logs.logvar(id, remove);

    var ret = trans.log(id, remove);

    res.send(ret);
}

function query(args, res) {
    var name = args.name;
    var rpc = args[".rpc"];
    logs.logvar(rpc, name);
    if(name == undefined){
        res.send(utils.names(rpc));
        logs.log("name=", name);
        return;
    }

    var abi = utils.funs(name, rpc);

    //logs.logvar(name, abi);
    res.send(abi);
}

function root(args, res) {
    var rpc = args[".rpc"];
    var names = utils.names(rpc);

    res.send("");
}

router.post('/', function(req, res, next) {
    root(req.body, res);
});

router.get('/', function(req, res, next) {
    root(req.query, res);
});

router.post('/contract', function(req, res, next) {
    contract(req.body, res);
});

router.get('/contract', function(req, res, next) {
    contract(req.query, res);
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

router.post('/log', function(req, res, next) {
    log(req.body, res);
});

router.get('/log', function(req, res, next) {
    log(req.query, res);
});

module.exports = router;