var increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;

var MindsToken = artifacts.require("./MindsToken.sol");
var MindsTokenSaleEvent = artifacts.require("./MindsTokenSaleEvent.sol");

contract('MindsTokenSaleEvent', (accounts) => {
  let token,
    tse,
    startTime,
    endTime,
    rate,
    wallet;

  beforeEach(async () => {
    startTime = web3.eth.getBlock('latest').timestamp + 86400 // 1 day
    endTime = web3.eth.getBlock('latest').timestamp + (86400 * 20) // 20 days
    rate = new web3.BigNumber(350) //1 ETH <=> 350 M <=> $1
    wallet = accounts[2];

    token = await MindsToken.new();
    await token.mint(wallet, web3.toWei(10000000, "ether"));

    tse = await MindsTokenSaleEvent.new(startTime, endTime, rate, wallet, token.address);
    await token.approve(tse.address, web3.toWei(10000000, "ether"), { from: wallet }); //approve to use one of our tokens    
  });

  it('should be ended only after end', async () => {
    let ended = await tse.hasEnded()
    assert.equal(ended, false);
    await increaseTimeTo(endTime + 1);
    ended = await tse.hasEnded();
    assert.equal(ended, true);
  });

  describe('accepting payments', () => {
    
    it('should reject payments before start', async () => {
      let value = 1;
      let err = false;
      try {
        await tse.send(value);
      } catch (e) {
        err = true;
      }
      assert.equal(err, true);

      err = false;
      try {
        await tse.buyTokens(accounts[1], { from: accounts[3], value: value });
      } catch (e) {
        err = true;
      }
      assert.equal(err, true);
    });

    it('should accept payments after start', async () => {
      let value = 1;
      await increaseTimeTo(startTime);
      await tse.send(value);
      await tse.buyTokens(accounts[1], { value: value, from: accounts[3] });
    });

    it('should reject payments after end', async function () {
      let value = 1;
      let err = false;
      try {
        await tse.send(value);
      } catch (e) {
        err = true;
      }
      assert.equal(err, true);

      err = false;
      try {
        await tse.buyTokens(accounts[1], { from: accounts[3], value: value});
      } catch (e) {
        err = true;
      }
      assert.equal(err, true);
    });

  });

  describe('fulfilling purchase', () => {

    beforeEach(async () => {
      await increaseTimeTo(startTime);
    });

    it('should send tokens to purchaser', async () => {
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[1] })
      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(350, "ether"));
    });

    it('should forward funds to wallet', async () => {
      let value = web3.toWei(1, "ether");
      //let value = 1;
      const pre = await web3.eth.getBalance(wallet);
      await tse.sendTransaction({ value: value, from: accounts[1] });
      const post = await web3.eth.getBalance(wallet);
      assert.equal(post.toNumber() - pre.toNumber(), value);
    })
  });

});
