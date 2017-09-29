/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var args = require('./args.js');
var trans = require('./trans.js');
var logs = require('./logs.js');
var assert = require('assert');

function pressure_test_transaction(stat, con, con_fun, count, perCount, callback) {
    var back_count = 0;

    for(var i = 0; i < perCount; i++){
        trans.trans(con, con_fun, JSON.stringify("{}"), function (err, conname, fun, result) {
            stat = trans.stat(stat, err, conname, fun, result);

            back_count++
            assert.ok(back_count <= perCount, "ret.length > count");
            //logs.log("pressure_test_transaction:count=", count, ",conname=", conname, ",fun.name=", fun.name, ",back_count=", back_count);
            if(back_count >= perCount){
                logs.log("pressure_test_transaction:count=", count, ",conname=", conname, ",fun.name=", fun.name);

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

        trans.trans(con, abi[number], JSON.stringify("{}"), function (err, conname, fun, result) {
            stat = trans.stat(stat, err, conname, fun, result);

            back_count++
            assert.ok(back_count <= perCount, "ret.length > count");
            //logs.log("pressure_test_contract:count=", count, ",conname=", conname, ",fun.name=", fun.name, ",back_count=", back_count);
            if(back_count >= perCount){
                logs.log("pressure_test_contract:count=", count, ",conname=", conname, ",fun.name=", fun.name);

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
        ret.err = "No have contract";
        //callback(ret);
        return;
    }

    var number = utils.get_random_num(0, names.length);
    var name = names[number];
    var con = utils.contract(name);
    //logs.log("test:name=", name);

    pressure_test_contract(stat, con, 1, perCount, function (result) {
        //logs.log("stat=", stat, "result=", result);
        //stat = trans.stat_add(stat, result);
        stat = result;

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
    var stat = {};

    logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname, ",fun=", fun);
    pressure_test_transaction(stat, con, fun, count, perCount, function (stat) {

        var end = new Date().getTime();
        stat.costTime = end - begin;

        logs.log("stat=", stat);
        res.send(stat);
    });
}

function test_contract(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var funname = args[".function"];

    var con = utils.contract(conname);
    var begin = new Date().getTime();
    var stat = {};

    pressure_test_contract(stat, con, count, perCount, function (result) {

        var end = new Date().getTime();
        result.costTime = end - begin;
        logs.log("result=", result);
        res.send(result);
    });
}

function test(args, res) {
    var count = args["count"];
    var perCount = args["perCount"];
    var conname = args[".contract"];
    var funname = args[".function"];

    logs.log("count=", count, ",perCount=", perCount, ",conname=", conname, ",funname=", funname);
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
    var stat = {};

    pressure_test(stat, count, perCount, function (result) {
        var end = new Date().getTime();
        result.costTime = end - begin;
        logs.log("result=", result);
        res.send(result);
    });
}

function link_table_input(text, conname, funname){
    var text = '<tr>  <input type="hidden" name=".contract" value="' + conname + '" /> <input type="hidden" name=".function" value="' + funname + '" /> <td> <label>  '+ text + '</label> </td> </tr>';
    var input = '<tr> <td> count:</td>  <td> <input name="count" type="number" value="5" min="1" ></td></tr> <tr> <td> perCount:</td>  <td> <input name="perCount" type="number" value="5" min="1"></td></tr>';

    return  '<form action="/pressure_test/test" method="get">  <table border="0" cellspacing="5" cellpadding="5" style="border:1px #666666 solid;">' + text + input + '<tr> <td> <input type="submit" id="submitName" value=' + "开始测试" + ' />  </td> </tr> </table> </form>';
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

    //logs.log("name=", name, ",req.body=", req.body);
    res.send(link);
}

function root(args, res) {
    var names = utils.names();

    var ret = "";

    for (var f in names){
        var name = names[f];
        //logs.log("name=", name);

        ret += '<form action="pressure_test/contract" method="get"> <input type="hidden" name="name" value="' + name + '" /> <input type="submit" id="submitName" value="test: ' + name + '" /> </form>';
    }

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

module.exports = router;