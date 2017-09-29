var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var trans = require('./trans.js');
var logs = require('./logs.js');

function link(name) {
  return '<form action="contract_test/contract" method="get"> <input name="name" type="text"   id="name" value=' + name + ' readonly> <input type="submit" id="submitName" value=' + "开始测试" + ' /> </form>';
}

function transaction_input(inputs){
    //console.log("inputs=", inputs, ",end");
    var ret = "";
    for (var i in inputs){
        var name = inputs[i].name;
        var type = inputs[i].type;
        var text = '<td>' + name + "." + type + ":</td>";
        //console.log("i=", i, ",text=", text);
        ret +=  '<tr> '+ text + '<td> <input name="' + name + '" type="text"></td></tr>';
    }

    return ret;
}

function transaction_link(name, abi){
    var input = transaction_input(abi.inputs);
    var type =  abi.constant ? ".call" : ".transaction";
    var text = '<tr>  <input type="hidden" name=".contract" value="' + name + '" /> <input type="hidden" name=".function" value="' + utils.fun_name(abi) + '" /> <td> <label>  '+ name + "." + abi.name + type + '</label> </td> </tr>';

    return  '<form action="transaction" method="get">  <table border="0" cellspacing="5" cellpadding="5" style="border:1px #666666 solid;">' + text + input + '<tr> <td> <input type="submit" id="submitName" value=' + "开始测试" + ' />  </td> </tr> </table> </form>';
}

function contract_link(name, abi){
    var link = '';

    for (var i in abi){
        var fun = abi[i];
        if(fun.type != "function"){
            //console.log("type fun=", fun);
            continue;
        }
        link += transaction_link(name, fun);
    }

    //link += '</table>';
    //console.log("link=", link)
    return link;
}

function link_table(names) {
  var ret = "";

  for (var f in names){
      var name = names[f];
      //console.log("name=", name);

      ret += link(name);
  }

  //console.log(ret);
  return ret;
}

function root(args, res) {
    var names = utils.names();
    res.send(link_table(names));
}
/* GET home page. */
router.get('/', function(req, res, next) {
    root(req.query, res);
});

router.post('/', function(req, res, next) {
    root(req.body, res);
});

function transaction(args, res) {
    var conname = args[".contract"];
    var funname = args[".function"];

    var con = utils.contract(conname);
    var fun = utils.fun(con, funname);

    //logs.log("conname=", conname, ",funname=", funname, ",args=", args);
    trans.trans(con, fun, args, function (err, conname, fun, result) {
        var ret = {"err":err,"result":result};
        logs.log("err=", err, ",result=", result);
        res.send(ret);
    });
}

router.get('/transaction', function(req, res, next) {
    transaction(req.query, res);
});

router.post('/transaction', function(req, res, next) {
    transaction(req.body, res);
});

function contract(args, res) {
    var name = args.name;
    var abi = utils.abi(name);

    //logs.log("name=", name, ",req.body=", req.body);
    res.send(contract_link(name, abi));
}

router.get('/contract', function(req, res, next) {
    contract(req.query, res);
});

router.post('/contract', function(req, res, next) {
    contract(req.body, res);
});

module.exports = router;
