// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface ICarbonCredit721 {
    function mint(address _to, uint256 _creditAmount) external;
    function burnFrom(address _owner, uint256 _tokenId) external;
    function creditsById(uint256 _id) external view returns(uint256);
}