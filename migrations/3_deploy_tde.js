const MindsToken = artifacts.require('./MindsToken.sol')
const MindsTokenSaleEvent = artifacts.require('./MindsTokenSaleEvent.sol');

module.exports = (deployer) => {
  const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 120 // one second in the future
  const endTime = startTime + (86400 * 20) // 20 days
  const rate = new web3.BigNumber(350) //1 ETH <=> 350 M <=> $1
  const wallet = '0xbcd663a8bd5b8207685cadce3203979aeb7fb725'
  //const wallet = '0x5aeda56215b167893e80b4fe645ba6d5bab767de'

  deployer.deploy(MindsTokenSaleEvent, rate, wallet, '0xf5f7ad7d2c37cae59207af43d0beb4b361fb9ec8');

};