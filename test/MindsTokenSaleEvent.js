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
    await tse.addAddressToWhitelist(accounts[1]);
  });

  describe('accepting purchases', () => {

    it ('should accept a purchase', async () => {
      await tse.buyTokens(accounts[1], { 
        value: web3.toWei(1, 'ether'),
        from: accounts[3],
      });

      let outstanding = await tse.outstanding.call(accounts[1]);
      assert.equal(outstanding.toNumber(), web3.toWei(350, "ether"));
    });

    it ('should not accept a purchase is 0', async () => {
      let errored = false;
      try {
        await tse.buyTokens(accounts[1], { 
          value: web3.toWei(0, 'ether'),
          from: accounts[3],
        });
      } catch (err) {
        errored = true;
      }
      assert.equal(errored, true);
    });

    it('should send tokens to purchaser via SendTransaction', async () => {
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[1] })

      let outstanding = await tse.outstanding.call(accounts[1]);
      assert.equal(outstanding, web3.toWei(350, "ether"));
    });

  });

  describe('issuing tokens', () => {

    it('should issue tokens if purchase is made', async () => {
      await tse.buyTokens(accounts[3], { 
        value: web3.toWei(2, 'ether'),
        from: accounts[3],
      });

      let value = web3.toWei(700, 'ether');

      await tse.issue(accounts[3], value, { from: accounts[1] });

      let balance = await token.balanceOf(accounts[3]);
      assert.equal(balance, value);
    });

    it ('should not issue if no outstanding purchase', async () => {

      let errored = false;

      try {
        let value = web3.toWei(1, 'ether');
        await tse.issue(accounts[1], value * rate);
      } catch (err) {
        errored = true;
      }

      assert.equal(errored, true);

      let balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, web3.toWei(0, "ether"));
    });

    it('should not issue tokens if not whitelisted', async () => {
      let errored = false;

      await tse.buyTokens(accounts[3], { 
        value: web3.toWei(2, 'ether'),
        from: accounts[3],
      });

      let value = web3.toWei(700, 'ether');

      try {
        await tse.issue(accounts[3], value, { from: accounts[2] });
      } catch (e) {
        errored = true;
      }

      assert.equal(errored, true);

      let balance = await token.balanceOf(accounts[3]);
      assert.equal(balance, 0);
    });

  });

  describe('increasing purchase', () => {

    it('should increase outstanding via SendTransaction', async () => {
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[1] })

      let outstanding = await tse.outstanding.call(accounts[1]);
      assert.equal(outstanding, web3.toWei(350, "ether"));

      //increase

      await tse.sendTransaction({ value: value, from: accounts[1] })

      let newOutstanding = await tse.outstanding.call(accounts[1]);
      assert.equal(newOutstanding, web3.toWei(700, "ether"));
    });

  });

  describe('refunding purchase', () => {

    it('should decrease outstanding', async () => {
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[3] })

      let outstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(outstanding.toNumber(), web3.toWei(350, "ether"));
      
      await tse.decline(accounts[3], web3.toWei(350, "ether"), { from: accounts[1] });

      let newOutstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(newOutstanding.toNumber(), web3.toWei(0, "ether"));
    });

    /*it('should refund ETH', async () => {

      let ethBalance = web3.eth.getBalance(accounts[3]);

      let value = web3.toWei(1, "ether");
      const receipt = await tse.sendTransaction({ value: value, from: accounts[3] })
      const gasUsed = receipt.receipt.gasUsed;

      assert.equal(web3.eth.getBalance(accounts[3]), ethBalance.sub(value).sub(gasUsed));

      let outstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(outstanding.toNumber(), web3.toWei(350, "ether"));
      
      await tse.decline(accounts[3], web3.toWei(350, "ether"), { from: accounts[1] });

      let newOutstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(newOutstanding.toNumber(), web3.toWei(0, "ether"));
    });*/

    it('should not decrease outstanding if not whitelist', async () => {
      let value = web3.toWei(1, "ether");
      await tse.sendTransaction({ value: value, from: accounts[3] })

      let outstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(outstanding.toNumber(), web3.toWei(350, "ether"));

      let errored = false;
      try {      
        await tse.decline(accounts[3], web3.toWei(350, "ether"), { from: accounts[3] });
      } catch (err) {
        errored = true;
      }

      assert.equal(errored, true);

      let newOutstanding = await tse.outstanding.call(accounts[3]);
      assert.equal(newOutstanding.toNumber(), web3.toWei(350, "ether"));
    });

  });

});
