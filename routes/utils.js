/**
 * Created by cjf on 2017/8/30.
 */
const logs = require('@ancjf/logs');
var Web3 = require('web3');
var Webs = require('./webs.js');
var fs = require('fs');

const json_path = './jsons/';

var utils = {};
utils.jsons = new Map();

logs.log('name', /*files, */typeof(files), typeof('name'));

//logs.log("utils.jsons=", utils.jsons);
function cname(str) {
    if(str.lastIndexOf(".") >= 0)
        str = str.substring(0, str.lastIndexOf("."));

    return str;
}

utils.path = function(){
    return json_path;
}

utils.filepath = function(account, name){
    return account + '/' + name;
}

utils.files = function(account){
    var path = json_path + (account ? account + '/' : '');
    return fs.readdirSync(path).filter(function (key) {
        logs.log(path + key);
        var stat = fs.lstatSync(path + key);
        return !stat.isDirectory();
    });
}

utils.load = function(account){
    try{
        var files = utils.files(account);
        var jsons = {};
        for (var f in files){
            var file = json_path + account + '/' + files[f];
            var name = cname(files[f]);

            /*
             var stat = fs.lstatSync(file);
             if(stat.isDirectory())
             continue;
             */
            /*
             var workid = web3.version.network;
             */
            //var json = require(file);
            var json = JSON.parse(fs.readFileSync(file, "utf-8"));
            jsons[name] = json;
            //logs.log("name=", name);
            logs.log(name);
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

        //utils.jsons[account] = jsons;
        return jsons;
    }catch(err){
        logs.log(err.message);
        return {};
    }
}

utils.delete = function(account, name){
    return fs.unlinkSync(utils.path() + utils.filepath(account, name));
}

utils.add = function(file, account, name){
    name = json_path + utils.filepath(account, name);

    if(fs.existsSync(name)){
        logs.log("exists:", file);
        fs.unlinkSync(file);
        return false;
    }

    if(!fs.existsSync(json_path + '/' + account)){
        fs.mkdirSync(json_path + '/' + account);
    }

    fs.renameSync(file, name);
    return true;
}

utils.network = function(rpc, callback){
    //logs.log(rpc);
    if(rpc.substring(0, 7) != 'http://' && rpc.substring(0, 8) != 'https://'){
        callback(false, rpc);
        return;
    }

    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    logs.log('');
    web3.version.getNetwork(function(error, result){
        //logs.log(error, result);
        callback(error, result);
    });
}

utils.events = function(json, network) {
    var events;

    if (json.networks[network] == null) {
        events = {};
    } else {
        events = this.network.events || {};
    }

    // Merge abi events with whatever's returned.
    var abi = json.abi;

    abi.forEach(function(item) {
        if (item.type != "event") return;

        var signature = item.name + "(";

        item.inputs.forEach(function(input, index) {
            signature += input.type;

            if (index < item.inputs.length - 1) {
                signature += ",";
            }
        });

        signature += ")";

        var topic = Web3.prototype.sha3(signature);

        events[topic] = item;
    });

    return events;
}

utils.cons = function(rpc, account, callback){
    utils.network(rpc, function (error, network) {
        var ret = {};
        if(error)
            return ret;

        var jsons = utils.load(account);
        for (var f in jsons){

            //logs.log(f);
            var net = jsons[f].networks[network];

            //logs.log(network);
            if(net == undefined){
                logs.log(net);
                continue;
            }

            ret[f] = {};
            //ret[f].networks = jsons[f].networks;
            ret[f].address = jsons[f].networks[network].address;
            //ret[f].events = jsons[f].networks[network].events;
            ret[f].events = utils.events(jsons[f], network);
            //logs.log(ret[f].events);
            ret[f].contract_name = jsons[f].contract_name || jsons[f].contractName;
            ret[f].abi = jsons[f].abi.filter(function(item){
                return item.type=='function';
            });
        }

        //logs.log(ret);
        callback(ret);
    });
}

utils.get_account = function(req) {
    if(typeof(req.cookies.account) == "undefined")
        return undefined;

    var cook = JSON.parse(req.cookies.account);
    return cook.account;
}

module.exports = utils;