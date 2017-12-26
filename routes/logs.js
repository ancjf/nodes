/**
 * Created by cjf on 2017/9/29.
 */

var readline = require('readline');
var fs = require("fs");
var util = require('util');
var logs = {args:{}};

function getArgs(func) {
    // 首先匹配函数括弧里的参数
    var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

    // 分解参数成数组
    return args.split(",").map(function(arg) {
        // 去空格和内联注释
        return arg.replace(/\/\*.*\*\//, "").trim();
    }).filter(function(arg) {
        // 确保没有undefineds
        return arg;
    });
}

function skipLine(str, n){
    var index = str.indexOf('\n');
    if(-1 == index)
        return -1;

    console.log("n=", n, "str=", str);
    for(var i = 0; i < n; i++){
        index = str.indexOf('\n', index+1);
        console.log("index=", index);
        if(-1 == index)
            return -1;
    }

    return index;
}

function readLineArg(file, line, pos, argin, callback){
    var nread = 0;
    var data = '';

    var point = file + "\\" +  line + "\\" + pos;
    if(logs.args[point] != undefined){
        callback(args, argin);
        return;
    }

    line =    Number(line);
    pos =    Number(pos);
    //console.log("file=", file);
    const rl = readline.createInterface({
        input: fs.createReadStream(file)
    });

    rl.on('line', function(text){
            ++nread;
            if(nread >= line)
                data = data + text;
            //console.log('Line from file: text=', text);
    });

    rl.on('close', function(text){
        data = data.substring(data.indexOf('(', pos-1));
        var args = data.match(/\(([^)]*)\)/)[1];


        //console.log("读取完毕！data=", data);
        //console.log("args=", args);

        args = args.split(",");
        for (var i in args) {
            args[i] = args[i].replace(/\/\*.*\*\//, "").trim();
        }

        //console.log("args=", args);
        logs.args[point] = args;
        callback(args, argin);
    });
}

logs.logvar = function (msg) {
    var info = stackInfo();
    var method = info['method'];
    var file = info['file'];
    var pos = info['pos'];
    var line = info['line'];
    var nread = 0;
    var data = '';

    //var execstr = '"(" + method + ") <" + file + ":" + line + "> "';
    var execstr = '"<" + file + ":" + line + "> "';

    //console.log("arguments=", arguments);
    readLineArg(info.path, Number(info.line), Number(info.pos), arguments, function readLineArg(args, argin){
        //console.log("argin=", argin);
        for(var i = 0;i < argin.length; i++) {
            execstr = execstr + ',"' + args[i] + '=",' + util.format("argin[%d]", i);
            if(i + 1 < argin.length)
                execstr = execstr + ',","';
        }

        execstr = "console.log(" + execstr + ")";
        //console.log("execstr=", execstr);
        eval(execstr);
    });
}

logs.log = function (msg) {
    var info = stackInfo();
    //var method = info['method'];
    var file = info['file'];
    var line = info['line'];

    //var execstr = '"(" + method + ") <" + file + ":" + line + "> "';
    var execstr = '"<" + file + ":" + line + "> "';

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