// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UupsSet} from "../proxy/UupsSet.sol";

contract RouterVault is UupsSet {

    error TransactionFailed();

    function init() external initializer {
        __accessControl_init(); 
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    function withdraw(
        address _to, 
        uint256 _amount
    ) 
        external 
        onlyRole(MANAGER_ROLE)  
    {
       // slither-disable-next-line arbitrary-send-eth
       (bool _isOk,) = _to.call{value:_amount}("");
       if(!_isOk) revert TransactionFailed();
    }

    receive() external payable {}
}