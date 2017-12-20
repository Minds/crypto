const MindsBoost = artifacts.require('./MindsBoost.sol');
const MindsBoostStorage = artifacts.require('./MindsBoostStorage.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const storage = MindsBoostStorage.address;
  const token = MindsToken.address;

  deployer.deploy(MindsBoost, storage, token);

};