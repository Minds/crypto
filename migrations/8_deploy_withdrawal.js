const MindsWithdraw = artifacts.require('./MindsWithdraw.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const token = MindsToken.address;
  const forwardAddress = '0x14e421986c5ff2951979987cdd82fa3c0637d569';

  deployer.deploy(MindsWithdraw, token, forwardAddress);

};