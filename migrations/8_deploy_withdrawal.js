const MindsWithdraw = artifacts.require('./MindsWithdraw.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const token = MindsToken.address;

  deployer.deploy(MindsWithdraw, token);

};