var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
/*
console.log("hello");
var Web3 = require('web3');

var contract = require("truffle-contract");
var provider = new Web3.providers.HttpProvider("http://192.168.153.128:8545");

var json = require('../solidity/build/contracts/TestInt.json');
console.log("json=", json);
var Test = contract(json);
Test.setProvider(provider);

//没有默认地址，会报错
//UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 3): Error: invalid address
//务必设置为自己的钱包地址，如果不知道，查看自己的客户端启动时，观察打印到控制台的地址
Test.defaults({
  from : "0xd6084aeba0fd47f7e0bcc687acfe6e835faeae70"
});

Test.deployed().then(function(contractInstance) {
  console.log("then");
  instance = contractInstance;
  return instance.get.call();
}).then(function(result){
  console.log(result);
});

Test.deployed().then(function(contractInstance) {
  console.log("then");
  instance = contractInstance;
  return instance.set("0x01");
}).then(function(result){
  console.log(result);
});

*/
router.get('/test', function(req, res, next) {
  console.log("Test=", Test);



  res.send('test');
});

module.exports = router;
