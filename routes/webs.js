/**
 * Created by cjf on 2017/9/30.
 */

var Web3 = require('web3');
//var logs = require('./logs.js');
var coder = require('../node_modules/web3/lib/solidity/coder');
var formatters = require('../node_modules/web3/lib/web3/formatters');
//var Eth = require('../node_modules/web3/lib/web3/methods/eth');
//var Personal = require('../node_modules/web3/lib/web3/methods/Personal');
var utils = require('../node_modules/web3/lib/utils/utils');
//var SolidityFunction = require('../node_modules/web3/lib/web3/function');
var Method = require('../node_modules/web3/lib/web3/method');
var Tx = require('ethereumjs-tx');
var ethUtils = require('ethereumjs-util');
var async = require('async');

var Jsonrpc = {
    messageId: 0
};

function get_random_num(Min, Max) // [Min, Max)
{
    var Range = Max - Min;
    var Rand = Math.floor(Math.random() * Range);
    return Min + Rand;
}

function random_string(len) {
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return '"'+ pwd + '"';
}

function random_x_string(len) {
    var $chars = '0123456789abcdef';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function random_address() {
    return '0x'+ random_x_string(40) + '';
}

function random_number(len){
    return '0x'+ random_x_string(len) + '';
}

function random_integer(len){
    if(0 == len)
        return '0x0';

    var $chars = '01234567';
    var firstChr = $chars.charAt(Math.floor(Math.random() * $chars.length));

    if(Math.floor(Math.random()*2) == 0){
        return '-0x'+  firstChr + random_x_string(len-1) + '';
    }

    return '0x'+  firstChr + random_x_string(len-1) + '';
}

function alignSize(size) {
    return parseInt(32 * Math.ceil(size / 32));
}

function randomNumber(size, signed) {
    if(signed)
        return random_integer(size);

    return random_number(size);
}

function randomBoolean() {
    return get_random_num(0, 2) == 0 ? false : true;
}

function randomString() {
    return random_string(get_random_num(0, 256));;
}

function randomFixedBytes(size) {
    return random_string(size);
}

function randomDynamicBytes() {
    return random_string(get_random_num(0, 256));
}

function randomAddress() {
    return random_number(40);
}

function randomArray(size) {
    return random_number(20);
}

function randomType(typeInput) {
    var type = typeInput; // eslint-disable-line
    var coder = null; // eslint-disable-line
    const paramTypePart = new RegExp(/^((u?int|bytes)([0-9]*)|(address|bool|string)|(\[([0-9]*)\]))/);
    const invalidTypeErrorMessage = `[ethjs-abi] while getting param coder (getParamCoder) type value ${JSON.stringify(type)} is either invalid or unsupported by ethjs-abi.`;

    while (type) {
        var part = type.match(paramTypePart); // eslint-disable-line
        if (!part) { throw new Error(invalidTypeErrorMessage); }
        type = type.substring(part[0].length);

        var prefix = (part[2] || part[4] || part[5]); // eslint-disable-line
        switch (prefix) {
            case 'int': case 'uint':
            if (coder) { throw new Error(invalidTypeErrorMessage); }
            var intSize = parseInt(part[3] || 256); // eslint-disable-line
            if (intSize === 0 || intSize > 256 || (intSize % 8) !== 0) {
                throw new Error(`[ethjs-abi] while getting param coder for type ${type}, invalid ${prefix}<N> width: ${type}`);
            }

            coder = randomNumber(intSize / 8, (prefix === 'int'));
            break;

            case 'bool':
                if (coder) { throw new Error(invalidTypeErrorMessage); }
                coder = randomBoolean();
                break;

            case 'string':
                if (coder) { throw new Error(invalidTypeErrorMessage); }
                coder = randomString();
                break;

            case 'bytes':
                if (coder) { throw new Error(invalidTypeErrorMessage); }
                if (part[3]) {
                    var size = parseInt(part[3]); // eslint-disable-line
                    if (size === 0 || size > 32) {
                        throw new Error(`[ethjs-abi] while getting param coder for prefix bytes, invalid type ${type}, size ${size} should be 0 or greater than 32`);
                    }
                    coder = coderFixedBytes(size);
                } else {
                    coder = randomDynamicBytes();
                }
                break;

            case 'address':
                if (coder) { throw new Error(invalidTypeErrorMessage); }
                coder = randomAddress();
                break;

            case '[]':
                if (!coder || coder.dynamic) { throw new Error(invalidTypeErrorMessage); }
                var defaultSize = get_random_num(0, 16);
                coder = [];
                for(var i = 0; i < defaultSize; i++)
                    coder[i] = randomType(coder);
                break;

            // "[0-9+]"
            default:
                if (!coder || coder.dynamic) { throw new Error(invalidTypeErrorMessage); }
                var defaultSize = parseInt(part[6]); // eslint-disable-line
                coder = [];
                for(var i = 0; i < defaultSize; i++)
                    coder[i] = randomType(coder);
        }
    }

    return coder;
}

function randomInput(inputTypes) {
    var parts = [];

    inputTypes.forEach(function(type, index) {
        var coder = randomType(type);
        parts.push(coder);
    });

    return parts;
}

function validateArgs(inputTypes, args) {
    var inputArgs = args.filter(function (a) {
        // filter the options object but not arguments that are arrays
        return !( (utils.isObject(a) === true) &&
            (utils.isArray(a) === false) &&
            (utils.isBigNumber(a) === false)
        );
    });
    if (inputArgs.length !== inputTypes.length) {
        throw errors.InvalidNumberOfSolidityArgs();
    }
};


function toPayload(tran, params) {
    var options = tran.options;

    options.data = webs.prototype.random_data(tran.abi, params);
    options.to = tran.to;
    return options;
};

function getReceipt(eth, txHash, callback){
    var timeout = 240000;
    var start = new Date().getTime();

    var getTransactionReceipt_UntilNotNull = function(txHash) {
        eth.getTransactionReceipt(txHash, function (err, receipt) {
            //console.log("txHash=",txHash)
            //console.log("err=",err)
            //console.log("receipt=",receipt)
            //logs.logvar(txHash, err, receipt);
            if (err) {
                //logs.logvar(typeof(err.message), err.message, err);
                callback(true, err.stack);
                return;
            }

            if (receipt == null) {
                if (timeout > 0 && new Date().getTime() - start > timeout) {
                    callback(true, "timeout");
                    return;
                }

                setTimeout(function () {
                    getTransactionReceipt_UntilNotNull(txHash);
                }, 500);
            } else {
                callback(false, receipt);
            }
        })
    };

    getTransactionReceipt_UntilNotNull(txHash);
}

var webs = function (rpc) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    //logs.logvar(rpc);
    this.logs = {};
};

webs.prototype.logs = new Map();

webs.prototype.decodeParams = coder.decodeParams;

webs.prototype.unpackOutput = function (outputs, output) {
    if (!output) {
        return;
    }

    var result = [];

    try{
        var outputTypes = outputs.map(function (i) {
            return i.type;
        });

        output = output.length >= 2 ? output.slice(2) : output;
        var result = coder.decodeParams(outputTypes, output);
    }catch(err) {
        //logs.logvar(err);
        return [err.stack];
    }

    return result.length === 1 ? result[0] : result;
};

webs.prototype.unpack_logs = function(outputs, output) {
    if (!output) {
        return;
    }

    var result = [];

    try{
        var outputTypes = [];
        for(var i = 0; i < outputs.length; i++){
            //logs.logvar(typeof(outputs[i].type), outputs[i]['[type]']);
            outputTypes[i] = outputs[i].type;
            if(outputTypes[i] == undefined)
                outputTypes[i] = outputs[i]['[type]'];
        }

        //logs.logvar(outputs, outputTypes);
        output = output.length >= 2 ? output.slice(2) : output;
        var result = coder.decodeParams(outputTypes, output);
    }catch(err) {
        //logs.logvar(err);
        return [err.stack];
    }

    return result.length === 1 ? result[0] : result;
};

webs.prototype.decode_logs = function(events, receipt) {
    if (events === undefined) {
        //logs.logvar(events, receipt);
        return receipt.logs;
    }

    var ret = [];

    for(var i = 0; i < receipt.logs.length; i++){
        ret[i] = receipt.logs[i];
        var topics = receipt.logs[i].topics[0];
        if(events[topics] != undefined)
            ret[i].result = webs.prototype.unpack_logs(events[topics].inputs, receipt.logs[i].data);
    }

    return ret;
};

webs.prototype.trans_params = function(eth, tran, params, i, fun){
    var payload = toPayload(tran, params);
    if(typeof(tran.abi) !== 'undefined' && (tran.abi.constant == true || tran.abi.constant == 'true')){
        eth.call(payload, "latest",  function(err, result) {
            if(err){
                fun(i, {"err":true,"result":err.stack});
                return;
            }

            if (result && typeof(tran.abi.outputs) !== 'undefined') {
                result = webs.prototype.unpackOutput(tran.abi.outputs, result);
            }
            fun(i, {"err":false,"result":result});
        });
    }else{
        eth.sendTransaction(payload, function(err, result){
            if(err){
                fun(i, {"err":true,"result":err.stack});
                return;
            }

            getReceipt(eth, result, function(err, receipt){
                //logs.logvar(indes, trans.length, err, receipt);
                if(err){
                    fun(i, {"err":true,"result":receipt});
                }else{
                    receipt.logs = webs.prototype.decode_logs(tran.events, receipt);
                    fun(i, {"err":false,"result":receipt});
                }

            });
        });
    }
}

webs.prototype.trans_one = function(eth, tran, i, fun){
    //logs.logvar(tran);
    if(tran.params == undefined){
        //logs.logvar(tran);
        return webs.prototype.trans_params(eth, tran, undefined, 0,  function callback(index, result){
            //logs.logvar(index, result);
            fun(i, [result]);
        });
    }

    var ret = [];
    var count = 0;
    for(var f = 0; f < tran.params.length; f++){
        webs.prototype.trans_params(eth, tran, tran.params[f], f,  function callback(index, result){
            ret[index] = result;
            count++;
            //logs.logvar(count, tran.params.length);
            if(count == tran.params.length)
                fun(i, ret);
        });
    }
}

webs.prototype.random_data = function (abi, params) // [Min, Max)
{
    if(typeof(params) == 'string'){
        return params;
    }

    if(abi.inputs == undefined || abi.inputs.length == 0){
        const signature = abi.name + '()';
        var hash = Web3.prototype.sha3(signature).slice(0, 10);
        return hash;
    }

    var inputTypes = abi.inputs.map(function (i) {
        return i.type;
    });

    const signature = abi.name + '(' + inputTypes.join(',') + ')';
    var hash = Web3.prototype.sha3(signature).slice(0, 10);

    if(params === undefined)
        params = randomInput(inputTypes);
    validateArgs(inputTypes, params);

    var ret = hash + coder.encodeParams(inputTypes, params);
    return ret;
}

webs.prototype.random_item = function (addr)
{
    if(utils.isObject(addr)){
        var keys = Object.keys(addr);
        if(0 == keys.length)
            return undefined;

        var rand = Math.floor(Math.random() * keys.length);
        return addr[keys[rand]];
    }
    //console.log('addr.length=', addr.length);
    if(0 == addr.length)
        return undefined;

    var rand = Math.floor(Math.random() * (addr.length));
    //console.log('rand=', rand, ",addr=", addr);
    return addr[rand];
}

webs.prototype.trans = function(trans, fun) {
    var web3 = this.web3;
    //this.web3 = web3;
    //var provider = new Web3.providers.HttpProvider(rpc);
    //var request = new RequestManager(provider);
    //var web = {"_requestManager":request,"currentProvider":rpc};
    //var eth = new Eth(web);
    //var personal = new Personal(web);
    var eth = web3.eth;
    var accounts = web3.personal.listAccounts;
    //logs.logvar(accounts);

    var ret = [];
    var count = 0;
    //var i = 3;
    for(var i = 0; i < trans.length; i++)
    {
        if(trans[i].options == undefined)
            trans[i].options = {};
        if(trans[i].options.from == undefined){
            if(webs.prototype.isAddress(trans[i].from)){
                trans[i].options.from = trans[i].from;
            }else {
                trans[i].options.from = this.random_item(accounts);
            }
            console.log('undefined:trans[i]=', trans[i]);
        }

        console.log('trans[i]=', trans[i]);
        webs.prototype.trans_one(eth, trans[i], i, function (index, result) {
            ret[index] = result;
            count++;
            //logs.logvar(count, index, trans.length);
            if(count >= trans.length){
                //logs.logvar(ret);
                fun(false, ret);
            }

        });
    }
}

function result_fun(result) {
    if(typeof(result) == "number")
        result = result.toString();
    if(result == null)
        result = "null";

    return result;
}

function call_extend() {
    var methods = [
        new Method({
            name: 'extend.getPeers',
            call: 'admin_peers',
            params: 0
        }),
        new Method({
            name: 'extend.version',
            call: 'net_version',
            params: 0
        }),
        new Method({
            name: 'extend.listTransactions',
            call: 'eth_listTransactions',
            params: 3,
            inputFormatter: [formatters.inputAddressFormatter, formatters.inputBlockNumberFormatter, formatters.inputBlockNumberFormatter]
        }),
        new Method({
            name: 'extend.listTransactionReceipts',
            call: 'eth_listTransactionReceipts',
            params: 3,
            inputFormatter: [formatters.inputAddressFormatter, formatters.inputBlockNumberFormatter, formatters.inputBlockNumberFormatter]
        }),
        new Method({
            name: 'extend.getNodeInfo',
            call: 'admin_nodeInfo',
            params: 0
        }),
        new Method({
            name: 'extend.getNodes',
            call: 'eth_getNodes',
            params: 1
        }),
        new Method({
            name: 'extend.addPeer',
            call: 'admin_addPeer',
            params: 1
        }),
        new Method({
            name: 'extend.getNodeAbi',
            call: 'eth_getNodeAbi',
            params: 0
        }),
        new Method({
            name: 'extend.getOwner',
            call: 'eth_getOwner',
            params: 0
        })
    ];

    return {'methods':methods};
}

webs.prototype.fillTrans = function(web3, trans, fun) {
    var tx = trans;

    async.parallel([
        function(callback){
            if(tx.to != undefined){
                web3.eth.estimateGas(tx, function(error, result) {
                    if(!error)
                        trans.gasLimit = Web3.prototype.toHex(result);
                    callback(error, trans);
                })
            }else{
                callback(null, trans);
            }
        },
        function(callback){
            web3.extend.version(function(error, result) {
                if(!error)
                    trans.chainId = parseInt(result);
                callback(error, trans);
            });
        },
        function(callback){
            web3.eth.getGasPrice(function(error, result) {
                if(!error)
                    trans.gasPrice = Web3.prototype.toHex(result);
                callback(error, trans);
            })
        },
        function(callback){
            web3.eth.getTransactionCount(trans.from, "pending", function(error, result) {
                if(!error)
                    trans.nonce = Web3.prototype.toHex(result);
                callback(error, trans);
            })
        }
    ], function(error, result) {
        fun(error, trans);
    });
};

webs.prototype.sendRawTrans = function(web3, tx, events, fun) {
    try{
        web3.eth.sendRawTransaction(tx, function(err, hash) {
            console.log('err=', err, ',hash=', hash);
            if(err){
                fun(err, hash);
            }else{
                getReceipt(web3.eth, hash, function(error, receipt){
                    console.log('events=', events, ',receipt=', receipt);
                    receipt.logs = webs.prototype.decode_logs(events, receipt);
                    fun(error, receipt);
                });
            }
        });
    }catch(err){
        //logs.logvar(typeof(err.stack), err.stack);
        fun(true, err.stack);
    }
};

webs.prototype.call = function(args, callback) {
    var fun = args.fun;
    var params = args.params;
    var rpc = args[".rpc"];

    if(params !== undefined && params.length > 0){
        params = JSON.stringify(params);
        params = '(' + params.substring(1, params.length-1) + ', callback)';
    }else{
        params = '(callback)';
    }

    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    web3._extend(call_extend());
    var line = "web3." + fun + params;
    //logs.logvar(line);
    //console.log("line=", line);
    eval(line);
};

webs.prototype.stat_init = function (req_count) {
    return {"id": new Date().getTime(),
        "start": new Date().getTime(),
        "req_count": req_count,
        "count": 0,
        "err": 0,
        "nolog": 0,
        "succeed": 0,
        "gasUsed" : 0,
        "costTime" : 0,
        "contract": {}};
}

webs.prototype.stat_one = function (stat, conname, fun, result) {
    stat.costTime = new Date().getTime() - stat.start;
    var funname = fun.name;
    if(typeof stat.contract[conname] === "undefined"){
        stat.contract[conname] = {count:0, err:0, nolog:0, succeed:0, gasUsed : 0, function:{}};
    }

    if(typeof stat.contract[conname].function[funname] === "undefined"){
        //logs.log("conname=", conname, ",funname=", funname)
        if(fun.constant)
            stat.contract[conname].function[funname] = {count: 0, err: 0, succeed: 0};
        else
            stat.contract[conname].function[funname] = {count: 0, err: 0, nolog:0, succeed: 0, gasUsed : 0};
    }

    stat.count++;
    stat.contract[conname].count++;
    stat.contract[conname].function[funname].count++;

    if(result == undefined || result.err){
        stat.err++;
        stat.contract[conname].err++;
        stat.contract[conname].function[funname].err++;
        return stat;
    }

    if(!fun.constant && result.result.logs.length == 0){
        stat.nolog++;
        stat.contract[conname].nolog++;
        stat.contract[conname].function[funname].nolog++;
        return stat;
    }

    stat.succeed++;
    stat.contract[conname].succeed++;
    stat.contract[conname].function[funname].succeed++;

    if(!fun.constant){
        var gasUsed = result.result.gasUsed;
        if(gasUsed == undefined)
            gasUsed = 0;

        stat.gasUsed += gasUsed;
        stat.contract[conname].gasUsed += gasUsed;
        stat.contract[conname].function[funname].gasUsed += gasUsed;
        return stat;
    }

    return stat;
}

webs.prototype.stat = function (stat, trans, result) {
    //logs.logvar(trans, result);
    for(var i = 0; i < trans.length; i++){
        if(trans[i].params == undefined){
            var val = undefined;
            if(typeof (result[i][0]) !== "undefined")
                val = result[i][0];
            stat = this.stat_one(stat, trans[i].conname, trans[i].abi, val);
            continue;
        }
        for(var j = 0; j < trans[i].params.length; j++) {
            stat = this.stat_one(stat, trans[i].conname, trans[i].abi, result[i][j]);
        }
    }

    return stat;
}

webs.prototype.test_fun_trans = function (stat, count, trans) {
    var me = this;
    me.trans(trans, function (err, result) {
        if(err)
            result = [];
        stat = me.stat(stat, trans, result);
        webs.prototype.set_log(stat);
        //logs.logvar(count, stat);
        if(count > 1)
            me.test_fun_trans(stat, count-1, trans);
    });
}

webs.prototype.test_fun = function (count, perCount, abi, conname, address) {
    var trans = [{"abi":abi,"conname":conname,"to":address, "params":new Array(perCount)}];

    var stat = this.stat_init(count*perCount);
    webs.prototype.set_log(stat);

    this.test_fun_trans(stat, count, trans);

    return stat.id;
}

webs.prototype.test_con_trans = function (perCount, con) {
    var trans = [];

    for(var i = 0; i < perCount; i++){
        var abi = this.random_item(con.abi);

        //logs.logvar(this.web3.net.version, con.networks);
        var tran = {"abi":abi,"conname":con.contract_name,"to":con.address};
        trans[i] = tran;
    }

    return trans;
}

webs.prototype.test_con = function (count, perCount, con, stat) {
    if(stat == undefined){
        stat = this.stat_init(count*perCount);
        webs.prototype.set_log(stat);
    }

    var trans = this.test_con_trans(perCount, con);

    var me = this;
    me.trans(trans, function (err, result) {
        if(err)
            result = [];
        stat = me.stat(stat, trans, result);
        webs.prototype.set_log(stat);
        //logs.logvar(count, stat);
        if(count > 1)
            me.test_con(count-1, perCount, con, stat);
    });

    return stat.id;
}

webs.prototype.test_trans = function (perCount, cons) {
    var trans = [];

    for(var i = 0; i < perCount; i++){
        //logs.logvar(cons);
        var con = this.random_item(cons);
        //logs.logvar(con);
        var abi = this.random_item(con.abi);

        //logs.logvar(con.networks[this.web3.version.network].address, con.address);
        var tran = {"abi":abi,"conname":con.contract_name,"to":con.address};

        trans[i] = tran;
    }

    return trans;
}

webs.prototype.test = function (count, perCount, cons, stat) {
    if(stat == undefined){
        stat = this.stat_init(count*perCount);
        webs.prototype.set_log(stat);
    }

    var trans = this.test_trans(perCount, cons);

    var me = this;
    //logs.logvar(count, perCount);
    me.trans(trans, function (err, result) {
        //logs.logvar(err, result);
        if(err)
            result = [];
        stat = webs.prototype.stat(stat, trans, result);
        //logs.logvar(count, stat.id, stat);
        //logs.logvar("1111111111111111111111111111111111111111111111111111111111111111");
        webs.prototype.set_log(stat);
        if(count > 1)
            me.test(count-1, perCount, cons, stat);
    });

    return stat.id;
}

var s_timeout = 0;
webs.prototype.set_log = function (stat) {
    var now = new Date().getTime();

    if(now > s_timeout){
        s_timeout = now + 1000*60*5;
        for (var key of webs.prototype.logs.keys()) {
            var stat = webs.prototype.logs[key];
            var lasttime = stat.start + stat.costTime;
            if(lasttime + 1000*60*10 > now){
                delete webs.prototype.logs[id];
            }
        }
    }

    webs.prototype.logs[stat.id] = stat;
}

webs.prototype.log = function (id, keep) {
    var log = webs.prototype.logs[id];

    if(keep == true || keep == 'true'){
        return log;
    }

    if(log.count >= log.req_count)
        delete webs.prototype.logs[id];
    return log;
}

webs.prototype.sign = function (rawTx, privateKey) {
    if(typeof(privateKey) == "string")
        privateKey = new Buffer(privateKey, 'hex');

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();
    console.log("serializedTx=", serializedTx);
    return serializedTx;
}

webs.prototype.toAddress = function (privateKey) {
    if(typeof(privateKey) == "string")
        privateKey = new Buffer(privateKey, 'hex');

    return ethUtils.privateToAddress(privateKey).toString('hex');
}

webs.prototype.getWeb3 = function (rpc) {
    var web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    web3._extend(call_extend());

    return web3;
}

webs.prototype.isPrivKey = function (priv) {
    if(typeof (priv) !== 'string')
        return false;
    if(priv.length != 64)
        return false;

    return ethUtils.isHexString(ethUtils.addHexPrefix(priv));
}

webs.prototype.isNodeId = function (_id) {
    if(typeof (_id) !== 'string')
        return false;
    if(_id.length != 128)
        return false;

    return ethUtils.isHexString(ethUtils.addHexPrefix(_id));
}

webs.prototype.toWeiHx = function (_d) {
    return Web3.prototype.toHex(Web3.prototype.toWei(_d, 'ether'));
}

webs.prototype.sha3 = Web3.prototype.sha3;
webs.prototype.sha3 = Web3.prototype.sha3;
webs.prototype.isAddress = Web3.prototype.isAddress;

if(typeof window!=="undefined")
    window.webs = webs;
else
    module.exports = webs;

