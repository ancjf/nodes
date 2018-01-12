/**
 * Created by cjf on 2017/8/30.
 */
var logs = require('./logs.js');
var truffle = require('../solidity/truffle.js');

var contract = require("truffle-contract");
var Web3 = require('web3');

const keccak256 = require('js-sha3').keccak_256;
var Webs = require('./webs.js');

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

    fs.renameSync(file, name);

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

utils.cons = function(network){
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
        ret[f].networks = utils.jsons[f].networks;
        ret[f].contract_name = utils.jsons[f].contract_name;
        ret[f].abi = utils.funs(utils.jsons[f]);
    }

    return ret;
}

utils.res_con = function(con, rpc){
    logs.logvar(con, rpc);
    con = utils.jsons[con];

    var ret = [];

    //logs.logvar(con);
    for (var f in con.abi){
        if(con.abi[f].type == "function"){
            ret.push(con.abi[f]);
        }

    }

    ret = {"networks":con.networks, "abi":ret};
    //logs.logvar(ret);
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

function arg_test(){
    logs.logvar(arguments);
}

arg_test(['a','b']);

var testint = utils.json("TestInt");
//logs.logvar(testint.networks['5678'].address);

var trans = [];
testint.abi.forEach(function (result, index) {

    if(result.type == "function")
        trans.push({"abi":result,"conname":testint.contract_name,"to":testint.networks['5678'].address});
    /*
    trans[index].abi = result;
    trans[index].from = "0x18a3cbbf884d0fd94cd1d10dec041c3b5a08b5b5";
    trans[index].to = testint.networks['5678'].address;
    */
});
/*
logs.logvar(trans);
*/


var webs = new Webs("http://192.168.153.128:8545");
logs.logvar(webs.web3.version.network);
/*
webs.trans(trans, function(err, result) {
    logs.logvar(err, result);
});
*/

var cons = utils.cons(webs.web3.version.network);
//logs.logvar(cons);
//webs.test(5, 2, cons);
//logs.logvar(webs.web3.version.network, cons['TestInt']);
var testint = cons['TestInt'];
//webs.test_con(5, 2, testint);

//webs.test_fun(5, 2, testint.abi[2], testint.contract_name, testint.networks[webs.web3.version.network].address);

//var file = fs.openSync('./routes/webs.js', "w");
//logs.logvar(process.stdout);

var srcfile = './routes/webs.js';
var destfile = './public/javascripts/webs.js';

//if(!fs.existsSync(destfile) || fs.statSync(srcfile).mtime > fs.statSync(destfile).mtime)
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

/*
var stat = fs.statSync('./routes/webs.js');
logs.logvar(stat, Date.parse(fs.statSync('./routes/webs.js').mtime));

b.add('./routes/webs.js');
b.bundle().pipe(fs.createWriteStream('./public/javascripts/webs.js'));
logs.logvar("end");
*/
//b.bundle().pipe(process.stdout);

//fs.closeSync(file);


//var out = browserify('./routes/webs.js')
//logs.logvar(out);

module.exports = utils;