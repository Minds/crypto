pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract MindsCreatorToken is MintableToken {

    string public constant name = "Minds Creator";
    string public constant symbol = "M/C";
    uint8 public constant decimals = 18;

}