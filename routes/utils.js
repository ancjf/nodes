/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var Web3 = require('web3');
var Webs = require('./webs.js');
var fs = require('fs');
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

utils.funs = function(con, rpc){
    if(typeof(con) == "string")
        con = utils.contract(con, rpc);

    var ret = [];

    //logs.logvar(con.abi);
    for (var f in con.abi){
        if(con.abi[f].type == "function"){
            ret.push(con.abi[f]);
        }

    }

    return ret;
}

utils.cons = function(rpc){
    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    var network = web3.version.network;
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
        logs.logvar(ret[f].events);
        ret[f].contract_name = utils.jsons[f].contract_name;
        ret[f].abi = utils.funs(utils.jsons[f]);

    }

    return ret;
}

utils.load();

var srcfile = './routes/webs.js';
var destfile = './public/javascripts/webs.js';

/*
if(!fs.existsSync(destfile) || fs.statSync(srcfile).mtime > fs.statSync(destfile).mtime)
{
    var gulp = require('gulp');
    //var minify = require('gulp-minify-css');
    var less = require('gulp-less');
    var browserify = require("browserify");
    var b = browserify();
    b.add(srcfile);
    b.bundle().pipe(fs.createWriteStream(destfile));

    gulp.src(destfile)
        .pipe(less())
        .pipe(gulp.dest('build'));

    logs.logvar("generate:", destfile);
}
*/
module.exports = utils;