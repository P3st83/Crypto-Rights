// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CryptoRights.sol";

/**
 * @title CryptoRightsAuction
 * @dev Contract for auctioning exclusive content NFTs
 */
contract CryptoRightsAuction is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 private platformFeePercentage = 250; // 2.5% fee
    
    // Reference to the main CryptoRights contract
    CryptoRights private cryptoRights;
    
    // Auction structure
    struct Auction {
        uint256 tokenId;
        address creator;
        uint256 startingPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool ended;
        bool claimed;
    }
    
    // Counter for auction IDs
    Counters.Counter private _auctionIds;
    
    // Mapping of auction ID to auction details
    mapping(uint256 => Auction) private _auctions;
    
    // Mapping of creator to their auction IDs
    mapping(address => uint256[]) private _creatorAuctions;
    
    // Mapping to keep track of pending returns for outbid bidders
    mapping(address => mapping(uint256 => uint256)) private _pendingReturns;
    
    // Events
    event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, address indexed creator, uint256 startingPrice, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId);
    event NFTClaimed(uint256 indexed auctionId, address indexed winner, uint256 indexed tokenId);
    
    /**
     * @dev Constructor
     * @param cryptoRightsAddress Address of the CryptoRights contract
     */
    constructor(address cryptoRightsAddress) Ownable(msg.sender) {
        cryptoRights = CryptoRights(cryptoRightsAddress);
    }
    
    /**
     * @dev Create a new auction for an NFT
     * @param tokenId Token ID of the NFT to auction
     * @param startingPrice Starting bid price in wei
     * @param durationHours Duration of the auction in hours
     */
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 durationHours
    ) public returns (uint256) {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(durationHours > 0, "Duration must be greater than 0");
        require(cryptoRights.getCreator(tokenId) == msg.sender, "Only the creator can auction this content");
        require(cryptoRights.ownerOf(tokenId) == msg.sender, "You don't own this token");
        
        // Approve transfer to this contract
        cryptoRights.approve(address(this), tokenId);
        
        // Create auction
        _auctionIds.increment();
        uint256 newAuctionId = _auctionIds.current();
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (durationHours * 1 hours);
        
        Auction memory newAuction = Auction({
            tokenId: tokenId,
            creator: msg.sender,
            startingPrice: startingPrice,
            startTime: startTime,
            endTime: endTime,
            highestBidder: address(0),
            highestBid: 0,
            ended: false,
            claimed: false
        });
        
        _auctions[newAuctionId] = newAuction;
        _creatorAuctions[msg.sender].push(newAuctionId);
        
        emit AuctionCreated(newAuctionId, tokenId, msg.sender, startingPrice, endTime);
        
        return newAuctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction
     */
    function placeBid(uint256 auctionId) public payable nonReentrant {
        Auction storage auction = _auctions[auctionId];
        
        require(!auction.ended, "Auction already ended");
        require(block.timestamp < auction.endTime, "Auction expired");
        require(msg.sender != auction.creator, "Creator cannot bid on own auction");
        require(msg.value > auction.startingPrice, "Bid must be higher than starting price");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");
        
        // Refund the previous highest bidder
        if (auction.highestBidder != address(0)) {
            _pendingReturns[auction.highestBidder][auctionId] += auction.highestBid;
        }
        
        // Update auction with new highest bid
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction and transfer funds to the creator
     * @param auctionId ID of the auction to end
     */
    function endAuction(uint256 auctionId) public nonReentrant {
        Auction storage auction = _auctions[auctionId];
        
        require(!auction.ended, "Auction already ended");
        require(
            msg.sender == auction.creator || 
            msg.sender == owner() || 
            block.timestamp >= auction.endTime, 
            "Only creator, owner, or timeout can end auction"
        );
        
        auction.ended = true;
        
        // If there were no bids, no transfer occurs
        if (auction.highestBidder != address(0)) {
            // Calculate fees
            uint256 platformFee = (auction.highestBid * platformFeePercentage) / 10000;
            uint256 creatorAmount = auction.highestBid - platformFee;
            
            // Transfer platform fee
            (bool successPlatform, ) = payable(owner()).call{value: platformFee}("");
            require(successPlatform, "Failed to send fee to platform");
            
            // Transfer payment to creator
            (bool successCreator, ) = payable(auction.creator).call{value: creatorAmount}("");
            require(successCreator, "Failed to send payment to creator");
            
            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            emit AuctionEnded(auctionId, address(0), 0);
        }
    }
    
    /**
     * @dev Claim an NFT after winning an auction
     * @param auctionId ID of the auction
     */
    function claimNFT(uint256 auctionId) public nonReentrant {
        Auction storage auction = _auctions[auctionId];
        
        require(auction.ended, "Auction not ended yet");
        require(!auction.claimed, "NFT already claimed");
        require(msg.sender == auction.highestBidder, "Only highest bidder can claim");
        
        auction.claimed = true;
        
        // Transfer NFT to winner
        cryptoRights.transferFrom(auction.creator, msg.sender, auction.tokenId);
        
        emit NFTClaimed(auctionId, msg.sender, auction.tokenId);
    }
    
    /**
     * @dev Cancel an auction if there are no bids
     * @param auctionId ID of the auction to cancel
     */
    function cancelAuction(uint256 auctionId) public {
        Auction storage auction = _auctions[auctionId];
        
        require(!auction.ended, "Auction already ended");
        require(msg.sender == auction.creator, "Only creator can cancel auction");
        require(auction.highestBidder == address(0), "Cannot cancel auction with bids");
        
        auction.ended = true;
        
        emit AuctionCancelled(auctionId);
    }
    
    /**
     * @dev Withdraw pending returns after being outbid
     * @param auctionId ID of the auction to withdraw from
     */
    function withdrawPendingReturn(uint256 auctionId) public nonReentrant {
        uint256 amount = _pendingReturns[msg.sender][auctionId];
        require(amount > 0, "No funds to withdraw");
        
        _pendingReturns[msg.sender][auctionId] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Failed to send funds");
    }
    
    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     */
    function getAuctionDetails(uint256 auctionId) public view returns (
        uint256 tokenId,
        address creator,
        uint256 startingPrice,
        uint256 startTime,
        uint256 endTime,
        address highestBidder,
        uint256 highestBid,
        bool ended,
        bool claimed
    ) {
        Auction memory auction = _auctions[auctionId];
        return (
            auction.tokenId,
            auction.creator,
            auction.startingPrice,
            auction.startTime,
            auction.endTime,
            auction.highestBidder,
            auction.highestBid,
            auction.ended,
            auction.claimed
        );
    }
    
    /**
     * @dev Get pending returns for a bidder
     * @param bidder Address of the bidder
     * @param auctionId ID of the auction
     */
    function getPendingReturn(address bidder, uint256 auctionId) public view returns (uint256) {
        return _pendingReturns[bidder][auctionId];
    }
    
    /**
     * @dev Get all auctions for a creator
     * @param creator Address of the creator
     */
    function getCreatorAuctions(address creator) public view returns (uint256[] memory) {
        return _creatorAuctions[creator];
    }
    
    /**
     * @dev Check if an auction is active
     * @param auctionId ID of the auction
     */
    function isAuctionActive(uint256 auctionId) public view returns (bool) {
        Auction memory auction = _auctions[auctionId];
        return !auction.ended && block.timestamp < auction.endTime;
    }
    
    /**
     * @dev Update platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = newFeePercentage;
    }
} 