const MindsToken = artifacts.require('./MindsToken.sol')

module.exports = (deployer) => {

  deployer.deploy(MindsToken);

};