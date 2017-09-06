/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

function randomString(len) {
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return '"'+ pwd + '"';
}

function randomX(len) {
    var $chars = '0123456789abcdef';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function randomAddress() {
    return '0x'+ randomX(40) + '';
}

function randomNumber(len){
    return '0x'+ randomX(len) + '';
}

function randomInteger(len){
    if(0 == len)
        return '0x0';

    var $chars = '01234567';
    var firstChr = $chars.charAt(Math.floor(Math.random() * $chars.length));

    if(Math.floor(Math.random()*2) == 0){
        return '-0x'+  firstChr + randomX(len-1) + '';
    }

    return '0x'+  firstChr + randomX(len-1) + '';
}

function GetRandomNum(Min, Max) // [Min, Max)
{
    var Range = Max - Min;
    var Rand = Math.floor(Math.random() * Range);
    return Min + Rand;
}

function testFunArgDefault(type) {
    if(type === "bool"){
        return Math.floor(Math.random()*2) == 0 ? "false" : "true";
    }

    if(type === "string" || type === "bytes"){
        return randomString(GetRandomNum(1,256));
    }

    if(type === "address"){
        return randomAddress();
    }

    var reg = /uint*/;
    if(reg.test(type)){
        var len = parseInt(type.substr(4)) * 2;
        if(isNaN(len))
            len = 4;
        //console.log("len=", len);
        if(len >= 4)
            len = 4;
        return randomNumber(len);
    }

    reg = /int*/;
    if(reg.test(type)){
        var len = (parseInt(type.substr(3))/8) * 2;
        if(isNaN(len))
            len = 4;
        //console.log("len=", len);
        if(len >= 4)
            len = 4;
        return randomInteger(len);
    }

    reg = /byte*/;
    if(reg.test(type)){
        var len = (parseInt(type.substr(4))/8) * 2;
        //console.log("len=", len);
        return randomString(len);
    }

    return '""';
}
/*
console.log(testFunArgDefault("uint"));
console.log(testFunArgDefault("int"));
console.log(testFunArgDefault("address"));
console.log(testFunArgDefault("string"));
console.log(testFunArgDefault("byte32"));
*/

function testFunArg(inputs) {
    var argstr = "";
    var first = true;

    //console.log("fun=", fun, ",argname=", argname);
    for(var i in inputs){
        var type = inputs[i].type;
        var str = testFunArgDefault(type);
        //console.log("type=", type, ",str=", str);

        if(first){
            argstr = str;
            first = false;
        }else{
            argstr = argstr + "," + str;
        }
    }

    return "(" + argstr + ")";
}

function testContractFun(con, fun, callback) {
    con.deployed().then(function(instance) {
        //console.log("fun=", fun, ",fun.name=", fun.name);

        var execstr = "";
        if(fun.constant){
            execstr = "instance." + fun.name + ".call" + testFunArg(fun.inputs);
        }else{
            execstr = "instance." + fun.name + testFunArg(fun.inputs);
        }

        //console.log("execstr=", execstr);
        return eval(execstr);
    }).then(function(result){
        callback(false, fun.name, result);
    }).catch(function(err){
        console.log("testContractFun_Error:", typeof err.message, err.message);
        callback(true, fun.name, err.message);
    });
}

function testContract(con, count, callback) {
    var abi = utils.funs(con);
    //console.log("abi=", abi);

    var ret = [];

    for(var i = 0; i < count; i++){
        var number = GetRandomNum(0, abi.length);
        //console.log("number=", number, ",abi.length=", abi.length);
        //console.log("testContract_begin:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i);

        testContractFun(con, abi[number], function (err, funname, result) {
            //console.log("testContract:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i, ",funname=", funname);

            var val = {};
            val.err = err;
            val.result = result;
            val.funname = funname;

            ret.push(val);

            if(ret.length >= count){
                callback(ret);
            }
        });
    }
}

function test(count, perCount, ret, callback) {

    var names = utils.names();
    if(0 == names.length){
        ret.err = "No have contract";
        //callback(ret);
        return;
    }

    var number = GetRandomNum(0, names.length);
    var name = names[number];
    var con = utils.contract(name);
    //console.log("test:name=", name);

    testContract(con, perCount, function (result) {
        //console.log("err=", err, ".succeed=", succeed, ",count=", count);
        if(typeof ret.contract[name] === "undefined"){
            ret.contract[name] = {count:0,err:0,succeed:0,function:{}};
        }

        var err = 0;
        var succeed = 0;

        for(var i in result) {
            if(typeof ret.contract[name].function[result[i].funname] === "undefined"){
                ret.contract[name].function[result[i].funname] = {count:0,err:0,succeed:0};
            }

            ret.contract[name].function[result[i].funname].count++;
            if (result[i].err) {
                err++;
                ret.contract[name].function[result[i].funname].err++;
            }else {
                succeed++;
                ret.contract[name].function[result[i].funname].succeed++;
                //ret[name].function[result.funname] =
            }
        }

        ret.contract[name].count += result.length;
        ret.contract[name].err += err;
        ret.contract[name].succeed += succeed;

        ret.count += result.length;
        ret.err += err;
        ret.succeed += succeed;

        //console.log("ret=", ret);
        if(count > 1){
            test(count-1, perCount, ret, callback);
        }else {
            //console.log("callback:ret=", ret);
            callback(ret);
        }

        //callback(ret);
    });
}

router.get('/', function(req, res, next) {
    res.send('test');
});

router.post('/contract', function(req, res, next) {
    var name = req.body.name;
    var count = req.body.count;

    var con = utils.contract(name);

    testContract(con, count, function (result) {
        var ret = {};

        ret.contract = name;
        ret.count = result.length;
        ret.err = 0;
        ret.succeed = 0;
        ret.function = {};


        for(var i in result) {
            if (typeof ret.function[result[i].funname] === "undefined") {
                ret.function[result[i].funname] = {count: 0, err: 0, succeed: 0};
            }

            if (result[i].err) {
                ret.err++;
                ret.function[result[i].funname].err++;
            }else {
                ret.succeed++;
                ret.function[result[i].funname].succeed++;
            }
        }

        res.send(ret);
    });
});

router.post('/test', function(req, res, next) {
    var count = req.body.count;
    var perCount = req.body.perCount;
    var ret = {"count": 0,
        "err": 0,
        "succeed": 0,
        "contract": {}};

    //console.log("count=", count, ",perCount=", perCount);
    test(count, perCount, ret, function (result) {
        //console.log("router.post.test:result=", JSON.stringify(result));
        res.send(result);
    });
});

module.exports = router;