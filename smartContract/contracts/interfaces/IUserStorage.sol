// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface IUserStorage {
    function increaseBurntCarbonCredit(address _to, uint256 _amount) external;
}