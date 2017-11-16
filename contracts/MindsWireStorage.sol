pragma solidity ^0.4.13;

import './MindsToken.sol';

contract MindsWireStorage {

  struct Wire {
    uint timestamp;
    uint value;
  }

  // Mapping of wires by receiver
  mapping(address => mapping(address => Wire[])) public wires;

  function createWire(address sender, address receiver, uint value) public returns (bool) {

    Wire memory wire = Wire(
      block.timestamp, 
      value
    );

    wires[receiver][sender].push(wire);
    return true;
  }

  function countWires(address receiver, address sender) public returns (uint) {
    return wires[receiver][sender].length;
  }

}