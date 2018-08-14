var MindsWithdraw = artifacts.require("./MindsWithdraw.sol");
var MindsToken = artifacts.require("./MindsToken.sol");

var increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
var padding = require('./helpers/padding');
const abi = require('ethereumjs-abi');

contract('MindsWithdraw', (accounts) => {
  let withdraw,
    token,
    forwardAddress,
    requester,
    minds;

  beforeEach(async () => {
    token = await MindsToken.new();
    forwardAddress = accounts[5];
    withdraw = await MindsWithdraw.new(token.address, forwardAddress);

    requester = accounts[1];
    minds = accounts[2];
    //allocate some tokens to Minds
    token.mint(minds, 100000);
  });

  it("should allow a withdrawal request", async () => {

    await withdraw.request(123123, 10, { from: requester, value: 50, gas: 1000000 }); //requesting 10 minds tokens be paid out

    let evt = withdraw.WithdrawalRequest({},{fromBlock: 0, toBlock: 'latest'});
    await new Promise((resolve, reject) => {
      evt.watch((err, res) => {
        if (!err) {
          assert.equal(res.args.requester, requester);
          assert.equal(res.args.user_guid, 123123);
          assert.equal(res.args.amount, 10);
          assert.equal(res.args.gas, 50);
          resolve();
        } else {
          reject(err);
        }
      });
    });

  });

  it ("should forward ETH sent to our forwardAddress", async () => {

    let balance = await web3.eth.getBalance(accounts[5]);

    await withdraw.request(123123, 10, { 
      from: requester,
      value: 50,
      gas: 1000000 
    });

    let actualBalance = await web3.eth.getBalance(accounts[5]);
    let expectedBalance = balance.add(50);

    assert.equal(actualBalance.toString(), expectedBalance.toString());

  });

  it("should issue withdrawl request", async () => {
    token.approve(withdraw.address, 100000, { from: minds });

    await withdraw.request(123123, 10, { from: requester, value: 50 }); //requesting 10 minds tokens be paid out    
    await withdraw.complete(requester, 123123, 50, 10, { from: minds });

    let evt = withdraw.WithdrawalComplete({},{fromBlock: 0, toBlock: 'latest'});
    await new Promise((resolve, reject) => {
      evt.watch((err, res) => {
        if (!err) {
          assert.equal(res.args.requester, requester);
          assert.equal(res.args.user_guid, 123123);
          assert.equal(res.args.amount, 10);
          resolve();
        } else {
          reject(err);
        }
      });
    });

  });

});
