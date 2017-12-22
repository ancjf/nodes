var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var trans = require('./trans.js');
var logs = require('./logs.js');
var webs = require('./webs.js');

function abi2inputs(abi){
    var ret = {};
    for (var i in abi.inputs){
        var name = abi.inputs[i].name;
        var type = abi.inputs[i].type;
        var text = name + "." + type;

        ret[text] = name;
    }

    return ret;
}

function transaction_link(conname, abi){
    var text = conname + "." + abi.name;

    return webs.from(text, "/contract_test/transaction", abi2inputs(abi), conname, utils.fun_name(abi));
}

function root(args, res) {
    var names = utils.names();
    var args = {};

    for (var f in names){
        var name = names[f];
        args[name] = "/contract_test/contract";
    }

    res.send(webs.button_list(args));
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

    var con = utils.contract(conname);
    var fun = args[".function"];
    //var arr = funname.split('.');


    //var fun = utils.fun(con, arr[1]);


    logs.log("conname=", conname, ",fun=", fun);
    if(con.contract_name == undefined){
        logs.log("conname=", conname);
        res.send("{}");
        return;
    }

    if(fun.name == undefined){
        logs.log("conname=", conname);
        res.send("{}");
        return;
    }

    logs.log("args=", args);
    trans.trans(con, fun, args, function (result) {
        res.send(result.result);
    });
}

router.get('/transaction', function(req, res, next) {
    transaction(req.query, res);
});

router.post('/transaction', function(req, res, next) {
    transaction(req.body, res);
});

function contract(args, res) {
    var abi = utils.funs(args.name);

    logs.log("abi=", abi);
    res.send(abi);
    /*
    var link = '';

    for (var i in abi){
        var fun = abi[i];
        if(fun.type != "function"){
            //console.log("type fun=", fun);
            continue;
        }
        link += transaction_link(name, fun);
    }

    //logs.log("name=", name, ",req.body=", req.body);
    res.send(link);.
    */
}

router.get('/contract', function(req, res, next) {
    contract(req.query, res);
});

router.post('/contract', function(req, res, next) {
    contract(req.body, res);
});

module.exports = router;
