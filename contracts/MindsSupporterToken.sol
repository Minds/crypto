pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract MindsSupporterToken is MintableToken {

    string public constant name = "Minds Supporter";
    string public constant symbol = "M/S";
    uint8 public constant decimals = 18;
    address public creator_address;

    function create(address creator) {
        creator_address = creator;
        mint(msg.sender, 1);
    }

}