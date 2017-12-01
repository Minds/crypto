pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract MindsToken is MintableToken {

    string public constant name = "Minds";
    string public constant symbol = "M";
    uint8 public constant decimals = 18;

    /* Approves and then calls the receiving contract */
    function approveAndCall(address _spender, address _destination, uint256 _amount) public returns (bool success) {
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);

        //receiveApproval(address _from, address _to, uint256 _amount, address _tokenContract)
        require(_spender.call(bytes4(bytes32(keccak256("receiveApproval(address,address,uint256,address)"))), msg.sender, _destination, _amount, this));
        return true;
    }

}