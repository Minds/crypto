const MindsToken = artifacts.require('./MindsToken.sol')
const MindsTokenSaleEvent = artifacts.require('./MindsTokenSaleEvent.sol');

module.exports = (deployer) => {
  const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 120 // one second in the future
  const endTime = startTime + (86400 * 20) // 20 days
  const rate = new web3.BigNumber(1000)
  //const wallet = '0xbcd663a8bd5b8207685cadce3203979aeb7fb725'
  const wallet = '0x340b9208d59fc3edcebeef58c6f273eaecc70d43'

  deployer.deploy(MindsTokenSaleEvent, startTime, endTime, rate, wallet, MindsToken.address);

};