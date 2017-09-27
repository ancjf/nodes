/**
 * Created by cjf on 2017/9/27.
 */

var utils = require('./utils.js');
var args = require('./args.js');

var trans = {};

function fun_arg(inputs, arg) {
    var argstr = "";
    var first = true;

    //console.log("fun=", fun, ",argname=", argname);
    for(var i in inputs){
        var type = inputs[i].type;
        var name = inputs[i].name;
        var str;

        var value = arg[name];
        //console.log("arg=", arg);
        //console.log("type=", type, ",value=", value);
        if(value == undefined) {
            str = args.arg(type);
        }else{

            if(type === "bool"){
                str = value === "true" ? 'true' : 'false';
            }else{
                str = '"' + value + '"';
            }
        }

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

trans.trans = function (con, fun, arg, callback) {
    con.deployed().then(function(instance) {
        var execstr = "";
        if(fun.constant){
            execstr = "instance." + fun.name + ".call" + fun_arg(fun.inputs, arg);
        }else{
            execstr = "instance." + fun.name + fun_arg(fun.inputs, arg);
        }

        //console.log("execstr=", execstr);
        return eval(execstr);
    }).then(function(result){
        //console.log("result=", result);
        callback(false, fun, result);
    }).catch(function(err){
        console.log("test_contract_fun_Error:", typeof err.message, err.message);
        console.log("test_contract_fun_Error:", err.stack);
        //process.exit();
        callback(true, fun, err.message);

    });
}

module.exports = trans;
