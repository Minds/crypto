const MindsWire = artifacts.require('./MindsWire.sol');
const MindsWireStorage = artifacts.require('./MindsWireStorage.sol');
const MindsToken = artifacts.require('./MindsToken.sol');

module.exports = (deployer) => {

  const storage = MindsWireStorage.address;
  //const storage = "0xf389947caf8bc3504758e2fc50479cad317cba94";
  const token = MindsToken.address;
  //const token = "0x9bfd09b3e7aaaccec117a1c1d3cfb4875d7e40bb";

  deployer.deploy(MindsWire, storage, token);

};