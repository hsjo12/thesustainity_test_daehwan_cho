// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ICarbonCredit20} from "../interfaces/ICarbonCredit20.sol";
import {UupsSet} from "../proxy/UupsSet.sol";

contract CarbonCredit20Vault is UupsSet {

    // keccak256(abi.encode(uint256(keccak256("CARBON_CREDIT_20_VAULT_LOCATION")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant CARBON_CREDIT_20_VAULT_LOCATION = 0x97621522b778c381691faae1ef61181b820eb92426d7df22f5286bde10e2b900;
    
    struct CarbonCredit721Data {
        ICarbonCredit20 carbonCredit20;
    }

    function carbonCredit20VaultStorage() 
        internal 
        pure 
        returns(CarbonCredit721Data storage $) 
    {
        assembly {
           $.slot := CARBON_CREDIT_20_VAULT_LOCATION 
        }
    }

    function init(
        ICarbonCredit20 _carbonCredit20,
        address _carbonCredit721
    ) 
        external 
        initializer    
    {
        CarbonCredit721Data storage $ = carbonCredit20VaultStorage();
        $.carbonCredit20 = _carbonCredit20;
        __accessControl_init(); 
        _grantRole(CREDIT_WITHDRAWER_ROLE, _carbonCredit721);
    }

    function burnCredit20(
        uint256 _amount
    ) 
        external 
        onlyRole(CREDIT_WITHDRAWER_ROLE)  
    {
        CarbonCredit721Data storage $ = carbonCredit20VaultStorage();
        $.carbonCredit20.burn(_amount);
    }

    function moveBackCredit20(
        address _to,
        uint256 _amount
    ) 
        external 
        onlyRole(CREDIT_WITHDRAWER_ROLE)  
    {
        CarbonCredit721Data storage $ = carbonCredit20VaultStorage();
        $.carbonCredit20.transfer(_to, _amount);
    }

    function carbonCredit20() external view returns(address) {
        CarbonCredit721Data storage $ = carbonCredit20VaultStorage();
        return address($.carbonCredit20);
    }

    function setCarbonCredit20(
        ICarbonCredit20 _carbonCredit20
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        CarbonCredit721Data storage $ = carbonCredit20VaultStorage();
        $.carbonCredit20 = _carbonCredit20;
    }
}