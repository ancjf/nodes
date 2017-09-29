/**
 * Created by cjf on 2017/9/29.
 */

var util = require('util');
var logs = {};

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