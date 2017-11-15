pragma solidity ^0.4.13;

import './MindsToken.sol';
import './MindsWireStorage.sol';

contract MindsWire {

  struct Wire {
    uint timestamp;
    uint value;
  }

  MindsWireStorage public s;

  function MindsWire(address _storage) {
    s = MindsWireStorage(_storage);
  }

  function wireTo(address receiver, uint amount) public returns (bool) {
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

    if (total > amount) {
      return true;
    }

    return false;
  }

}