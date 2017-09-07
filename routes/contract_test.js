var express = require('express');
var router = express.Router();
var utils = require('./utils.js');

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
    var text = '<tr>  <input type="hidden" name=".contract" value="' + name + '" /> <input type="hidden" name=".function" value="' + abi.name + '" /> <td> <label>  '+ name + "." + abi.name + type + '</label> </td> </tr>';

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

/* GET home page. */
router.get('/', function(req, res, next) {
  var names = utils.names();
  res.send(link_table(names));
});

router.get('/contract', function(req, res, next) {
    var name = req.query.name;
    var abi = utils.abi(name);
    //console.log(",abi=", abi);

    res.send(contract_link(name, abi));
    //console.log("name=", name, ",req.query=", req.query);
});

function transaction_line(fun, argname, arg){
    var argstr = "";
    var first = true;

    //console.log("fun=", fun, ",argname=", argname);
    for(var i in fun.inputs){
        var name = fun.inputs[i].name;

        var str = argname + '["' + name + '"]';
        if(fun.inputs[i].type === "bool"){
            str = arg[name] === "true" ? 'true' : 'false';
        }

        console.log("name=", name, ",arg[name]=", arg[name], ",str=", str);
        if(first){
            argstr = str;
            first = false;
        }else{
            argstr = argstr + "," + str;
        }
    }

    return "(" + argstr + ")";
}


function transaction(con, funname, arg, res) {
    //console.log("transaction ********************** con=", con);

    con.deployed().then(function(instance) {
        var abi = instance.abi;
        var address = instance.address;
        //console.log("address=", address);

        for(var i in abi){
            var fun = abi[i];
            if(fun.type != "function" || fun.name != funname){
                continue;
            }

            //console.log("execstr=", execstr);
            var execstr = "";
            if(fun.constant){
                execstr = "instance." + fun.name + ".call" + transaction_line(fun, "arg", arg);
            }else{
                execstr = "instance." + fun.name + transaction_line(fun, "arg", arg);
            }

            //console.log("execstr=", execstr);
            return eval(execstr);
        }

        throw new Error('No function match:' + JSON.stringify(arg));
    }).then(function(result){
        //console.log(result);
        res.send(result);
    }).catch(function(err){
        console.log("Error:", err.message);
        res.send(err.message);
    });
}

router.get('/transaction', function(req, res, next) {
    var query = req.query;
    var con = query[".contract"];
    var fun = query[".function"];

    //console.log("con=", con, ",fun=", fun, ",query=", query);
    transaction(utils.contract(con), fun, query, res);
});

function contract(args, res) {
    var name = args.name;
    //console.log("name=", name, ",req.body=", req.body);
    res.send(name);
}

router.post('/contract', function(req, res, next) {
    var name = req.body.name;
    //console.log("name=", name, ",req.body=", req.body);
    res.send(name);
});

module.exports = router;
