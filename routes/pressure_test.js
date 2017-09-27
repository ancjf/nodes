/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var args = require('./args.js');
var trans = require('./trans.js');
var assert = require('assert');

function pressure_test_contract(con, count, callback) {
    var abi = utils.funs(con);
    //console.log("abi=", abi);

    var ret = [];

    for(var i = 0; i < count; i++){
        var number = utils.get_random_num(0, abi.length);
        //console.log("number=", number, ",abi.length=", abi.length);
        //console.log("test_contract_begin:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i);

        trans.trans(con, abi[number], JSON.stringify("{}"), function (err, fun, result) {
            //console.log("test_contract:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i, ",funname=", funname);

            var val = {};
            val.err = err;
            val.result = result;
            val.fun = fun;

            ret.push(val);

            assert.ok(ret.length <= count, "ret.length > count")
            if(ret.length >= count){
                callback(ret);
            }
        });
    }
}

function pressure_test(count, perCount, ret, callback) {

    var names = utils.names();
    if(0 == names.length){
        ret.err = "No have contract";
        //callback(ret);
        return;
    }

    var number = utils.get_random_num(0, names.length);
    var name = names[number];
    var con = utils.contract(name);
    //console.log("test:name=", name);

    pressure_test_contract(con, perCount, function (result) {
        //console.log("err=", err, ".succeed=", succeed, ",count=", count);
        if(typeof ret.contract[name] === "undefined"){
            ret.contract[name] = {count:0,err:0,nolog:0,succeed:0,function:{}};
        }

        var err = 0;
        var nolog = 0;
        var succeed = 0;

        for(var i in result) {
            var funname = result[i].fun.name;

            if(typeof ret.contract[name].function[funname] === "undefined"){
                if(result[i].fun.constant)
                    ret.contract[name].function[funname] = {count: 0, err: 0, succeed: 0};
                else
                    ret.contract[name].function[funname] = {count: 0, err: 0, nolog:0, succeed: 0};
            }

            ret.contract[name].function[funname].count++;
            if (result[i].err) {
                err++;
                ret.contract[name].function[funname].err++;
            }else {
                succeed++;
                if(result[i].fun.constant){
                    ret.contract[name].function[funname].succeed++;
                }else{
                    if(result[i].result.logs.length > 0){
                        ret.contract[name].function[funname].succeed++;
                    }else{
                        nolog++;
                        ret.contract[name].function[funname].nolog++;
                    }
                }

                //ret[name].function[result.funname] =
            }
        }

        ret.contract[name].count += result.length;
        ret.contract[name].err += err;
        ret.contract[name].nolog += nolog;
        ret.contract[name].succeed += succeed;

        ret.count += result.length;
        ret.err += err;
        ret.nolog += nolog;
        ret.succeed += succeed;

        console.log("count=", count, ",perCount=", perCount, ",name=", name);
        if(count > 1){
            pressure_test(count-1, perCount, ret, callback);
        }else {
            //console.log("callback:ret=", ret);
            callback(ret);
        }

        //callback(ret);
    });
}

function link(name) {
    return '<form action="pressure_test/contract" method="get"> <input type="hidden" name="name" value="' + name + '" /> <input name="count" type="number"   value="1" min="1"> <input type="submit" id="submitName" value="test: ' + name + '" /> </form>';
}

function link_table(names) {
    var ret = "";

    for (var f in names){
        var name = names[f];
        //console.log("name=", name);

        ret += link(name);
    }

    ret += '<form action="pressure_test/test" method="get"> <table border="0" cellspacing="5" cellpadding="5" style="border:1px #666666 solid;"> <tr> <td> <label> count: </label> </td> <td>  <input type="number" name="count" value="1" min="1" />  </td> </tr> <tr> <td> <label> perCount: </label> </td> <td> <input name="perCount" type="number"   value="1" min="1"> </td> </tr> <tr> <td> <input type="submit" id="submitName" value="tast all" /> </td> </tr> </table> </form>';
    //console.log(ret);
    return ret;
}

router.get('/', function(req, res, next) {
    var names = utils.names();
    res.send(link_table(names));
});

function contract(args, res) {
    var name = args.name;
    var count = args.count;

    var con = utils.contract(name);
    var begin = new Date().getTime();

    pressure_test_contract(con, count, function (result) {
        var ret = {};

        ret.count = result.length;
        ret.err = 0;
        ret.nolog = 0;
        ret.succeed = 0;
        ret.costTime = 0,
        ret.contract = name;
        ret.function = {};

        for(var i in result) {
            var funname = result[i].fun.name;
            if (typeof ret.function[funname] === "undefined") {
                if(result[i].fun.constant)
                    ret.function[funname] = {count: 0, err: 0, succeed: 0};
                else
                    ret.function[funname] = {count: 0, err: 0, nolog:0, succeed: 0};
            }

            if (result[i].err) {
                ret.err++;
                ret.function[funname].err++;
            }else {
                ret.succeed++;
                if(result[i].fun.constant){
                    ret.function[funname].succeed++;
                }else{
                    if(result[i].result.logs.length > 0){
                        ret.function[funname].succeed++;
                    }else{
                        ret.function[funname].nolog++;
                    }
                }
            }
        }

        var end = new Date().getTime();
        ret.costTime = end - begin;
        console.log("ret=", ret);
        res.send(ret);
    });
}

router.post('/contract', function(req, res, next) {
    contract(req.body, res);
});

router.get('/contract', function(req, res, next) {
    contract(req.query, res);
});

function test(args, res) {
    var count = args.count;
    var perCount = args.perCount;
    var ret = {"count": 0,
        "err": 0,
        "nolog": 0,
        "succeed": 0,
        "costTime" : 0,
        "contract": {}};

    var begin = new Date().getTime();
    //console.log("count=", count, ",perCount=", perCount);
    pressure_test(count, perCount, ret, function (result) {
        //console.log("router.post.test:result=", JSON.stringify(result));
        //var end = new Date().getTime();
        //ret.costTime = end - begin;
        //console.log("ret.costTime=", ret.costTime);
        console.log("result=", JSON.stringify(result));
        res.send(result);
    });
}

router.post('/test', function(req, res, next) {
    test(req.body, res);
});

router.get('/test', function(req, res, next) {
    test(req.query, res);
});

module.exports = router;