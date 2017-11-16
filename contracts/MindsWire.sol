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

  function MindsWire(address _storage, address _token) {
    s = MindsWireStorage(_storage);
    token = MindsToken(_token);
  }

  function canIWire() public constant returns (uint) {
    return token.balanceOf(msg.sender);
  }

  function wireTo(address receiver, uint amount) public returns (bool) {
    token.transferFrom(msg.sender, receiver, amount);
    s.createWire(msg.sender, receiver, amount);
    return true;
  }

  function hasSent(address receiver, uint amount) public constant returns (bool) {
    uint total;

    Wire memory _wire;

    uint len = s.countWires(receiver, msg.sender);

    for (uint i = 0; i < len; i++) {
      (_wire.timestamp, _wire.value) = s.wires(receiver, msg.sender, i);
      total += _wire.value;
    }

    if (total >= amount) {
      return true;
    }

    return false;
  }

}