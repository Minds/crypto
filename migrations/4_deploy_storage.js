const MindsWireStorage = artifacts.require('./MindsWireStorage.sol');

module.exports = (deployer) => {

  //comment this out once we've deployed once!
  deployer.deploy(MindsWireStorage);

};