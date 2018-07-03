pragma solidity ^0.4.13;

import './MindsToken.sol';
import './MindsBoostStorage.sol';

contract MindsBoost {

  struct Boost {
    address sender;
    address receiver;
    uint value;
    uint256 checksum;
    bool locked; //if the user has already interacted with
  }

  MindsToken public token;
  MindsBoostStorage public s;

  /**
   * event for boost being created
   * @param guid - the guid of the boost
   */
  event BoostSent(uint256 guid);

  /**
   * event for boost being accepted
   * @param guid - the guid of the boost
   */
  event BoostAccepted(uint256 guid);

  /**
   * event for boost being rejected
   * @param guid - the guid of the boost
   */
  event BoostRejected(uint256 guid);

  /**
   * event for boost being revoked
   * @param guid - the guid of the boost
   */
  event BoostRevoked(uint256 guid);

  function MindsBoost(address _storage, address _token) {
    s = MindsBoostStorage(_storage);
    token = MindsToken(_token);
  }

  function canIBoost() public constant returns (bool) {
    uint balance = token.balanceOf(msg.sender);
    uint allowed = token.allowance(msg.sender, address(this));

    if (allowed > 0 && balance > 0) {
      return true;
    }

    return false;
  }

  function receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData) public returns (bool) {

    require(msg.sender == address(token));

    uint256 _guid = 0;
    address _receiver = 0x0;
    uint256 _checksum = 0;

    assembly {
      // Load the raw bytes into the respective variables to avoid any sort of costly
      // conversion.
      _checksum := mload(add(_extraData, 0x60))
      _guid := mload(add(_extraData, 0x40))
      _receiver := mload(add(_extraData, 0x20))
    }

    require(_receiver != 0x0);

    return boostFrom(_from, _guid, _receiver, _value, _checksum);
  }

  function boost(uint256 guid, address receiver, uint amount, uint256 checksum) public returns (bool) {
    return boostFrom(msg.sender, guid, receiver, amount, checksum);
  }

  function boostFrom(address sender, uint256 guid, address receiver, uint amount, uint256 checksum) private returns (bool) {

    //make sure our boost is for over 0
    require(amount >= 0);

    Boost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.checksum, _boost.locked) = s.boosts(guid);

    //must not exists
    require(_boost.sender == 0);
    require(_boost.receiver == 0);

    //spend tokens and store here
    token.transferFrom(sender, address(this), amount);

    //allow this contract to spend those tokens later
    token.approve(address(this), amount);

    //store boost
    s.upsert(guid, sender, receiver, amount, checksum, false);

    //send event
    BoostSent(guid);
    return true;
  }

  function accept(uint256 guid) {

    Boost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.checksum, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.receiver == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value,  _boost.checksum, true);

    //send tokens to the receiver
    token.transferFrom(address(this), _boost.receiver, _boost.value);

    //send event
    BoostAccepted(guid);
  }

  function reject(uint256 guid) {
    Boost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.checksum, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.receiver == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value, _boost.checksum, true);

    //send tokens back to sender
    token.transferFrom(address(this), _boost.sender, _boost.value);

    //send event
    BoostRejected(guid);
  }

  function revoke(uint256 guid) {
    Boost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.checksum, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.sender == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value, _boost.checksum, true);

    //send tokens back to sender
    token.transferFrom(address(this), _boost.sender, _boost.value);

    //send event
    BoostRevoked(guid);
  }

}