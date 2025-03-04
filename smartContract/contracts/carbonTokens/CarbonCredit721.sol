// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ICarbonCredit20} from "../interfaces/ICarbonCredit20.sol";
import {ICarbonCredit20Vault} from "../interfaces/ICarbonCredit20Vault.sol";
import {ERC721AQueryableUpgradeable, IERC721AUpgradeable,ERC721AUpgradeable} from "erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol";
import {UupsSet, AccessControlUpgradeable} from "../proxy/UupsSet.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
contract CarbonCredit721 is ReentrancyGuardUpgradeable, ERC721AQueryableUpgradeable, UupsSet {

    // keccak256(abi.encode(uint256(keccak256("CARBON_CREDIT_721_LOCATION")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant CARBON_CREDIT_721_LOCATION = 0xbcc05c61c7d0d195434463965fc0e4773cef5b2831056a0cd4dd5dbb8ec96500;
    
    error NotApproved();
    error NoZeroAmount();

    struct CarbonCredit721Data {
        ICarbonCredit20 carbonCredit20;
        address carbonCredit20Vault;
        string imageURI;
        mapping(uint256=>uint256) creditsById;
    }

    function carbonCredit721Storage() 
        internal 
        pure 
        returns(CarbonCredit721Data storage $) 
    {
        assembly {
           $.slot := CARBON_CREDIT_721_LOCATION 
        }
    }

    function init(
        ICarbonCredit20 _carbonCredit20, 
        address _carbonCredit20Vault,
        address _router,
        string memory _name, 
        string memory _symbol
    ) 
        external 
        initializerERC721A
        initializer
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        $.carbonCredit20 = _carbonCredit20;
        $.carbonCredit20Vault = _carbonCredit20Vault;
        $.imageURI = "ipfs://bafybeic6dzrce7jsqjgxhycks2sufd4xvbiscwiuz6tquqqfpphjwvehoa";
        __ReentrancyGuard_init();
        __ERC721A_init(_name, _symbol);
        __accessControl_init(); 
        _grantRole(CREDIT_BURNER_ROLE, _router);
    }

    function mint(
        address _to, 
        uint256 _creditAmount
    ) 
        external
        nonReentrant
    {
        if(_creditAmount == 0) revert NoZeroAmount();
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        $.carbonCredit20.transferFrom(msg.sender, $.carbonCredit20Vault, _creditAmount);
        $.creditsById[_nextTokenId()] = _creditAmount;
        _safeMint(_to, 1);
    }

    function mintBatch(
        address[] calldata _to,
        uint256[] calldata _creditAmount
    ) 
        external 
    {
        uint256 length = _to.length;
        CarbonCredit721Data storage $ = carbonCredit721Storage(); 
    
        uint256 totalAmount;
        uint256 amount;

        for (uint256 i; i < length; ) {
            amount = _creditAmount[i];
            if (amount == 0) revert NoZeroAmount();
            
            totalAmount += amount; 
            $.creditsById[_nextTokenId()] = amount;
            _mint(_to[i], 1);
    
            unchecked { i++; }
        }
    
        $.carbonCredit20.transferFrom(msg.sender, $.carbonCredit20Vault, totalAmount);
    }
    
    function burn(uint256 tokenId) 
        external 
        virtual 
        onlyRole(CREDIT_BURNER_ROLE)
    {
        _burn(tokenId, true);
    }

    function burnFrom(address _owner, uint256 _tokenId) 
        external 
        virtual 
        onlyRole(CREDIT_BURNER_ROLE)
    {
        if (!(isApprovedForAll(_owner, msg.sender) || getApproved(_tokenId) == msg.sender)) revert NotApproved(); 
        _burn(_tokenId, false);
    }

    function convertToCarbonCredit20(uint256 tokenId) external {
        _burn(tokenId, true);
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        ICarbonCredit20Vault($.carbonCredit20Vault).moveBackCredit20(msg.sender, $.creditsById[tokenId]);
    }

    function setCarbonCredit20(
        ICarbonCredit20 _carbonCredit20
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        $.carbonCredit20 = _carbonCredit20;
    }

    function setCarbonCredit20Vault(
        address _carbonCredit20Vault
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        $.carbonCredit20Vault = _carbonCredit20Vault;
    }

    function setImageURI(
        string calldata _imageURI
    ) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        $.imageURI = _imageURI;
    }

    function tokenURI(
        uint256 tokenId
    ) 
        public 
        view 
        override( 
            IERC721AUpgradeable,
            ERC721AUpgradeable
        )
        returns (string memory metadata) 
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        uint256 creditAmount = $.creditsById[tokenId];
 
        metadata = string(
            abi.encodePacked(
                '{"name": "',name(),' #', Strings.toString(tokenId),
                '", "description": "A Carbon Credit 721 token representing a specific amount of Carbon Credit 20.", "attributes": [{"trait_type": "Carbon Credit", "value": "', Strings.toString(creditAmount),
                '"}], "image":',$.imageURI,'}'
            )
        );
    }

    function carbonCredit20() external view returns(address) {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        return address($.carbonCredit20);
    }

    function carbonCredit20Vault() external view returns(address) {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        return $.carbonCredit20Vault;
    }

    function imageURI() external view returns(string memory) {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        return $.imageURI;
    }

    function creditsById(uint256 _id) external view returns(uint256) {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        return $.creditsById[_id];
    }

    function creditsByIds(
        uint256[] calldata _ids
    ) 
        external 
        view 
        returns(uint256[] memory credits) 
    {
        CarbonCredit721Data storage $ = carbonCredit721Storage();
        uint256 size = _ids.length;
        credits = new uint256[](size);
        for(uint256 i; i < size; i++ ) {
            credits[i] = $.creditsById[i];
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) 
        public 
        view 
        virtual 
        override(
            AccessControlUpgradeable, 
            IERC721AUpgradeable, 
            ERC721AUpgradeable
        ) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}