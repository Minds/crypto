var MindsWire = artifacts.require("./MindsWire.sol");
var MindsWireStorage = artifacts.require("./MindsWireStorage.sol");
var MindsToken = artifacts.require("./MindsToken.sol");

contract('MindsWire', (accounts) => {
  let wire,
    storage,
    token,
    sender,
    receiver;

  beforeEach(async () => {
    storage = await MindsWireStorage.new();
    token = await MindsToken.new();
    wire = await MindsWire.new(storage.address, token.address);

    sender = accounts[1];
    receiver = accounts[2];
    //allocate some tokens to our sender
    token.mint(sender, 100);
  });

  it("should send wire to a receiver", async () => {
    //we need to approve funds to the wire contract first
    token.approve(wire.address, 10, { from: sender });

    await wire.wire(receiver, 10, { from: sender });
    assert.equal(await token.balanceOf(receiver), 10);
  });

  it("should send not allow us to send more funds than approved", async () => {
    token.approve(wire.address, 10, { from: sender });

    let err = false;

    try {
      await wire.wire(receiver, 20, { from: sender });
    } catch (e) {
      err = true;
    }

    assert.equal(err, true);
    assert.equal(await token.balanceOf(receiver), 0);
  });

  it("should confirm that a wire was sent within the last month", async () => {
    token.approve(wire.address, 10, { from: sender });
    await wire.wire(receiver, 10, { from: sender });

    let ts = web3.eth.getBlock('latest').timestamp -  (86400 * 30); //30 days ago
    let has = await wire.hasSent(receiver, 10, ts, { from: sender });
    assert.equal(has, true);
  });

  it("should deny that a wire was sent within the last month", async () => {
    let ts = web3.eth.getBlock('latest').timestamp -  (86400 * 30); //30 days ago
    let has = await wire.hasSent(receiver, 10, ts, { from: sender });
    assert.equal(has, false);
  });

  /*it("should deny that a wire was sent within the last month if I sent a wire 32 days ago", async () => {
    let ts = web3.eth.getBlock('latest').timestamp -  (86400 * 32); //32 days ago
    let has = await wire.hasSent(receiver, 10, ts, { from: sender });
    assert.equal(has, false);
  });*/

});
