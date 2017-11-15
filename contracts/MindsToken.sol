pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract MindsToken is MintableToken {

    string public constant name = "Minds";
    string public constant symbol = "M";
    uint8 public constant decimals = 18;

}