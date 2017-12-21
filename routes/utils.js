/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var truffle = require('../solidity/truffle.js');
var httpProvider = "http://" + truffle.networks.development.host + ":" +  truffle.networks.development.port;
logs.log(httpProvider);

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));

var contract = require("truffle-contract");

var provider = new Web3.providers.HttpProvider(httpProvider);


var defaultAccount = web3.eth.defaultAccount;
if(defaultAccount === undefined){
    defaultAccount = web3.eth.accounts[0];
}
logs.log(defaultAccount);

var fs = require('fs');
var files = fs.readdirSync('./solidity/build/contracts/');
//logs.log(files);

var utils = {};
utils.jsons = {};
utils.accounts = web3.eth.accounts;
logs.log("utils.accounts=", utils.accounts);

for (var f in files){
    var file = '../solidity/build/contracts/' + files[f];
    var name = files[f].split(".")[0];
    var workid = web3.version.network;

    var json = require(file);
    var network = json.networks[web3.version.network];
    //logs.log("typeof json.networks", typeof json.networks,  "network=", network);
    if(network !== undefined){
        var address = network["address"];

        if(address !== undefined) {
            logs.log("name=", name);
            //if(json.networks)

            utils.jsons[name] = json;
        }
    }
}
//logs.log("utils.jsons=", utils.jsons);
utils.json = function(name){
    //logs.log("name=", name);
    return utils.jsons[name];
}

utils.abi = function(name){
    return utils.json(name).abi;
}

utils.contract = function(name){
    //logs.log("name=", name);

    var cont = contract(utils.json(name));
    cont.setProvider(provider);
    cont.defaults({
        from : defaultAccount,
        //"gas" : 30000,
        //"gasPrice" : 0xfffff,
    });

    return cont;
}

utils.names = function(){
    var ret = new Array();
    for (var f in utils.jsons){
        ret.push(f);
    }

    return ret;
}

function fun_match(fun, funname) {
    if(fun.type != "function"){
        return false;
    }

    var arr = funname.split(".");

    if(arr.length != fun.inputs.length + 1){
        //logs.log("length ::funname=", funname, ",arr=", arr, ",fun=", fun);
        return false;
    }

    if(arr[0] !=  fun.name){
        //logs.log("name ::funname=", funname, ",arr=", arr, ",fun=", fun);
        return false;
    }

    for(var i = 0; i < fun.inputs.length; i++) {
        //for (var i in fun.inputs) {
        if(arr[i+1] != fun.inputs[i].type){
            //logs.log("name ::funname=", funname, ",i+1=", i+1, ",arr[i+1]=",arr[i+1], ",fun.inputs[i].type=", fun.inputs[i].type, ",arr=", arr, ",fun=", fun);
            return false;
        }

    }

    return true;
}

utils.fun = function(con, name){
    //logs.log("con.abi=", con.abi);
    for (var f in con.abi){
        if(fun_match(con.abi[f], name))
            return con.abi[f];
    }

    return {};
}

utils.funs = function(con){
    var ret = [];

    //logs.log("con.abi=", con.abi);
    for (var f in con.abi){
        if(con.abi[f].type == "function")
            ret.push(con.abi[f]);
    }

    return ret;
}

utils.fun_name = function (fun) {
    var str = fun.name;
    for (var i in fun.inputs) {
        str = str + '.' + fun.inputs[i].type;
    }

    return str;
}

utils.con_fun_name = function (conname, funname, constant) {
    var abi = utils.abi(conname);

    for (var i in abi){
        var fun = abi[i];
        if(fun.type != "function" || fun.constant != constant){
            //logs.log("type fun=", fun);
            continue;
        }

        return utils.fun_name(abi[i]);
    }
}

utils.get_random_num = function get_random_num(Min, Max) // [Min, Max)
{
    var Range = Max - Min;
    var Rand = Math.floor(Math.random() * Range);
    return Min + Rand;
}

utils.transaction_option = function(){
    var rand = utils.get_random_num(0, this.accounts.length);
    var acc =  this.accounts[rand];
    //var acc =  "0x1d5b6469569035d526b6c58ab9c1aede9a3ca9e6";

    //logs.log("acc=", acc);
    return {from: acc};
}

module.exports = utils;