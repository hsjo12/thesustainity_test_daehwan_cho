// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {UupsSet} from "../proxy/UupsSet.sol";
import {ICarbonCredit20} from "../interfaces/ICarbonCredit20.sol";
import {ICarbonCredit721} from "../interfaces/ICarbonCredit721.sol";
import {IUserStorage} from "../interfaces/IUserStorage.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
contract Router is UupsSet, ReentrancyGuardUpgradeable {

    // keccak256(abi.encode(uint256(keccak256("ROUTER_STORAGE_LOCATION")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant ROUTER_STORAGE_LOCATION = 0x21ee9d3a16ed29692cd9ba7b5fdf553408a78fa2381c1aba80b44637807eb100;
    
    error tooSmallAmount();
    error insufficientAmount();
    error transactionFailed();

    struct RouterData {
        ICarbonCredit20 carbonCredit20;
        ICarbonCredit721 carbonCredit721;
        IUserStorage userStorage;
        address routerVault;
        uint256 pricePerToken;

    }

    function routerStorage() 
        internal 
        pure 
        returns(RouterData storage $) 
    {
        assembly {
           $.slot := ROUTER_STORAGE_LOCATION 
        }
    }

    function init(
        ICarbonCredit20 _carbonCredit20,
        ICarbonCredit721 _carbonCredit721,
        IUserStorage _userStorage,
        address _routerVault,
        uint256 _pricePerToken
    ) 
        external
        initializer
    {
        RouterData storage $ =routerStorage();
        $.carbonCredit20 = _carbonCredit20;
        $.carbonCredit721 = _carbonCredit721;
        $.userStorage = _userStorage;
        $.routerVault = _routerVault;
        $.pricePerToken = _pricePerToken;
        __accessControl_init(); 
        __ReentrancyGuard_init();
        _grantRole(CREDIT_BURNER_ROLE, address(_carbonCredit20));
        _grantRole(CREDIT_BURNER_ROLE, address(_carbonCredit721));
    }

    function buyCredit20() external payable nonReentrant {
        RouterData storage $ = routerStorage();

        uint256 tokenAmount = (msg.value * 1e18) / $.pricePerToken;
        if (msg.value == 0 || tokenAmount == 0) revert tooSmallAmount();
        
        $.carbonCredit20.mint(msg.sender, tokenAmount);

        (bool _isOk,) = $.routerVault.call{value:msg.value}(""); 
        if (!_isOk) revert transactionFailed();   
    }

    function burnCredit20(uint256 _amount) external {
        RouterData storage $ = routerStorage();
        $.carbonCredit20.burnFrom(msg.sender, _amount);
        $.userStorage.increaseBurntCarbonCredit(msg.sender, _amount);
    }

    function burnCredit721(uint256 _id) external {
        RouterData storage $ = routerStorage();
        uint256 _credit = $.carbonCredit721.creditsById(_id);
        $.carbonCredit721.burnFrom(msg.sender, _id);
        $.userStorage.increaseBurntCarbonCredit(msg.sender, _credit);
    }

    function carbonCredit20() external view returns(address) {
        RouterData storage $ = routerStorage();
        return address($.carbonCredit20);
    }

    function carbonCredit721() external view returns(address) {
        RouterData storage $ = routerStorage();
        return address($.carbonCredit721);
    }

    function pricePerToken() external view returns(uint256) {
        RouterData storage $ = routerStorage();
        return $.pricePerToken;
    }

    function setCarbonCredit20(
        ICarbonCredit20 _carbonCredit20
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        RouterData storage $ = routerStorage();
        $.carbonCredit20 = _carbonCredit20;
    }

    function setCarbonCredit721(
        ICarbonCredit721 _carbonCredit721
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        RouterData storage $ = routerStorage();
        $.carbonCredit721 = _carbonCredit721;
    }

    function setPricePerToken(
        uint256 _pricePerToken
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        RouterData storage $ = routerStorage();
        $.pricePerToken = _pricePerToken;
    }
}