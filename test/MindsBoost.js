var MindsBoost = artifacts.require("./MindsBoost.sol");
var MindsBoostStorage = artifacts.require("./MindsBoostStorage.sol");
var MindsToken = artifacts.require("./MindsToken.sol");

var increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
var padding = require('./helpers/padding');
const abi = require('ethereumjs-abi');

contract('MindsBoost', (accounts) => {
  let boost,
    storage,
    token,
    sender,
    receiver,
    other;

  beforeEach(async () => {
    storage = await MindsBoostStorage.new();
    token = await MindsToken.new();
    boost = await MindsBoost.new(storage.address, token.address);

    sender = accounts[1];
    receiver = accounts[2];
    other = accounts[3];
    //allocate some tokens to our sender
    token.mint(sender, 100);

    //set the storage to allow for boost contract to store
    await storage.modifyContracts(boost.address, true);
  });

  it("should send boost to a receiver via approveAndCall", async () => {

    const bytes = [
      abi.rawEncode(['uint256'], [0x80]).toString('hex'),
      abi.rawEncode(['uint256'], [0x40]).toString('hex'),
      padding.left(receiver.slice(2), 64), //receiver address
      abi.rawEncode(['uint256'], [ 123 ]).toString('hex') //guid
    ].join('');

    await token.approveAndCall(boost.address, 10, '0x' + bytes, { from: sender });

    assert.equal(await token.balanceOf(boost.address), 10);

    let _boost = await storage.boosts(123);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 10);
    assert.equal(_boost[3], false);

  });

  it("should send boost to a receiver", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 10, { from: sender });

    await boost.boost(123, receiver, 10, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 10);

    let _boost = await storage.boosts(123);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 10);
    assert.equal(_boost[3], false);

  });

  it("should not send boost with the same guid", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 10, { from: sender });

    await boost.boost(2123, receiver, 1, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 1);

    let _boost = await storage.boosts(2123);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 1);
    assert.equal(_boost[3], false);

    let err = false;

    try {
      await boost.boost(2123, receiver, 5, { from: sender });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

  });

  it("should revoke a boost", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 20, { from: sender });

    await boost.boost(223, receiver, 20, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 20);

    await boost.revoke(223, { from: sender });

    let _boost = await storage.boosts(223);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 20);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 100);

  });

  it("should not revoke a boost if we do not own it", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 20, { from: sender });

    await boost.boost(1223, receiver, 20, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 20);

    let err = false;

    try {
      await boost.revoke(1223, { from: other });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(1223);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 20);
    assert.equal(_boost[3], false);

    assert.equal(await token.balanceOf(boost.address), 20);
    assert.equal(await token.balanceOf(sender), 80);
    assert.equal(await token.balanceOf(receiver), 0);

  });

  it("should not revoke a boost twice", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 20, { from: sender });

    await boost.boost(2223, receiver, 20, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 20);

    await boost.revoke(2223, { from: sender });

    let err = false;

    try {
      await boost.revoke(2223, { from: sender });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(2223);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 20);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 100);
    assert.equal(await token.balanceOf(receiver), 0);

  });

  it("should accept a boost", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 30, { from: sender });

    await boost.boost(323, receiver, 30, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 30);

    await boost.accept(323, { from: receiver });

    let _boost = await storage.boosts(323);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 30);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 70);
    assert.equal(await token.balanceOf(receiver), 30);

  });

  it("should not accept a boost if that wasn't sent to us", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 30, { from: sender });

    await boost.boost(1323, receiver, 30, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 30);

    let err = false;

    try {
      await boost.accept(1323, { from: other });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(1323);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 30);
    assert.equal(_boost[3], false);

    assert.equal(await token.balanceOf(boost.address), 30);
    assert.equal(await token.balanceOf(sender), 70);
    assert.equal(await token.balanceOf(receiver), 0);

  });

  it("should not accept a boost twice", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 30, { from: sender });

    await boost.boost(2323, receiver, 30, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 30);

    await boost.accept(2323, { from: receiver });

    let err = false;
    try {
      await boost.accept(2323, { from: receiver });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(2323);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 30);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 70);
    assert.equal(await token.balanceOf(receiver), 30);

  });

  it("should reject a boost", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 40, { from: sender });

    await boost.boost(423, receiver, 40, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 40);

    await boost.reject(423, { from: receiver });

    let _boost = await storage.boosts(423);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 40);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 100);
    assert.equal(await token.balanceOf(receiver), 0);

  });

  it("should not reject a boost that wasn't sent to us", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 40, { from: sender });

    await boost.boost(1423, receiver, 40, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 40);

    let err = false;

    try {
      await boost.reject(1423, { from: other });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(1423);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 40);
    assert.equal(_boost[3], false);

    assert.equal(await token.balanceOf(boost.address), 40);
    assert.equal(await token.balanceOf(sender), 60);
    assert.equal(await token.balanceOf(receiver), 0);

  });

  it("should not reject a boost twice", async () => {
    //we need to approve funds to the boost contract first
    token.approve(boost.address, 40, { from: sender });

    await boost.boost(2423, receiver, 40, { from: sender });
    assert.equal(await token.balanceOf(boost.address), 40);

    await boost.reject(2423, { from: receiver });

    let err = false;

    try {
      await boost.reject(2423, { from: receiver });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);

    let _boost = await storage.boosts(2423);
    assert.equal(_boost[0], sender);
    assert.equal(_boost[1], receiver);
    assert.equal(_boost[2].toNumber(), 40);
    assert.equal(_boost[3], true);

    assert.equal(await token.balanceOf(boost.address), 0);
    assert.equal(await token.balanceOf(sender), 100);
    assert.equal(await token.balanceOf(receiver), 0);

  });

});
