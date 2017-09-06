/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

console.log("tesg being");

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
        console.log("len=", len);
        if(len >= 4)
            len = 4;
        return randomNumber(len);
    }

    reg = /int*/;
    if(reg.test(type)){
        var len = parseInt(type.substr(3)) * 2;
        if(isNaN(len))
            len = 4;
        console.log("len=", len);
        if(len >= 4)
            len = 4;
        return randomInteger(len);
    }

    reg = /byte*/;
    if(reg.test(type)){
        var len = parseInt(type.substr(4)) * 2;
        //console.log("len=", len);
        return randomString(len);
    }

    return '""';
}

console.log(testFunArgDefault("uint"));
console.log(testFunArgDefault("int"));
console.log(testFunArgDefault("address"));
console.log(testFunArgDefault("string"));
console.log(testFunArgDefault("byte32"));

function testFunArg(inputs) {
    var argstr = "";
    var first = true;

    //console.log("fun=", fun, ",argname=", argname);
    for(var i in inputs){
        var type = inputs[i].type;
        var str = testFunArgDefault(type);
        console.log("type=", type, ",str=", str);

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
        console.log("fun=", fun, ",fun.name=", fun.name);

        var execstr = "";
        if(fun.constant){
            execstr = "instance." + fun.name + ".call" + testFunArg(fun.inputs);
        }else{
            execstr = "instance." + fun.name + testFunArg(fun.inputs);
        }

        console.log("execstr=", execstr);
        return eval(execstr);
    }).then(function(result){
        callback(false, result);
    }).catch(function(err){
        console.log("Error:", err.message);
        callback(true, err.message);
    });
}

function testContract(con, count, callback) {
    var abi = utils.funs(con);
    //console.log("abi=", abi);

    var ret = [];

    for(var i = 0; i < count; i++){
        var number = GetRandomNum(0, abi.length);
        console.log("number=", number, ",abi.length=", abi.length);
        testContractFun(con, abi[number], function (err, result) {
            var val = {};
            val.err = err;
            val.result = result;

            ret.push(val);

            if(ret.length >= count){
                callback(ret);
            }
        });
    }
}

router.get('/', function(req, res, next) {
    res.send('test');
});

router.post('/contract', function(req, res, next) {
    var name = req.body.name;
    var count = req.body.count;

    var con = utils.contract(name);

    testContract(con, count, function (result) {
        res.send(result);
    });
});

router.post('/test', function(req, res, next) {
    var con = utils.contract("TestInt");
    var count = req.body.count;

    testContract(con, count, function (result) {
        res.send(result);
    });
});

module.exports = router;