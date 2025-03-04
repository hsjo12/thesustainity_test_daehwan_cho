// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC20} from "solady/src/tokens/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
contract CarbonCredit20 is ERC20, AccessControl {

    // keccak256("MANAGER_ROLE")
    bytes32 constant private MANAGER_ROLE = 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08;

    constructor(
        uint256 _initialSupply, 
        address _router
    ) 
    {
        _mint(msg.sender, _initialSupply);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, _router);
    }

    function name() public pure override returns (string memory) {
        return "CarbonCredit20";
    }

    function symbol() public pure override returns (string memory) {
        return "CC20";
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function mint(
        address _to, 
        uint256 _amount
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(msg.sender, _amount);
    }

    function burnFrom(address _from, uint256 _amount) external {
        _spendAllowance(_from, msg.sender, _amount);
        _burn(_from, _amount);
    }

}