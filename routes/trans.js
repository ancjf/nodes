/**
 * Created by cjf on 2017/9/27.
 */

var utils = require('./utils.js');
var args = require('./args.js');
var logs = require('./logs.js');

var trans = {"logs":{}};

function fun_arg(inputs, arg) {
    var argstr = "";
    var first = true;

    //logs.log("fun=", fun, ",argname=", argname);
    for(var i in inputs){
        var type = inputs[i].type;
        var name = inputs[i].name;
        var str;

        var value = arg[name];
        //logs.log("arg=", arg);
        //logs.log("type=", type, ",value=", value);
        if(value == undefined) {
            str = args.arg(type);
        }else{

            if(type === "bool"){
                str = value === "true" ? 'true' : 'false';
            }else{
                str = '"' + value + '"';
            }
        }

        //logs.log("type=", type, ",str=", str);

        if(first){
            argstr = str;
            first = false;
        }else{
            argstr = argstr + "," + str;
        }
    }

    if(argstr.length > 0)
        //return "(" + argstr + ", utils.transaction_option())";
        return "(" + argstr + ")";

    return "()";
}

function randid(){
    return new Date().getTime().toString();
}

trans.stat_init = function (req_count) {
    return {"id": randid(),
        "start": new Date().getTime(),
        "req_count": req_count,
        "count": 0,
        "err": 0,
        "nolog": 0,
        "succeed": 0,
        "gasUsed" : 0,
        "costTime" : 0,
        "contract": {}};
}

trans.stat = function (stat, arg) {
    stat.costTime = new Date().getTime() - stat.start;
    var funname = arg.fun.name;
    var conname = arg.con.contract_name;
    if(typeof stat.contract[conname] === "undefined"){
        stat.contract[conname] = {count:0, err:0, nolog:0, succeed:0, gasUsed : 0, function:{}};
    }

    if(typeof stat.contract[conname].function[funname] === "undefined"){
        //logs.log("conname=", conname, ",funname=", funname)
        if(arg.fun.constant)
            stat.contract[conname].function[funname] = {count: 0, err: 0, succeed: 0};
        else
            stat.contract[conname].function[funname] = {count: 0, err: 0, nolog:0, succeed: 0, gasUsed : 0};
    }

    stat.count++;
    stat.contract[conname].count++;
    stat.contract[conname].function[funname].count++;

    if(arg.err){
        stat.err++;
        stat.contract[conname].err++;
        stat.contract[conname].function[funname].err++;
        trans.logs[stat.id] = stat;
        //logs.log("stat=", logs.inspect(stat));
        return stat;
    }

    if(!arg.fun.constant && arg.result.logs.length == 0){
        stat.nolog++;
        stat.contract[conname].nolog++;
        stat.contract[conname].function[funname].nolog++;
        trans.logs[stat.id] = stat;
        //logs.log("stat=", logs.inspect(stat));
        return stat;
    }

    stat.succeed++;
    stat.contract[conname].succeed++;
    stat.contract[conname].function[funname].succeed++;

    if(!arg.fun.constant){
        var gasUsed = arg.result.receipt.gasUsed;
        if(gasUsed == undefined)
            gasUsed = 0;

        stat.gasUsed += gasUsed;
        stat.contract[conname].gasUsed += gasUsed;
        stat.contract[conname].function[funname].gasUsed += gasUsed;
        trans.logs[stat.id] = stat;
        //logs.log("stat=", logs.inspect(stat));
        return stat;
    }

    trans.logs[stat.id] = stat;
    //logs.log("stat=", logs.inspect(stat));
    return stat;
}

trans.log = function (id, remove) {
    var ret = trans.logs[id];

    if(remove == true || remove == 'true'){
        //logs.log("id=", id);
        delete trans.logs[id];
    }

    return ret;
}

trans.trans = function (con, fun, arg, callback) {
    con.deployed().then(function(instance) {
        var execstr = "";
        if(fun.constant == 'false' || fun.constant == false){
            execstr = "instance." + fun.name + fun_arg(fun.inputs, arg);
        }else{
            execstr = "instance." + fun.name + ".call" + fun_arg(fun.inputs, arg);
        }

        //logs.log("con.contract_name=", con.contract_name);
        //logs.log("con.contract_name=", con.contract_name, ",execstr=", execstr, ",fun=", fun);
        return eval(execstr);
    }).then(function(result){
        //logs.log("result=", result);
        arg = {"con": con,
            "fun": fun,
            "err": false,
            "result": result};

        callback(arg);
    }).catch(function(err){
        logs.log("test_contract_fun_Error:", typeof err.message, err.message);
        logs.log("test_contract_fun_Error:", err.stack);

        arg = {"con": con,
            "fun": fun,
            "err": true,
            "result": err.message};
        //process.exit();
        callback(arg);

    });
}

module.exports = trans;
