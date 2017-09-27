/**
 * Created by cjf on 2017/9/27.
 */

var utils = require('./utils.js');

var args = {};


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

args.arg = function (type) {
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

module.exports = args;