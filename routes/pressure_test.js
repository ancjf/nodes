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
                logs.log("pressure_test_transaction:count=", count, ",conname=", result.con.contract_name, ",fun.name=", result.fun.name, ",back_count=", back_count);

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
        //logs.log("number=", number, ",abi.length=", abi.length);
        //logs.log("test_contract_begin:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i);

        trans.trans(con, abi[number], JSON.stringify("{}"), function (result) {
            stat = trans.stat(stat, result);

            back_count++
            assert.ok(back_count <= perCount, "back_count > perCount");
            if(back_count >= perCount){
                logs.log("pressure_test_contract:count=", count, ",conname=", result.con.contract_name, ",fun.name=", result.fun.name);

                if(count > 1){
                    pressure_test_contract(stat, con, count-1, perCount, callback);
                }else{
                    callback(stat);
                }
            }
        });
    }
}

function pressure_test(stat, count, perCount, callback) {
    var names = utils.names();
    if(0 == names.length){
        logs.log("No have contract");
        callback(stat);
        return;
    }

    var number = utils.get_random_num(0, names.length);
    var name = names[number];
    var con = utils.contract(name);
    //logs.log("test:name=", name);

    if(con.contract_name == undefined){
        logs.log("name=", name);
        //res.send(stat.id);
        return;
    }

    //res.send(stat.id);
    pressure_test_contract(stat, con, 1, perCount, function (result) {
        //logs.log("stat=", stat, "result=", result);
        //stat = trans.stat_add(stat, result);
        stat = result;
        logs.log("test:count=", count, ",perCount=", perCount, ",name=", name);
        if(count > 1){
            pressure_test(stat, count-1, perCount, callback);
        }else{
            callback(stat);
        }
    });
}

function test_transaction(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var funname = args[".function"];

    var con = utils.contract(conname);
    var fun = utils.fun(con, funname);
    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);

    if(fun.name == undefined){
        logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname, ",fun=", fun);
        //res.send(stat);
        res.send(stat.id);
        return;
    }

    logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname);
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

    var con = utils.contract(conname);
    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);

    logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname);
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
    var funname = args[".function"];

    logs.log("funname=", funname);
    if(funname != undefined && funname.length > 0) {
        var arr = funname.split(".");
        if(arr.length > 1){
            args[".contract"] = arr[0];
            args[".function"] = utils.con_fun_name(arr[0], arr[1], arr[2] ==  'call' ? true : false);
        }else{
            args[".contract"] = funname;
            args[".function"] = "";
        }

        funname = args[".function"];
        logs.log("arr=", arr);
    }

    var conname = args[".contract"];
    if(conname != undefined && funname != undefined){
        if(conname.length > 0 && funname.length > 0){
            test_transaction(args, res);
            return;
        }else if(conname.length > 0){
            test_contract(args, res);
            return;
        }
    }

    var begin = new Date().getTime();
    var stat = trans.stat_init(count*perCount);
    logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname, ",stat=", stat);
    res.send(stat.id);

    pressure_test(stat, count, perCount, function (result) {
        var end = new Date().getTime();
        result.costTime = end - begin;
        logs.log("result=", logs.inspect(result));
        //res.send(result);
    });
}

function link_table_input(text, conname, funname){
    var inputs = {"count": "count", "perCount": "perCount"};

    return webs.from(text, "/pressure_test/test", inputs, conname, funname, "number", "5");
}

function contract(args, res) {
    var name = args.name;
    var abi = utils.abi(name);

    var link = link_table_input(name, name, "");

    for (var i in abi){
        var fun = abi[i];
        if(fun.type != "function"){
            //logs.log("type fun=", fun);
            continue;
        }

        var type =  fun.constant ? ".call" : ".transaction";
        var text = name + "." + fun.name + type;
        var funname = utils.fun_name(fun);

        link += link_table_input(text, name, funname);
    }

    logs.log("name=", name);
    res.send(link);
}

function log(args, res) {
    var id = args.id;
    var remove = args.remove;
    logs.log("id=", id, ",remove=", remove);

    var ret = trans.log(id, remove);

    res.send(ret);
}

function query(args, res) {
    var name = args.name;
    logs.log("name=", name);
    if(name == undefined){
        res.send(utils.names());
        logs.log("name=", name);
        return;
    }

    var abi = utils.abi(name);
    var arr = new Array();
    var index = 0;
    arr[index++] = name;

    for (var i in abi){
        var fun = abi[i];
        if(fun.type != "function"){
            //logs.log("type fun=", fun);
            continue;
        }

        var type =  fun.constant ? ".call" : ".transaction";
        var text = name + "." + fun.name + type;
        var funname = utils.fun_name(fun);

        arr[index++] = text;
    }

    logs.log("arr=", arr);
    res.send(arr);
}

function root(args, res) {
    var names = utils.names();
    var args = {};

    for (var f in names){
        var name = names[f];
        args[name] = "/pressure_test/contract";
    }

    var ret = webs.button_list(args);
    ret += link_table_input("", "", "");

    res.send(ret);
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