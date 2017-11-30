pragma solidity ^0.4.13;

import './MindsToken.sol';

contract MindsPeerBoostStorage {

  struct PeerBoost {
    address sender;
    address receiver;
    uint value;
    bool locked; //if the user has already interacted with
  }

  // Mapping of boosts by guid
  mapping(uint256 => PeerBoost) public boosts;

  function upsert(uint256 guid, address sender, address receiver, uint value, bool locked) public returns (bool) {

    PeerBoost memory _boost = PeerBoost(
      sender,
      receiver,
      value,
      locked
    );

    boosts[guid] = _boost;
    return true;
  }

}