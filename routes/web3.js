/**
 * Created by cjf on 2017/12/19.
 */

var express = require('express');
var router = express.Router();
var utils = require('./utils.js');
var logs = require('./logs.js');
var Webs = require('./webs.js');
var assert = require('assert');
var Web3 = require('web3');

function trans_trans(args, res) {
    try{
        //var trans = JSON.parse(args.trans);
        var trans = args.trans;
        var rpc = args[".rpc"];
        var webs = new Webs(rpc);
        //logs.logvar(args);
        //logs.logvar(JSON.stringify(trans));
        webs.trans(trans, function (error, result) {
            var out = JSON.stringify(result);
            logs.logvar(error, out);
            res.send({"err":false, "result":result});
        });
    }catch(err){
        //logs.logvar(typeof(err.stack), err.stack);
        res.send({"err":true, "result":err.stack});
    }
};

function test(args, res) {
    try{
        var count = Number(args["count"]);
        var perCount = Number(args["perCount"]);
        var conname = args[".contract"];
        var fun = args[".function"];
        var address = args["address"];
        var rpc = args[".rpc"];

        var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        logs.logvar(conname);

        if(conname === undefined){
            var cons = utils.cons(rpc);
            id = webs.test(count, perCount, cons);
        }else if(fun === undefined){
            var cons = utils.cons(rpc);
            id = webs.test_con(count, perCount, cons[conname]);
        }else{
            id = webs.test_fun(count, perCount, fun, conname, address);
        }

        logs.logvar(id);
        res.send({"err":false, "result":id});
    }catch(err){
        //logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

function query_log(args, res) {
    var id = args.id;
    var rpc = args[".rpc"];

    var log = Webs.prototype.log(id);
    //logs.log("id=", id, "log=", log);
    res.send(log);
}

function query_cons(args, res, account) {
    //logs.logvar('start', cons);
    var cons = utils.cons(args[".rpc"], account, function (cons) {
        logs.logvar(cons);
        res.send(cons);
    });
}

function eth_get_block(web3, i, callback){
  web3.eth.getBlock(i, function (err, result) {
    callback(err, i, result)
  });
}

function query_blocks(args, res) {
    try{
        var web3 = new Web3(new Web3.providers.HttpProvider(args[".rpc"]));

        var num = 0;
        var arr = [];
        var start = parseInt(args["start"]);
        var end = start + parseInt(args["count"]);
      web3.eth.getBlockNumber(function (err, ret) {
        logs.logvar(ret, typeof(ret), end);
        if(err){
          res.send({error:err.stack,result:null});
          return;
        }
        if(end > ret)
          end = ret;
        if(start >= ret){
          res.send({error:null,result:arr});
          return;
        }

        for(i = start; i <= end; i++){
          eth_get_block(web3, i, function (err, number, result) {
            if(!err)
              arr[result.number-start] = result;

            num++;
            if(num > end - start){
              res.send({error:null,result:arr});
            }
          })
        }
      })
    }catch (err){
        res.send({error:err.stack,result:null});
    }
}

function query_trans(args, res) {
  try{
    var web3 = new Web3(new Web3.providers.HttpProvider(args[".rpc"]));

    var num = 0;
    var arr = {};
    var ts = args["trans"];
    if(typeof(ts) == 'string')
        ts = JSON.parse(ts);
    for(i = 0; i < ts.length; i++){
      web3.eth.getTransaction(ts[i], function (err, result) {
        if(result != null)
          arr[result.hash] = result;

        num++;
        if(num >= ts.length)
          res.send({error:null,result:arr});
      })
    }
  }catch (err){
    res.send({error:null,result:err.stack});
  }
}

function query(args, res, account) {
    try{
        logs.logvar(account);
        var type = args["type"];
        if(type == 'log'){
            return query_log(args, res);
        }else if(type == 'cons'){
            return query_cons(args, res, account);
        }else if(type == 'blocks'){
          return query_blocks(args, res, account);
        }else if(type == 'trans'){
          return query_trans(args, res, account);
        }
    }catch(err){
        //logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

function trans_call(args, res) {
    try{
        logs.logvar(args);
        Webs.prototype.call(args, function (error, result) {
            logs.logvar(args);
            res.send({"err":false, "result":result});
        });
    }catch(err){
        logs.logvar(err);
        res.send({"err":true, "result":err.stack});
    }
};

router.post('/call', function(req, res, next) {
    trans_call(req.body, res);
});

router.get('/call', function(req, res, next) {
    trans_call(req.query, res);
});

router.post('/trans', function(req, res, next) {
    trans_trans(req.body, res);
});

router.get('/trans', function(req, res, next) {
    trans_trans(req.query, res);
});

router.post('/test', function(req, res, next) {
    test(req.body, res);
});

router.get('/test', function(req, res, next) {
    test(req.query, res);
});

router.post('/query', function(req, res, next) {
    query(req.body, res, utils.get_account(req));
});

router.get('/query', function(req, res, next) {
    query(req.query, res, utils.get_account(req));
});

function test_1(args) {
    try{
        logs.logvar('*******************************************************************************');
        var count = Number(args["count"]);
        var perCount = Number(args["perCount"]);
        var conname = args[".contract"];
        var fun = args[".function"];
        var address = args["address"];
        var rpc = args[".rpc"];

        var webs = new Webs(rpc);
        logs.logvar(conname);

        if(conname === undefined){
            var cons = utils.cons(webs.web3.version.network);
            id = webs.test(count, perCount, cons);
        }else if(fun === undefined){
            var cons = utils.cons(webs.web3.version.network);
            id = webs.test_con(count, perCount, cons[conname]);
        }else{
            id = webs.test_con(count, perCount, fun, conname, address);
        }

        logs.logvar(id);
    }catch(err){
        logs.logvar(err.message);
        res.send({"err":true, "result":err});
    }
}

/*
//test_1({"count":5,"perCount":2});
var cons = utils.cons('http://192.168.153.128:8545/');
var con = cons['TestInt'];
var address = con.networks['5678'].address;
//test_1({".rpc":"http://192.168.153.128:8545","count":5,"perCount":2,"conname":"TestInt",".function":con.abi[1],"address":address});



function estimate(){
    var web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.8.15:8545/'));

    web3.eth.getGasPrice(function(error, result) {
        console.log("getGasPrice:error=", error, "result=", web3.toDecimal(result));
    });

    web3.eth.getTransactionCount("0x0000000000000000000000000000000000000110", "pending", function(error, result) {
        console.log("getTransactionCount:error=", error, "result=", result);
    });

    web3.eth.estimateGas({
        to: "0x0000000000000000000000000000000000000110",
        data: "0xf2fde38b0000000000000000000000000000000000000000000000000000000000000000"
    }, function(error, result) {
        console.log("error=", error, "result=", result);
    });

    web3.admin.addPeer("enode://37aeb7ff48a5b649647828fcd692c0d350d66d5e6b94a7fdd179f9e7ecb3942f066501058302bae3be7470c3903618346bd98a6e84caff506694915fe69c935a@127.0.0.1:30304", function(error, result) {
        console.log("error=", error, "result=", result);
    })
}

estimate();



var web3 = new webs.getWeb3('http://192.168.8.15:8545/');
Webs.prototype.fillTrans(web3, {
    from: "0x0c5b587Ca140De48d5eaDaF0e2ED051Fa31AF749",
    to: "0x0000000000000000000000000000000000000110",
    data: "0xf2fde38b0000000000000000000000000000000000000000000000000000000000000000"
}, function(error, result) {console.log("web3:error=", error, "result=", result);});


var web3 = Webs.prototype.getWeb3('http://192.168.8.15:8545/');
web3.extend.version(function(error, result) {console.log("error=", error, "result=", result);});


var web3 = new Web3();

var web3 = new webs.getWeb3('http://192.168.8.15:8545/');
web3.setProvider(new web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
console.log(web3.eth.getBalance("0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8").toString());


var arr = [
    "0x0c5b587ca140de48d5eadaf0e2ed051fa31af749",
    "1000000000000000000",
    {"ip":"192.168.8.15","port":"30304"},
    {s:1,e:18,c:[10000]}
];

var str = '';
arr.forEach(function(item,index){
    if(typeof (item) == 'object'){
        str = str + item + ',';
    }else{
        var itstr = JSON.stringify(item);
        if(itstr.indexOf('"') == 0)
            itstr = itstr.slice(1, -1);

        str = str + itstr +  ',';
    }
});

var utils = require('../node_modules/web3/lib/utils/utils');

function JsonToStr(json) {
    if(utils.isBigNumber(json)){
        logs.logvar(json);
        return utils.toHex(json);
    }else if(utils.isObject(json)){
        logs.logvar(json);
        var tmp = '';

        Object.keys(json).forEach(function(item,index){
            if(tmp.length > 0)
                tmp = tmp + ',' + item + ':'+ JsonToStr(json[item]);
            else
                tmp = item + ':'+ JsonToStr(json[item]);
        });

        return '{' + tmp + '}';
    }else if(utils.isArray(json)){
        var tmp = '';
        json.forEach(function(item,index){
            if(tmp.length > 0)
                tmp =  tmp + ',' + JsonToStr(item);
            else
                tmp = JsonToStr(item);
        });

        return '[' + tmp + ']';
    }else{
        logs.logvar(json);
        var itstr = JSON.stringify(json);
        if(itstr.indexOf('"') == 0)
            itstr = itstr.slice(1, -1);

        return itstr;
    }
}


logs.logvar(JsonToStr(arr));
logs.logvar(str.slice(0, -1));
console.log('JSON.stringify(arr).slice(1, -1)=', JSON.stringify(arr).slice(1, -1));
 */

module.exports = router;
