pragma solidity ^0.4.24;

import './MindsToken.sol';

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Whitelist.sol'; //until new zeppelin version

contract MindsTokenSaleEvent is Whitelist {

  using SafeMath for uint256;

  // The token being sold
  MindsToken public token;

  // address where funds are collected
  address public wallet;

  // how many mei per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  // outstanding token purchases addresses
  mapping(address => uint256) public outstanding;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param tokens amount of tokens purchased
   */
  event TokenPurchase(address purchaser, uint256 tokens);

  /**
   * Event for token issuance
   * @param purchaser Address who purchased the tokens
   * @param tokens amount of tokens purchased
   */
  event TokenIssue(address purchaser, uint256 tokens);

  /**
   * Event for declining token
   * @param purchaser Address who purchased the tokens
   * @param tokens amount of tokens purchased
   */
  event TokenDecline(address purchaser, uint256 tokens);

  constructor(uint256 _rate, address _wallet, address _token) public {
    require(_rate > 0);
    require(_wallet != address(0));

    token = MindsToken(_token);
    rate = _rate;
    wallet = _wallet;
  }

  // fallback function can be used to buy tokens
  function () external payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // update state
    weiRaised = weiRaised.add(weiAmount);

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // increase outstanding purchases and emit event
    increaseOutstandingPurchases(beneficiary, tokens);

    // send funds
    forwardFunds();

    // send event
    emit TokenPurchase(beneficiary, tokens);
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

  // Issue tokens

  function issue(address beneficiary, uint256 tokens) external 
    onlyIfWhitelisted(msg.sender) {
    
    // check that there is outstanding tokens to issue
    require(areTokensOutstanding(beneficiary, tokens));

    decreaseOutstandingPurchases(beneficiary, tokens);

    // send our tokens
    token.transferFrom(wallet, beneficiary, tokens);
    emit TokenIssue(beneficiary, tokens);
  }

  // Decline the tokens

  function decline(address beneficiary, uint256 tokens) external 
    onlyIfWhitelisted(msg.sender) {
    decreaseOutstandingPurchases(beneficiary, tokens);

    //refund the ETH value
    uint256 weiAmount = tokens.div(rate);
    token.transferFrom(wallet, beneficiary, weiAmount); 
   
    emit TokenDecline(beneficiary, tokens);
  }

  // Check that enough tokens have been purchased

  function areTokensOutstanding(address beneficiary, uint256 tokens) internal returns (bool) {
    bool hasOutstanding = outstanding[beneficiary] > 0;
    bool isValid = tokens > 0;
    bool isEnough = tokens <= outstanding[beneficiary];
    return isValid && isEnough && hasOutstanding;
  }

  // Increase the number of purchased tokens awaiting issuance

  function increaseOutstandingPurchases(address beneficiary, uint256 tokens) internal {
    outstanding[beneficiary] = outstanding[beneficiary].add(tokens);
  }

  // Decrease the number of purchased tokens awaiting issuance

  function decreaseOutstandingPurchases(address beneficiary, uint256 tokens) internal {
    outstanding[beneficiary] = outstanding[beneficiary].sub(tokens);
  }

}
