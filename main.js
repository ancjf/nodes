var Web3 = require('web3');
var contract = require("truffle-contract");

var provider = new Web3.providers.HttpProvider("http://192.168.153.128:8545");

//省略了无关代码
//合约初始化
console.log("begin");
//var json = require('/home/dev/truffle3/build/contracts/Test.json');
//console.log("json=");



console.log("contract");
//var Test = contract(json);

var Test = contract({
  "contract_name": "Test",
  "abi": [
    {
      "constant": false,
      "inputs": [],
      "name": "f",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "g",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "type": "function"
    }
  ],
  "unlinked_binary": "0x6060604052341561000f57600080fd5b5b6102208061001f6000396000f300606060405263ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166326121ff08114610048578063e2179b8e146100d3575b600080fd5b341561005357600080fd5b61005b61015e565b60405160208082528190810183818151815260200191508051906020019080838360005b838110156100985780820151818401525b60200161007f565b50505050905090810190601f1680156100c55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156100de57600080fd5b61005b6101a0565b60405160208082528190810183818151815260200191508051906020019080838360005b838110156100985780820151818401525b60200161007f565b50505050905090810190601f1680156100c55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101666101e2565b60408051908101604052600a81527f6d6574686f642066282900000000000000000000000000000000000000000000602082015290505b90565b6101a86101e2565b60408051908101604052600a81527f6d6574686f642067282900000000000000000000000000000000000000000000602082015290505b90565b602060405190810160405260008152905600a165627a7a72305820924f3a69ae6abe76e4ead6253d643465abd52dfffad7c512699fc4caa0f3902a0029",
  "networks": {
    "12345": {
      "events": {},
      "links": {},
      "address": "0xffdb1c91550d23200ff13c7252da7eaaaa375f24",
      "updated_at": 1503889095331
    }
  },
  "schema_version": "0.0.5",
  "updated_at": 1503889095331
});


//设置连接
Test.setProvider(provider);

//没有默认地址，会报错
//UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 3): Error: invalid address
//务必设置为自己的钱包地址，如果不知道，查看自己的客户端启动时，观察打印到控制台的地址
Test.defaults({
  from : "0xd6084aeba0fd47f7e0bcc687acfe6e835faeae70"
});

var instance;

console.log("Test=", Test);
/*
Test.at("0xffdb1c91550d23200ff13c7252da7eaaaa375f24").f.call().then(function(contractInstance){
	console.log("then");
});
*/
console.log("Testend");


Test.deployed().then(function(contractInstance) {
  console.log("then");
  console.log(contractInstance);
  instance = contractInstance;
  return instance.f.call();
}).then(function(result){
  console.log(result);
  return instance.g.call();
}).then(function(result){
  console.log(result);
});



