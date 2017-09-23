/**
 * Created by cjf on 2017/9/6.
 */
var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

function random_string(len) {
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return '"'+ pwd + '"';
}

function random_x_string(len) {
    var $chars = '0123456789abcdef';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function random_address() {
    return '0x'+ random_x_string(40) + '';
}

function random_number(len){
    return '0x'+ random_x_string(len) + '';
}

function random_integer(len){
    if(0 == len)
        return '0x0';

    var $chars = '01234567';
    var firstChr = $chars.charAt(Math.floor(Math.random() * $chars.length));

    if(Math.floor(Math.random()*2) == 0){
        return '-0x'+  firstChr + random_x_string(len-1) + '';
    }

    return '0x'+  firstChr + random_x_string(len-1) + '';
}

function test_fun_arg_default(type) {
    if(type === "bool"){
        return Math.floor(Math.random()*2) == 0 ? "false" : "true";
    }

    if(type === "string" || type === "bytes"){
        return random_string(utils.get_random_num(1,256));
    }

    if(type === "address"){
        return random_address();
    }

    var reg = /uint*/;
    if(reg.test(type)){
        var len = parseInt(type.substr(4)/8) * 2;
        if(isNaN(len))
            len = 4;
        //console.log("uint:len=", len);
        //if(len >= 4)
            //len = 4;
        return random_number(len);
    }

    reg = /int*/;
    if(reg.test(type)){
        var len = (parseInt(type.substr(3))/8) * 2;
        if(isNaN(len))
            len = 4;
        //console.log("int:len=", len);
        //if(len >= 4)
            //len = 4;
            //len = 4;
        return random_integer(len);
    }

    reg = /byte*/;
    if(reg.test(type)){
        var len = (parseInt(type.substr(4))/8) * 2;
        //console.log("len=", len);
        return random_string(len);
    }

    return '""';
}
/*
console.log(test_fun_arg_default("uint"));
console.log(test_fun_arg_default("int"));
console.log(test_fun_arg_default("address"));
console.log(test_fun_arg_default("string"));
console.log(test_fun_arg_default("byte32"));
*/

function test_fun_arg(inputs) {
    var argstr = "";
    var first = true;

    //console.log("fun=", fun, ",argname=", argname);
    for(var i in inputs){
        var type = inputs[i].type;
        var str = test_fun_arg_default(type);
        //console.log("type=", type, ",str=", str);

        if(first){
            argstr = str;
            first = false;
        }else{
            argstr = argstr + "," + str;
        }
    }

    if(argstr.length > 0)
        return "(" + argstr + ", utils.transaction_option())";

    return "(utils.transaction_option())";
}

function test_contract_fun(con, fun, callback) {
    con.deployed().then(function(instance) {
        var execstr = "";
        if(fun.constant){
            execstr = "instance." + fun.name + ".call" + test_fun_arg(fun.inputs);
        }else{
            execstr = "instance." + fun.name + test_fun_arg(fun.inputs);
        }

        //console.log("execstr=", execstr);
        return eval(execstr);
    }).then(function(result){
        callback(false, fun, result);
    }).catch(function(err){
        console.log("test_contract_fun_Error:", typeof err.message, err.message);
        callback(true, fun, err.message);
    });
}

function pressure_test_contract(con, count, callback) {
    var abi = utils.funs(con);
    //console.log("abi=", abi);

    var ret = [];

    for(var i = 0; i < count; i++){
        var number = utils.get_random_num(0, abi.length);
        //console.log("number=", number, ",abi.length=", abi.length);
        //console.log("test_contract_begin:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i);

        test_contract_fun(con, abi[number], function (err, fun, result) {
            //console.log("test_contract:number=", number, ",abi.length=", abi.length, ",count=", count, ",i=", i, ",funname=", funname);

            var val = {};
            val.err = err;
            val.result = result;
            val.fun = fun;

            ret.push(val);

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
        var end = new Date().getTime();
        ret.costTime = end - begin;
        console.log("ret.costTime=", ret.costTime);
        console.log("ret=", ret);
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