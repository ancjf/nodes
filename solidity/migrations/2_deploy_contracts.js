var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var TestInt = artifacts.require("./TestInt.sol");
var Users = artifacts.require("./Users.sol");

module.exports = function(deployer) {
  /*
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
  */
  deployer.deploy(TestInt);
  deployer.deploy(Users);
};
