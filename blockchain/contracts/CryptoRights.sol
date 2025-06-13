// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CryptoRights
 * @dev Main contract for the CryptoRights platform
 * Allows creators to tokenize their content as NFTs and manage licensing
 */
contract CryptoRights is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Fee percentage for the platform (in basis points, 100 = 1%)
    uint256 private platformFeePercentage = 250; // 2.5% fee
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) private _creators;
    
    // Mapping from token ID to royalty percentage (in basis points)
    mapping(uint256 => uint256) private _royaltyPercentages;
    
    // Mapping from token ID to content type (1=text, 2=music, 3=image, 4=video)
    mapping(uint256 => uint8) private _contentTypes;
    
    // Mapping from token ID to premium content access price
    mapping(uint256 => uint256) private _premiumPrices;
    
    // Mapping from token ID to whether premium content is available
    mapping(uint256 => bool) private _hasPremiumContent;
    
    // Mapping for user subscriptions to premium content
    mapping(address => mapping(uint256 => bool)) private _premiumAccess;
    
    // Events
    event ContentMinted(uint256 indexed tokenId, address indexed creator, string contentURI, uint8 contentType);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, address indexed buyer, uint256 amount);
    event PremiumAccessPurchased(uint256 indexed tokenId, address indexed user);
    
    constructor() ERC721("CryptoRights", "CRIGHT") Ownable(msg.sender) {}
    
    // Override functions to resolve inheritance conflicts
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Mints a new token for content
     * @param contentURI IPFS URI pointing to content metadata
     * @param royaltyPercentage Royalty percentage in basis points (100 = 1%)
     * @param contentType Type of content (1=text, 2=music, 3=image, 4=video)
     * @param hasPremium Whether this content has premium version
     * @param premiumPrice Price to access premium content (in wei)
     */
    function mintContent(
        string memory contentURI, 
        uint256 royaltyPercentage,
        uint8 contentType,
        bool hasPremium,
        uint256 premiumPrice
    ) public returns (uint256) {
        require(royaltyPercentage <= 3000, "Royalty cannot exceed 30%");
        require(contentType >= 1 && contentType <= 4, "Invalid content type");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, contentURI);
        
        _creators[newTokenId] = msg.sender;
        _royaltyPercentages[newTokenId] = royaltyPercentage;
        _contentTypes[newTokenId] = contentType;
        
        if (hasPremium) {
            _hasPremiumContent[newTokenId] = true;
            _premiumPrices[newTokenId] = premiumPrice;
        }
        
        emit ContentMinted(newTokenId, msg.sender, contentURI, contentType);
        
        return newTokenId;
    }
    
    /**
     * @dev Secondary sale with royalty distribution
     * @param tokenId Token ID to purchase
     */
    function purchaseContent(uint256 tokenId) public payable nonReentrant {
        address owner = ownerOf(tokenId);
        require(msg.sender != owner, "You already own this content");
        require(msg.value > 0, "Price must be greater than 0");
        
        address creator = _creators[tokenId];
        uint256 royaltyPercentage = _royaltyPercentages[tokenId];
        
        // Calculate royalty and platform fee
        uint256 royaltyAmount = (msg.value * royaltyPercentage) / 10000;
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 sellerAmount = msg.value - royaltyAmount - platformFee;
        
        // Transfer payments
        (bool successCreator, ) = payable(creator).call{value: royaltyAmount}("");
        require(successCreator, "Failed to send royalty to creator");
        
        (bool successOwner, ) = payable(owner).call{value: sellerAmount}("");
        require(successOwner, "Failed to send payment to owner");
        
        (bool successPlatform, ) = payable(owner()).call{value: platformFee}("");
        require(successPlatform, "Failed to send fee to platform");
        
        // Transfer NFT ownership
        _transfer(owner, msg.sender, tokenId);
        
        emit RoyaltyPaid(tokenId, creator, msg.sender, royaltyAmount);
    }
    
    /**
     * @dev Purchase access to premium content
     * @param tokenId Token ID of the content
     */
    function purchasePremiumAccess(uint256 tokenId) public payable nonReentrant {
        require(_hasPremiumContent[tokenId], "No premium content available");
        require(msg.value >= _premiumPrices[tokenId], "Insufficient payment");
        require(!_premiumAccess[msg.sender][tokenId], "Already have access");
        
        address creator = _creators[tokenId];
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Transfer payments
        (bool successCreator, ) = payable(creator).call{value: creatorAmount}("");
        require(successCreator, "Failed to send payment to creator");
        
        (bool successPlatform, ) = payable(owner()).call{value: platformFee}("");
        require(successPlatform, "Failed to send fee to platform");
        
        // Grant access
        _premiumAccess[msg.sender][tokenId] = true;
        
        emit PremiumAccessPurchased(tokenId, msg.sender);
    }
    
    /**
     * @dev Check if a user has premium access to content
     * @param user Address of the user
     * @param tokenId Token ID of the content
     */
    function hasPremiumAccess(address user, uint256 tokenId) public view returns (bool) {
        // Owner always has access
        if (ownerOf(tokenId) == user) {
            return true;
        }
        
        return _premiumAccess[user][tokenId];
    }
    
    /**
     * @dev Get creator address for a token
     * @param tokenId Token ID
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        return _creators[tokenId];
    }
    
    /**
     * @dev Get content details
     * @param tokenId Token ID
     */
    function getContentDetails(uint256 tokenId) public view returns (
        address creator,
        uint256 royaltyPercentage,
        uint8 contentType,
        bool hasPremiumContent,
        uint256 premiumPrice
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        creator = _creators[tokenId];
        royaltyPercentage = _royaltyPercentages[tokenId];
        contentType = _contentTypes[tokenId];
        hasPremiumContent = _hasPremiumContent[tokenId];
        premiumPrice = _premiumPrices[tokenId];
    }
    
    /**
     * @dev Update platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Update premium content price
     * @param tokenId Token ID
     * @param newPrice New price for premium access
     */
    function updatePremiumPrice(uint256 tokenId, uint256 newPrice) public {
        require(msg.sender == _creators[tokenId], "Only creator can update price");
        _premiumPrices[tokenId] = newPrice;
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Failed to withdraw");
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId Token ID
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
} 