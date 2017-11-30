pragma solidity ^0.4.13;

import './MindsToken.sol';
import './MindsPeerBoostStorage.sol';

contract MindsPeerBoost {

  struct PeerBoost {
    address sender;
    address receiver;
    uint value;
    bool locked; //if the user has already interacted with
  }

  MindsToken public token;
  MindsPeerBoostStorage public s;

  /**
   * event for boost being created
   * @param guid - the guid of the boost
   */
  event PeerBoostSent(uint256 guid);

  /**
   * event for boost being accepted
   * @param guid - the guid of the boost
   */
  event PeerBoostAccepted(uint256 guid);

  /**
   * event for boost being rejected
   * @param guid - the guid of the boost
   */
  event PeerBoostRejected(uint256 guid);

  /**
   * event for boost being revoked
   * @param guid - the guid of the boost
   */
  event PeerBoostRevoked(uint256 guid);

  function MindsPeerBoost(address _storage, address _token) {
    s = MindsPeerBoostStorage(_storage);
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

  function boost(uint256 guid, address receiver, uint amount) public returns (bool) {
    //spend tokens and store here
    token.transferFrom(msg.sender, address(this), amount);

    //allow this contract to spend those tokens later
    token.approve(address(this), amount);

    //store boost
    s.upsert(guid, msg.sender, receiver, amount, false);

    //send event
    PeerBoostSent(guid);
    return true;
  }

  function accept(uint256 guid) {

    PeerBoost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.receiver == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value, true);

    //send tokens to the receiver
    token.transferFrom(address(this), _boost.receiver, _boost.value);

    //send event
    PeerBoostAccepted(guid);
  }

  function reject(uint256 guid) {
    PeerBoost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.receiver == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value, true);

    //send tokens back to sender
    token.transferFrom(address(this), _boost.sender, _boost.value);

    //send event
    PeerBoostRejected(guid);
  }

  function revoke(uint256 guid) {
    PeerBoost memory _boost;

    //get the boost
    (_boost.sender, _boost.receiver, _boost.value, _boost.locked) = s.boosts(guid);

    //do not do anything if we've aleady started accepting/rejecting
    require(_boost.locked == false);

    //check the receiver is the person accepting
    require(_boost.sender == msg.sender);
    
    //lock
    s.upsert(guid, _boost.sender, _boost.receiver, _boost.value, true);

    //send tokens back to sender
    token.transferFrom(address(this), _boost.sender, _boost.value);

    //send event
    PeerBoostRevoked(guid);
  }

}