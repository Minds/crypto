const MindsBoost = artifacts.require('./MindsBoost.sol');
const MindsBoostStorage = artifacts.require('./MindsBoostStorage.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const storage = MindsBoostStorage.address;
  const token = "0xf5f7ad7d2c37cae59207af43d0beb4b361fb9ec8";

  deployer.deploy(MindsBoost, storage, token);

};