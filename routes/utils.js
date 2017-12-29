/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var truffle = require('../solidity/truffle.js');

var contract = require("truffle-contract");
var Web3 = require('web3');

const keccak256 = require('js-sha3').keccak_256;

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
const json_path = './jsons/';

//logs.log(files);

var utils = {};
utils.jsons = {};
utils.connames = {};

/*
utils.accounts = web3.eth.accounts;
logs.log("utils.accounts=", utils.accounts);
*/

logs.logvar('name', /*files, */typeof(files), typeof('name'));

//logs.log("utils.jsons=", utils.jsons);
function cname(str) {
    if(str.lastIndexOf(".") >= 0)
        str = str.substring(0, str.lastIndexOf("."));

    return str;
}

utils.path = function(){
    return json_path;
}

utils.files = function(){
    return fs.readdirSync(json_path);
}

utils.load = function(){
    var files = utils.files();
    //logs.logvar(files);

    for (var f in files){
        var file = json_path + files[f];
        var name = cname(files[f]);
        /*
         var workid = web3.version.network;
         */
        //var json = require(file);
        var json = JSON.parse(fs.readFileSync(file, "utf-8"));
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
}

utils.delete = function(name){
    var conname = cname(name);
    if(utils.jsons[conname] != undefined)
        delete utils.jsons[conname];

    utils.connames = {};
    return fs.unlinkSync(json_path + name);
}

utils.add = function(file, name){
    var conname = cname(name);
    name = json_path + name;

    if(fs.existsSync(name)){
        logs.logvar("exists:", file);
        fs.unlinkSync(file);
        return false;
    }

    if(!fs.renameSync(file, name)){
        logs.logvar("rename:", file, name);
        return false;
    }

    logs.logvar(conname, name);
    var json = JSON.parse(fs.readFileSync(name, "utf-8"));
    utils.jsons[conname] = json;

    utils.connames = {};
    return true;
}

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
        //logs.logvar(rpc, defaultAccount);
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
        //logs.logvar(f);
        var network = utils.jsons[f].networks[web3.version.network];

        //logs.logvar(network);
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

function getKeys(params, key, allowEmpty) {
    var result = []; // eslint-disable-line

    if (!Array.isArray(params)) { throw new Error(`[ethjs-abi] while getting keys, invalid params value ${JSON.stringify(params)}`); }

    for (var i = 0; i < params.length; i++) { // eslint-disable-line
        var value = params[i][key];  // eslint-disable-line
        if (allowEmpty && !value) {
            value = '';
        } else if (typeof(value) !== 'string') {
            throw new Error('[ethjs-abi] while getKeys found invalid ABI data structure, type value not string');
        }
        result.push(value);
    }

    return result;
}

utils.funs = function(con, rpc){
    if(typeof(con) == "string")
        con = utils.contract(con, rpc);

    var ret = [];

    //logs.logvar(con.abi);
    for (var f in con.abi){
        if(con.abi[f].type == "function"){
            const method = con.abi[f];
            const signature = `${method.name}(${getKeys(method.inputs, 'type').join(',')})`;
            const signatureEncoded = `0x${(new Buffer(keccak256(signature), 'hex')).slice(0, 4).toString('hex')}`;

            con.abi[f].sign = signatureEncoded;
            ret.push(con.abi[f]);
            logs.logvar(signatureEncoded);
        }

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

utils.load();

module.exports = utils;