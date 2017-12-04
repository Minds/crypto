const MindsPeerBoostStorage = artifacts.require('./MindsPeerBoostStorage.sol');

module.exports = (deployer) => {

  //comment this out once we've deployed once!
  deployer.deploy(MindsPeerBoostStorage);

};