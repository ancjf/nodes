/**
 * Created by cjf on 2017/9/30.
 */

var logs = require('./logs.js');

var webs = {};

webs.button_list = function (args) {
    var ret = "";

    for (var text in args){
        var link = args[text];
        //logs.log("name=", name);

        ret += '<form action="' + link + '" method="get" > <input type="submit" name="name" style="font-size:20px;width:200px;" value="' + text + '" /> </form>';
    }

    return ret;
}

webs.from = function (text, link, inputs, conname, funname, type, value) {
    if(conname == undefined)
        conname = "";
    if(funname == undefined)
        funname = "";
    if(type == undefined)
        type = "text";
    if(value == undefined)
        value = "";

    var input = '<tr>  <input type="hidden" name=".contract" value="' + conname + '" /> <input type="hidden" name=".function" value="' + funname + '" /> <td> <label>  '+ text + '</label> </td> </tr>';

    for (var text in inputs){
        var name = inputs[text];

        input += '<tr> <td>' + text + ':</td>  <td> <input name="' + name + '" type="' + type + '" value="' + value + '" min="1" ></td></tr>';
    }

    return  '<form action="' + link + '" method="get">  <table border="0" cellspacing="5" cellpadding="5" style="border:1px #666666 solid;">' + input + '<tr> <td> <input type="submit" id="submitName" value=' + "开始测试" + ' />  </td> </tr> </table> </form>';
}

module.exports = webs;