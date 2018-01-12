pragma solidity ^0.4.13;

import './MindsToken.sol';

contract MindsWithdraw {

  struct Withdrawal {
    address requester;
    uint256 user_guid;
    uint256 gas;
    uint256 amount;
  }

  MindsToken public token;
 
  mapping(address => Withdrawal) public requests;

  /**
   * event upon requesting a withdrawal
   * @param requester who requested the withdrawal
   * @param user_guid the minds user guid of the requester
   * @param gas the amount in ethereum that was sent to cover the gas
   * @param amount weis requested
   */
  event WithdrawalRequest(address requester, uint256 user_guid, uint256 gas, uint256 amount);

  /**
   * event upon completing a withdrawal
   * @param requester who requested the withdrawal
   * @param user_guid the minds user guid of the requester
   * @param amount weis requested
   */
  event WithdrawalComplete(address requester, uint256 user_guid, uint256 amount);

  function MindsWithdraw(address _token) {
    token = MindsToken(_token);
  }

  function request(uint256 user_guid, uint256 amount) payable {
    
    uint256 gas = msg.value;

    require(gas > 0);
    require(amount > 0);

    Withdrawal memory _withdrawal = Withdrawal(
      msg.sender,
      user_guid,
      msg.value,
      amount
    );
    
    requests[msg.sender] = _withdrawal;

    WithdrawalRequest(msg.sender, user_guid, msg.value, amount);
  }

  // do nothing if we get sent ether
  function() payable { 
    msg.sender.transfer(msg.value);
  }

  function complete(address requester, uint256 user_guid, uint256 gas, uint256 amount) public returns (bool) {
    
    require(requests[requester].user_guid >= user_guid);
    require(requests[requester].user_guid <= user_guid);

    require(requests[requester].gas >= gas);
    require(requests[requester].gas <= gas);

    require(requests[requester].amount >= amount);
    require(requests[requester].amount <= amount);

    //token.transferFrom(msg.sender, requester, amount);

    WithdrawalComplete(requester, user_guid, amount);
    
    //zero the requested withdrawl amaount
    requests[requester].amount = 0;
  }

}