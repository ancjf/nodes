/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var truffle = require('../solidity/truffle.js');

var contract = require("truffle-contract");
var Web3 = require('web3');
/*
var httpProvider = "http://" + truffle.networks.development.host + ":" +  truffle.networks.development.port;
logs.log(httpProvider);
var web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));



var provider = new Web3.providers.HttpProvider(httpProvider);


var defaultAccount = web3.eth.defaultAccount;
if(defaultAccount === undefined){
    defaultAccount = web3.eth.accounts[0];
}
logs.log(defaultAccount);
*/
var fs = require('fs');
var files = fs.readdirSync('./solidity/build/contracts/');
//logs.log(files);

var utils = {};
utils.jsons = {};
utils.connames = {};

/*
utils.accounts = web3.eth.accounts;
logs.log("utils.accounts=", utils.accounts);
*/


for (var f in files){
    var file = '../solidity/build/contracts/' + files[f];
    var name = files[f];
    if(name.lastIndexOf(".") >= 0)
        name = name.substring(0, name.lastIndexOf("."));
    /*
    var workid = web3.version.network;
     */
    var json = require(file);
    utils.jsons[name] = json;
    //logs.log("name=", name);
    logs.logvar(name);
    /*
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
    */
}
//logs.log("utils.jsons=", utils.jsons);
utils.json = function(name){
    //logs.logvar(name);
    return utils.jsons[name];
}

utils.abi = function(name){
    return utils.json(name).abi;
}

utils.contract = function(name, rpc){
    var provider = new Web3.providers.HttpProvider(rpc);
    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));

    var defaultAccount = web3.eth.defaultAccount;
    //logs.logvar(name, rpc, defaultAccount);
    if(defaultAccount === undefined){
        var rand = utils.get_random_num(0, web3.eth.accounts.length);
        defaultAccount = web3.eth.accounts[rand];
        logs.logvar(rpc, defaultAccount);
    }

    var cont = contract(utils.json(name));
    cont.setProvider(provider);
    cont.defaults({
        from : defaultAccount,
        //"gas" : 30000,
        //"gasPrice" : 0xfffff,
    });

    return cont;
}

utils.names = function(rpc){
    if(utils.connames[rpc] != undefined)
        return utils.connames[rpc];

    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    var ret = new Array();

    logs.logvar(rpc);
    for (var f in utils.jsons){
        var network = utils.jsons[f].networks[web3.version.network];

        //logs.log("typeof json.networks", typeof json.networks,  "network=", network);
        if(network !== undefined){
            var address = network["address"];
            if(address !== undefined) {
                logs.logvar(f);
                ret.push(f);
            }
        }
    }

    utils.connames[rpc] = ret;
    return ret;
}

function fun_match(fun, funname) {
    if(fun.type != "function"){
        return false;
    }

    var arr = funname.split(".");

    if(arr.length != fun.inputs.length + 1){
        //logs.logvar(funname, arr, fun);
        return false;
    }

    if(arr[0] !=  fun.name){
        //logs.logvar(funname, arr, fun);
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

utils.funs = function(con, rpc){
    if(typeof(con) == "string")
        con = utils.contract(con, rpc);

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

    //logs.logvar(acc);
    return {from: acc};
}

module.exports = utils;