pragma solidity ^0.4.13;

import './MindsToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract MindsPeerBoostStorage is Ownable {

  struct PeerBoost {
    address sender;
    address receiver;
    uint value;
    bool locked; //if the user has already interacted with
  }

  // Mapping of boosts by guid
  mapping(uint256 => PeerBoost) public boosts;

  // Allowed contracts
  mapping(address => bool) public contracts;

  /**
   * Save the boost to the storage
   * @param guid The guid of the boost
   * @param sender The sender of the boost
   * @param receiver The receiver of the boost
   * @param value The value of the boost
   * @param locked If the boost is locked or not
   * @return bool
   */
  function upsert(uint256 guid, address sender, address receiver, uint value, bool locked) public returns (bool) {

    //only allow if transaction from an approved contract
    require(contracts[msg.sender]);

    PeerBoost memory _boost = PeerBoost(
      sender,
      receiver,
      value,
      locked
    );

    boosts[guid] = _boost;
    return true;
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