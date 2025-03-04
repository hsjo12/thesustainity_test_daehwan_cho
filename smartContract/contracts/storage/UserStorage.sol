// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import {UupsSet} from "../proxy/UupsSet.sol";
import "hardhat/console.sol";
contract UserStorage is UupsSet {

    // keccak256(abi.encode(uint256(keccak256("USER_STORAGE_LOCATION")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant USER_STORAGE_LOCATION = 0x97621522b778c381691faae1ef61181b820eb92426d7df22f5286bde10e2b900;
    
    error AlreadyRegistered();
    error UserNotRegistered();

    struct userInfo {
        uint256 userStartedAt;
        uint256 burntCarbonCredit;
    }

    struct UserStorageData {
        mapping(address=>userInfo) userInfo;
        uint256 speed;
    }

    function userStorageLocation() 
        internal 
        pure 
        returns(
            UserStorageData storage $
        ) 
    {
        assembly {
            $.slot := USER_STORAGE_LOCATION
        }
    }

    function init(
        address _router,
        uint256 _speed
    ) 
        external 
        initializer
    {
        UserStorageData storage $ = userStorageLocation();
        $.speed = _speed;
        __accessControl_init(); 
        _grantRole(CREDIT_BURNER_ROLE, _router);
    }

    function register() external {
        UserStorageData storage $ = userStorageLocation();
        if($.userInfo[msg.sender].userStartedAt != 0) revert AlreadyRegistered();
        $.userInfo[msg.sender].userStartedAt = block.timestamp;
    }

    function userStartedAt(address _user) external view returns(uint256) {
        UserStorageData storage $ = userStorageLocation();
        return $.userInfo[_user].userStartedAt;
    }

    function increaseBurntCarbonCredit(
        address _user,
        uint256 _amount
    ) 
        external 
        onlyRole(CREDIT_BURNER_ROLE) 
    {
        UserStorageData storage $ = userStorageLocation();
        if($.userInfo[_user].userStartedAt == 0) revert UserNotRegistered();
        $.userInfo[_user].burntCarbonCredit += _amount;
    }

    function setSpeed(uint256 _speed) external onlyRole(MANAGER_ROLE) {
        UserStorageData storage $ = userStorageLocation();
        $.speed = _speed;
    }

    function speed() external view returns(uint256) {
        UserStorageData storage $ = userStorageLocation();
        return $.speed;
    }

    function emittedCarbonAmountOf(
        address _user
    ) 
        external 
        view 
        returns (
            uint256 emittedCarbon, 
            uint256 surPlusCarbonCredits,
            uint256 totalBurnedCarbonCredits
        ) 
    {
        UserStorageData storage $ = userStorageLocation();
        userInfo storage _userInfo = $.userInfo[_user];
        uint256 userStartAt = _userInfo.userStartedAt;

        emittedCarbon = (block.timestamp - userStartAt) * $.speed;
        totalBurnedCarbonCredits = _userInfo.burntCarbonCredit;
    
        unchecked {
            if (emittedCarbon > totalBurnedCarbonCredits) {
                emittedCarbon -= totalBurnedCarbonCredits;
                surPlusCarbonCredits = 0;
        
            } else {
                surPlusCarbonCredits = totalBurnedCarbonCredits - emittedCarbon;
                emittedCarbon = 0;
            }
        }
    }
}