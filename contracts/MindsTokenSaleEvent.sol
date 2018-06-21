pragma solidity ^0.4.13;

import './MindsToken.sol';

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract MindsTokenSaleEvent is Ownable {

  using SafeMath for uint256;

  // The token being sold
  MindsToken public token;

  // address where funds are collected
  address public wallet;

  // how many mei per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  // pledge addresses
  mapping(address => uint256) public pledges;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address purchaser, address beneficiary, uint256 value, uint256 amount);

  /**
   * Event for token pledges
   * @param beneficiary Address who pledged for the tokens
   * @param value Amount of ETH pledged
   */
  event TokenPledge(address beneficiary, uint256 value);

  /**
   * Event for token pledge deducting
   * @param beneficiary Address who pledged for the tokens
   * @param value Amount of ETH deducted
   * @param balance Amount of remaining ETH available to spend
   */
  event TokenPledgeDeduct(address beneficiary, uint256 value, uint256 balance);

  function MindsTokenSaleEvent(uint256 _rate, address _wallet, address _token) {
    require(_rate > 0);
    require(_wallet != address(0));

    token = MindsToken(_token);
    rate = _rate;
    wallet = _wallet;
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // deduct from pledge and emit event
    require(isValuePledged(beneficiary, weiAmount));
    deductFromPledge(beneficiary, weiAmount);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // send our tokens
    token.transferFrom(wallet, beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    // send funds
    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal returns (bool) {
    bool nonZeroPurchase = msg.value > 0;
    return nonZeroPurchase;
  }

  // Pledge

  function pledge(address beneficiary, uint256 value) external onlyOwner {
    pledges[beneficiary] = value;

    // emit event
    TokenPledge(beneficiary, value);
  }

  function hasPledged(address beneficiary) internal returns (bool) {
    return pledges[beneficiary] >= 0;
  }

  function isValuePledged(address beneficiary, uint256 value) internal returns (bool) {
    bool isEnough = value <= pledges[beneficiary];
    return hasPledged(beneficiary) && isEnough;
  }

  function deductFromPledge(address beneficiary, uint256 value) internal {
    pledges[beneficiary] = pledges[beneficiary].sub(value);
    TokenPledgeDeduct(beneficiary, value, pledges[beneficiary]);
  }
}
