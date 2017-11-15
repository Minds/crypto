pragma solidity ^0.4.13;

import './MindsToken.sol';
import './MindsSupporterToken.sol';


contract MindsWire {

  struct Wire {
    uint timestamp;
    uint value;
    
  }

  // Mapping of creators to their wires
  mapping(address => Wire[]) creators;

  // Mapping of supporters to their wires
  mapping(address =>  Wire[]) supporters;


  //function send(address creator, uint256 value) {
  //  bool transfered = transferTokensToCreator(creator, value);

  //  if (transfered) {
  //    createSupporterToken(creator);
  //  }
  //}

  //function transferTokensToCreator(address creator, uint256 value) returns (bool) {
    //MindsToken token = new MindsToken();
    //return token.transfer(creator, value);
  //}

  function test() public returns (bool) {
    supporters[msg.sender][msg.sender].push(Wire(block.timestamp, 1));
    return true;
  }
  
  function countWires() public constant returns (uint) {
    return supporters[msg.sender][msg.sender].length;
  }

  //function 

  function createSupporterToken(address creator) {
    MindsSupporterToken st = new MindsSupporterToken();
    st.create(creator);
  }


}