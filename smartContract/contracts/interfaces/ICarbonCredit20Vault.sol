// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface ICarbonCredit20Vault {
    function moveBackCredit20(address _to, uint256 _amount) external;
}