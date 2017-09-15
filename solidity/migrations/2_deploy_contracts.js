var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var TestInt = artifacts.require("./TestInt.sol");
var Users = artifacts.require("./Users.sol");

//var option = {gas:0xffffffff, gasPrice:0};
var option = {gasPrice:0};

module.exports = function(deployer) {
  /*
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
  */

  //console.log("deployer=", deployer);
  //console.log("TestInt=", TestInt);
  deployer.deploy(TestInt, option);
  deployer.deploy(Users, option);
};
