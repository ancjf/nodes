//var ConvertLib = artifacts.require("./ConvertLib.sol");
//var MetaCoin = artifacts.require("./MetaCoin.sol");
var TestInt = artifacts.require("./TestInt.sol");
var Users = artifacts.require("./Users.sol");
var User = artifacts.require("./User.sol");
//var Node = artifacts.require("./Node.sol");
//var quark = artifacts.require("./quark.sol");

//var option = {gas:0xffffffff, gasPrice:0};
var option = {gasPrice:0};

module.exports = function(deployer) {
  //deployer.deploy(ConvertLib, option);
  //deployer.link(ConvertLib, MetaCoin, option);
  //deployer.deploy(MetaCoin, option);

  //console.log("deployer=", deployer);
  //console.log("TestInt=", TestInt);
  deployer.deploy(TestInt, option);
  //console.log("TestInt deployed");
  deployer.deploy(Users, option);
  deployer.deploy(User, option);
  //deployer.deploy(quark, option);
  //console.log("Users deployed");
  //deployer.deploy(Node, option);
};
