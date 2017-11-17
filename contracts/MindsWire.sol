pragma solidity ^0.4.13;

import './MindsToken.sol';
import './MindsWireStorage.sol';

contract MindsWire {

  struct Wire {
    uint timestamp;
    uint value;
  }

  MindsToken public token;
  MindsWireStorage public s;

  /**
   * event for wire sending
   * @param sender who sent the wire
   * @param receiver who receive the wire
   * @param amount weis sent
   */
  event WireSent(address sender, address receiver, uint256 amount);

  function MindsWire(address _storage, address _token) {
    s = MindsWireStorage(_storage);
    token = MindsToken(_token);
  }

  function canIWire() public constant returns (bool) {
    uint balance = token.balanceOf(msg.sender);
    uint allowed = token.allowance(msg.sender, address(this));

    if (allowed > 0 && balance > 0) {
      return true;
    }

    return false;
  }

  function wire(address receiver, uint amount) public returns (bool) {
    token.transferFrom(msg.sender, receiver, amount);
    s.createWire(msg.sender, receiver, amount);
    WireSent(msg.sender, receiver, amount);
    return true;
  }

  function hasSent(address receiver, uint amount, uint timestamp) public constant returns (bool) {
    uint total;

    Wire memory _wire;

    uint len = s.countWires(receiver, msg.sender);

    for (uint i = 0; i < len; i++) {
      (_wire.timestamp, _wire.value) = s.wires(receiver, msg.sender, i);

      if (_wire.timestamp >= timestamp) {
        total += _wire.value;
      }
    }

    if (total >= amount) {
      return true;
    }

    return false;
  }

}