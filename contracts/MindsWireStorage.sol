pragma solidity ^0.4.13;

import './MindsToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract MindsWireStorage is Ownable {

  struct Wire {
    uint timestamp;
    uint value;
  }

  // Mapping of wires by receiver
  mapping(address => mapping(address => Wire[])) public wires;

  // Allowed contracts
  mapping(address => bool) public contracts;

  /**
   * Insert the wire to the storage
   * @param sender The sender
   * @param receiver The receiver
   * @param value The value of the wire
   * @return bool
   */
  function insert(address sender, address receiver, uint value) public returns (bool) {

    //only allow if transaction from an approved contract
    require(contracts[msg.sender]);

    Wire memory wire = Wire(
      block.timestamp, 
      value
    );

    wires[receiver][sender].push(wire);
    return true;
  }

  /**
   * Return the count of wires
   * @param receiver The receiver
   * @param sender The sender
   * @return uint
   */
  function countWires(address receiver, address sender) public returns (uint) {
    return wires[receiver][sender].length;
  }

  /**
   * Modify the allowed contracts that can write to this contract
   * @param addr The address of the contract
   * @param allowed True/False
   */
  function modifyContracts(address addr, bool allowed) public onlyOwner {
    contracts[addr] = allowed;
  }

}