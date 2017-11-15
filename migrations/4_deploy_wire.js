const MindsWire = artifacts.require('./MindsWire.sol');
const MindsWireStorage = artifacts.require('./MindsWireStorage.sol');

module.exports = (deployer) => {

  const storage = "0x4286534376de223e2bd723f7a1d1c882f11a35c3";

  deployer.deploy(MindsWire, storage);

};