const MindsPeerBoost = artifacts.require('./MindsPeerBoost.sol');
const MindsPeerBoostStorage = artifacts.require('./MindsPeerBoostStorage.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const storage = MindsPeerBoostStorage.address;
  const token = MindsToken.address;

  deployer.deploy(MindsPeerBoost, storage, token);

};