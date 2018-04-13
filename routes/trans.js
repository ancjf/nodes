
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.8.15:8545"));

//console.log("web3.eth", web3.eth);
function get_random_num(Min, Max) // [Min, Max)
{
    var Range = Max - Min;
    var Rand = Math.floor(Math.random() * Range);
    return Min + Rand;
}

function random_item(addr)
{
    var rand = Math.floor(Math.random() * (addr.length));
    //console.log('rand=', rand, ",addr=", addr);
    return addr[rand];
}

function trans_one(percount, accounts, callback){
	var ret = [];
	
	//console.log("web3.eth", web3.eth);
	for(var i = 0; i < percount; i++){
		web3.eth.sendTransaction({"from":random_item(accounts),"to":random_item(accounts),"value":"1"}, function(err, transactionHash) {
			ret.push({err:err, hash:transactionHash});
			
			//console.log(err, transactionHash);
			if(ret.length >= percount){
				callback(ret);
			}
		});
	}
}

function trans(count, percount, accounts, callback){
	var ret = [];
	
	for(var i = 0; i < count; i++){
		trans_one(percount, accounts, function(result) {
			ret.push(result);
			
			console.log("ret.length=", ret.length, "percount=", percount);
			
			if(ret.length >= count){
				callback(ret);
			}
		});
	}
}

function recharge(from){
	var ret = [];
	
	for(var i = 0; i < web3.personal.listAccounts.length; i++){
		web3.eth.sendTransaction({"from":from,"to":web3.personal.listAccounts[i],"value":web3.toWei(10000,"ether")}, function(err, transactionHash) {
			ret.push({err:err, hash:transactionHash});
			
			console.log(err, transactionHash);
			if(ret.length >= percount){
				callback(ret);
			}
		});
	}
}

var percount = 500;
var count = 3;
var begin = new Date().getTime();

/*
recharge("0x34b6cc4da59ac6378df18826ce1517d4d91f464a", function(result){
	console.log(result);
	console.log("cost time", new Date().getTime() - begin, "result.length=", result.length);
});
*/

trans(count, percount, web3.personal.listAccounts, function(result){
	//console.log(result);
	console.log("cost time", new Date().getTime() - begin, "count=", count, "percount=", percount);
});
