// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

abstract contract UupsSet is AccessControlUpgradeable, UUPSUpgradeable {
    
    // keccak256("MANAGER_ROLE")
    bytes32 constant MANAGER_ROLE = 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08; 
    // keccak256("CREDIT_WITHDRAWER_ROLE")
    bytes32 constant CREDIT_WITHDRAWER_ROLE = 0xe964ec5cf39a6e0445036d53c706e8c2f5eef2d81603ffea17e06e2db4b943b2;
    // keccak256("CREDIT_BURNER_ROLE")
    bytes32 constant CREDIT_BURNER_ROLE = 0xc1afd8425b8b41464386646c3e1045d33b9103e915d44771f2b8986b8c964dc5;


    function __accessControl_init() 
        internal 
        onlyInitializing
    {
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function upgradeToAndCall(
        address newImplementation, 
        bytes memory data
    ) 
        public 
        payable 
        override 
        onlyProxy 
        onlyRole(MANAGER_ROLE)
    {
        super.upgradeToAndCall(newImplementation, data);
    }

    function _authorizeUpgrade(address newImplementation) 
        internal 
        virtual 
        override {}

}