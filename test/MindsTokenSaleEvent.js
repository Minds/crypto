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
    rate = new web3.BigNumber(350) //1 ETH <=> 350 M <=> $1
    wallet = accounts[2];

    token = await MindsToken.new();
    await token.mint(wallet, web3.toWei(10000000, "ether"));

    tse = await MindsTokenSaleEvent.new(rate, wallet, token.address);
    await token.approve(tse.address, web3.toWei(10000000, "ether"), { from: wallet }); //approve to use one of our tokens    
  });

  describe('accepting pledges', () => {

    it ('should accept a pledge', async () => {
      await tse.pledge(accounts[1], web3.toWei(1, 'ether'));
    });

    it ('should not accept a pledge if not owner', async () => {
      let errored = false;
      try {
        await tse.pledge(accounts[1], web3.toWei(1, 'ether'), { from: accounts[3] });
      } catch (err) {
        errored = true;
      }
      assert.equal(errored, true);
    });

  });

  describe('accepting payments', () => {

    it('should accept payments if pledged', async () => {
      await tse.pledge(accounts[1], web3.toWei(2, 'ether'));
      let value = web3.toWei(1, 'ether');

      await tse.buyTokens(accounts[1], { value: value, from: accounts[3] });

      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(350, "ether"));
    });

    it ('should not accept if no pledge', async () => {

      let errored = false;

      try {
        let value = web3.toWei(1, 'ether');
        await tse.buyTokens(accounts[1], { value: value, from: accounts[3] });
      } catch (err) {
        errored = true;
      }

      assert.equal(errored, true);

      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(0, "ether"));
    });

    it ('should not accept if pledge is too low', async () => {

      await tse.pledge(accounts[1], web3.toWei(2, 'ether'));

      let errored = false;

      try {
        let value = web3.toWei(3, 'ether');
        await tse.buyTokens(accounts[1], { value: value, from: accounts[3] });
      } catch (err) {
        errored = true;
      }

      assert.equal(errored, true);

      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(0, "ether"));
    });

    it ('should accept if pledge is equal', async () => {
      await tse.pledge(accounts[1], web3.toWei(2, 'ether'));
      let value = web3.toWei(2, 'ether');

      await tse.buyTokens(accounts[1], { value: value, from: accounts[3] });

      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(700, "ether"));
    });

  });

  describe('fulfilling purchase', () => {

    it('should send tokens to purchaser via SendTransaction', async () => {
      await tse.pledge(accounts[1], web3.toWei(2, 'ether'));
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[1] })
      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(350, "ether"));
    });

    it('should forward funds to wallet', async () => {
      await tse.pledge(accounts[1], web3.toWei(2, 'ether'));
      let value = web3.toWei(1, "ether");
      //let value = 1;
      const pre = await web3.eth.getBalance(wallet);
      await tse.sendTransaction({ value: value, from: accounts[1] });
      const post = await web3.eth.getBalance(wallet);
      assert.equal(post.toNumber() - pre.toNumber(), value);
    })
  });

});
