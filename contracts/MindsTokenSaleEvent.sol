pragma solidity ^0.4.13;

import './MindsToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';


contract MindsTokenSaleEvent is Crowdsale {

  function MindsTokenSaleEvent(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _token)
    Crowdsale(_startTime, _endTime, _rate, _wallet) {
      token = MindsToken(_token);
  }

  function createTokenContract() internal returns (MintableToken) {
    return new MindsToken();
  }

}