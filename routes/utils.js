/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var Web3 = require('web3');
var Webs = require('./webs.js');
var fs = require('fs');

const json_path = './jsons/';

var utils = {};
utils.jsons = {};
utils.connames = {};

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
    if(typeof(utils.jsons[conname]) != 'undefined')
        delete utils.jsons[conname];

    utils.connames = {};
    return fs.unlinkSync(utils.path() + name);
}

utils.add = function(file, name){
    var conname = cname(name);
    name = json_path + name;

    if(fs.existsSync(name)){
        logs.logvar("exists:", file);
        fs.unlinkSync(file);
        return false;
    }

    fs.renameSync(file, name);

    logs.logvar(conname, name);
    var json = JSON.parse(fs.readFileSync(name, "utf-8"));
    utils.jsons[conname] = json;

    utils.connames = {};
    return true;
}

utils.network = function(rpc){
    //logs.logvar(rpc);
    if(rpc.substring(0, 7) != 'http://' && rpc.substring(0, 8) != 'https://')
        return rpc;

    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    //logs.logvar(web3.version.network);
    return web3.version.network;
}

utils.names = function(rpc){
    if(utils.connames[rpc] != undefined)
        return utils.connames[rpc];

    var network = utils.network(rpc);
    var ret = new Array();

    logs.logvar(network);
    for (var f in utils.jsons){
        //logs.logvar(f);
        var network = utils.jsons[f].networks[network];

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

utils.cons = function(rpc){
    var network = utils.network(rpc);
    var ret = {};

    logs.logvar(network);
    for (var f in utils.jsons){
        //logs.logvar(f);
        var net = utils.jsons[f].networks[network];

        //logs.logvar(network);
        if(net == undefined){
            logs.logvar(net);
            continue;
        }

        ret[f] = {};
        //ret[f].networks = utils.jsons[f].networks;
        ret[f].address = utils.jsons[f].networks[network].address;
        ret[f].events = utils.jsons[f].networks[network].events;
        //logs.logvar(ret[f].events);
        ret[f].contract_name = utils.jsons[f].contract_name || utils.jsons[f].contractName;
        ret[f].abi = utils.jsons[f].abi.filter(function(item){
            return item.type=='function';
        });
    }

    return ret;
}

utils.load();

module.exports = utils;