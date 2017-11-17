var MindsToken = artifacts.require("./MindsToken.sol");

contract('MindsToken', (accounts) => {
  let token;

  beforeEach(async () => {
    token = await MindsToken.new();
  });

  it("the first account should have 0 tokens", async () => {
    let balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 0, "The first account has more than 0 tokens");
  });

  it("it should mint 10M ** 18 tokens", async () => {
    let minted = await token.mint(accounts[0], 10000000 * (10**18));
    assert.equal(minted.logs[0].event, 'Mint');

    let total = await token.totalSupply();
    assert.equal(total, 10000000 * (10**18), "Total tokens do not equal 10,000,000,000,000,000,000,000,000");
  });

});
