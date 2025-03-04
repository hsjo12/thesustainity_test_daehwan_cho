// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface ICarbonCredit20 {
    function transfer(address _to, uint256 _amount) external;
    function transferFrom(address _from, address _to, uint256 _amount) external;
    function mint(address _to, uint256 _amount) external;
    function burn(uint256 _amount) external;
    function burnFrom(address _from, uint256 _amount) external;
}