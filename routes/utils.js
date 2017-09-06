/**
 * Created by cjf on 2017/8/30.
 */

var truffle = require('../solidity/truffle.js');
var httpProvider = "http://" + truffle.networks.development.host + ":" +  truffle.networks.development.port;
console.log(httpProvider);

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));

var contract = require("truffle-contract");

var provider = new Web3.providers.HttpProvider(httpProvider);

var defaultAccount = web3.eth.defaultAccount;
if(defaultAccount === undefined){
    defaultAccount = web3.eth.accounts[0];
}
console.log(defaultAccount);

var fs = require('fs');
var files = fs.readdirSync('./solidity/build/contracts/');
console.log(files);

var utils = {};
utils.jsons = {};
for (var f in files){
    var file = '../solidity/build/contracts/' + files[f];
    var name = files[f].split(".")[0];

    var json = require(file);
    //console.log("name=", name, ",file=", file, ",json=", json);
    utils.jsons[name] = json;
}
//console.log("utils.jsons=", utils.jsons);
utils.json = function(name){
    console.log("name=", name);
    return utils.jsons[name];
}

utils.abi = function(name){
    return utils.json(name).abi;
}

utils.contract = function(name){
    console.log("name=", name);

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

utils.funs = function(con){
    var ret = [];

    for (var f in con.abi){
        if(con.abi[f].type == "function")
            ret.push(con.abi[f]);
    }

    return ret;
}

module.exports = utils;