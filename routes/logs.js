/**
 * Created by cjf on 2017/9/29.
 */

var readline = require('readline');
var fs = require("fs");
var util = require('util');
var logs = {args:{}};

function skipLine(str, n){
    var index = 0;

    //console.log("n=", n, "str=", str);
    for(var i = 0; i+1 < n; i++){
        if(i)
            index = str.indexOf('\n', index+1);
        else
            index = str.indexOf('\n');
        //console.log("i=", i, "index=", index);
        if(-1 == index)
            return -1;
    }

    //console.log("end:index=", index);
    return index > 0 ? index+1 : index;
}

function argsLine(str, n){
    var anno = false;
    var index = 0;
    var resutle = [];
    var ret = '';
    //console.log("n=", n, "str=", str);
    for(var i = n; i < str.length; i++) {
        if (str[i] == '(') {
            if (anno) {
                continue;
            }

            if(index > 0)
                ret += str[i];
            index++;
        }else if(str[i] == ')'){
            if(anno){
                continue;
            }

            index--;
            if(0 == index){
                resutle.push(ret.trim());
                //console.log("end:resutle=", resutle);
                return resutle;
            }

            ret += str[i];
        }else if(str[i] == '/' &&  str[i+1] == '*'){
            anno = true;
            i++;
        }else if(str[i] == '*' &&  str[i+1] == '/') {
            anno = false;
            i++;
        }else if(str[i] == ',') {
            //console.log("end:index=", index, "resutle=", resutle, "ret=", ret);
            if(index == 1 && !anno){
                resutle.push(ret.trim());
                ret = '';
            }else if(!anno){
                ret += str[i];
            }
        }else{
            if(index > 0 && !anno)
                ret += str[i];
        }
    }

    resutle.push(ret.trim());
    //console.log("end:resutle=", resutle);
    return ret;
}

function isString(str){
    if(typeof (str) !== "string" || str.length < 2)
        return false;

    if(str[0] == '"' && str[str.length-1] == '"')
        return true;

    if(str[0] == "'" && str[str.length-1] == "'")
        return true;

    return false;
}

logs.logvar = function (msg) {
    var info = stackInfo();
    var method = info['method'];
    var file = info['file'];
    var pos = info['pos'];
    var line = info['line'];
    var nread = 0;
    var point = file + "\\" +  line + "\\" + pos;

    var args = logs.args[point];
    if(args == undefined) {
        var data = fs.readFileSync(info.path, "utf-8");
        var index = skipLine(data, Number(line));
        args = argsLine(data, index + Number(pos) - 1);
        //console.log("args=", args);
        //args = args.split(",");
        for (var i in args) {
            args[i] = args[i].trim();
        }

        logs.args[point] = args;
    }

    //console.log("args=", args);
    var execstr = '"(" + method + ") <" + file + ":" + line + "> "';
    //var execstr = '"<" + file + ":" + line + "> "';

    for(var i = 0;i < arguments.length; i++) {
        if(isString(args[i])){
            execstr = execstr + "," + util.format("arguments[%d]", i);
        }else{
            execstr = execstr + ',"' + args[i] + '=",' + util.format("arguments[%d]", i);
        }

        if(i + 1 < arguments.length)
            execstr = execstr + ',","';
    }

    execstr = "console.log(" + execstr + ")";
    //console.log("execstr=", execstr);
    eval(execstr);
}

logs.log = function (msg) {
    var info = stackInfo();
    var method = info['method'];
    var file = info['file'];
    var line = info['line'];

    var execstr = '"(" + method + ") <" + file + ":" + line + "> "';
    //var execstr = '"<" + file + ":" + line + "> "';

    for(var i = 0;i < arguments.length; i++) {
        execstr = execstr + "," + util.format("arguments[%d]", i);
    }

    execstr = "console.log(" + execstr + ")";
    //console.log("execstr=", execstr);
    eval(execstr);
    //console.log("(" + method + ") <" + file + ":" + line + "> ", arguments[0]);
}

// 这里是主要方法
function stackInfo() {
    var path = require('path');
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
    var stacklist = (new Error()).stack.split('\n').slice(3);
    var s = stacklist[0];
    var sp = stackReg.exec(s) || stackReg2.exec(s);
    var data = {};
    if (sp && sp.length === 5) {
        data.method = sp[1];
        data.path = sp[2];
        data.line = sp[3];
        data.pos = sp[4];
        data.file = path.basename(data.path);
    }
    
    return data;
}

logs.inspect = function (arg) {
    return JSON.stringify(arg);
}

module.exports = logs;