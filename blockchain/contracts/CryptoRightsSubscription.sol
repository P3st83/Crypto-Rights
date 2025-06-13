// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CryptoRightsSubscription
 * @dev Contract for managing creator subscription memberships
 */
contract CryptoRightsSubscription is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 private platformFeePercentage = 250; // 2.5% fee
    
    // Subscription plan structure
    struct SubscriptionPlan {
        address creator;
        string name;
        string description;
        uint256 price;
        uint256 durationDays;
        bool isActive;
    }
    
    // Subscriber structure
    struct Subscription {
        uint256 planId;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    // Counter for subscription plan IDs
    Counters.Counter private _planIds;
    
    // Mapping of plan ID to subscription plan
    mapping(uint256 => SubscriptionPlan) private _plans;
    
    // Mapping of creator to their plan IDs
    mapping(address => uint256[]) private _creatorPlans;
    
    // Mapping of subscriber address to creator address to subscription details
    mapping(address => mapping(address => Subscription)) private _subscriptions;
    
    // Mapping of subscriber address to subscribed creators
    mapping(address => address[]) private _subscribedCreators;
    
    // Events
    event PlanCreated(uint256 indexed planId, address indexed creator, string name, uint256 price);
    event PlanUpdated(uint256 indexed planId, string name, uint256 price, bool isActive);
    event SubscriptionPurchased(address indexed subscriber, address indexed creator, uint256 planId, uint256 endTime);
    event SubscriptionCancelled(address indexed subscriber, address indexed creator, uint256 planId);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new subscription plan
     * @param name Name of the subscription plan
     * @param description Description of what's included
     * @param price Price in wei
     * @param durationDays Duration in days
     */
    function createSubscriptionPlan(
        string memory name,
        string memory description,
        uint256 price,
        uint256 durationDays
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        
        _planIds.increment();
        uint256 newPlanId = _planIds.current();
        
        SubscriptionPlan memory newPlan = SubscriptionPlan({
            creator: msg.sender,
            name: name,
            description: description,
            price: price,
            durationDays: durationDays,
            isActive: true
        });
        
        _plans[newPlanId] = newPlan;
        _creatorPlans[msg.sender].push(newPlanId);
        
        emit PlanCreated(newPlanId, msg.sender, name, price);
        
        return newPlanId;
    }
    
    /**
     * @dev Update an existing subscription plan
     * @param planId ID of the plan to update
     * @param name New name
     * @param description New description
     * @param price New price
     * @param durationDays New duration
     * @param isActive Whether the plan is active
     */
    function updateSubscriptionPlan(
        uint256 planId,
        string memory name,
        string memory description,
        uint256 price,
        uint256 durationDays,
        bool isActive
    ) public {
        require(_plans[planId].creator == msg.sender, "Only plan creator can update");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        
        SubscriptionPlan storage plan = _plans[planId];
        plan.name = name;
        plan.description = description;
        plan.price = price;
        plan.durationDays = durationDays;
        plan.isActive = isActive;
        
        emit PlanUpdated(planId, name, price, isActive);
    }
    
    /**
     * @dev Subscribe to a creator's plan
     * @param planId ID of the plan to subscribe to
     */
    function subscribe(uint256 planId) public payable nonReentrant {
        SubscriptionPlan memory plan = _plans[planId];
        
        require(plan.isActive, "Plan is not active");
        require(msg.value >= plan.price, "Insufficient payment");
        require(msg.sender != plan.creator, "Cannot subscribe to your own plan");
        
        address creator = plan.creator;
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Transfer payments
        (bool successCreator, ) = payable(creator).call{value: creatorAmount}("");
        require(successCreator, "Failed to send payment to creator");
        
        (bool successPlatform, ) = payable(owner()).call{value: platformFee}("");
        require(successPlatform, "Failed to send fee to platform");
        
        // Calculate subscription end time
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (plan.durationDays * 1 days);
        
        // Check if the subscriber already has a subscription with this creator
        if (_subscriptions[msg.sender][creator].isActive) {
            // If the existing subscription hasn't expired, extend it
            if (_subscriptions[msg.sender][creator].endTime > block.timestamp) {
                endTime = _subscriptions[msg.sender][creator].endTime + (plan.durationDays * 1 days);
            }
        } else {
            // Add creator to the subscriber's list if not already subscribed
            bool alreadySubscribed = false;
            for (uint i = 0; i < _subscribedCreators[msg.sender].length; i++) {
                if (_subscribedCreators[msg.sender][i] == creator) {
                    alreadySubscribed = true;
                    break;
                }
            }
            
            if (!alreadySubscribed) {
                _subscribedCreators[msg.sender].push(creator);
            }
        }
        
        // Update subscription details
        _subscriptions[msg.sender][creator] = Subscription({
            planId: planId,
            startTime: startTime,
            endTime: endTime,
            isActive: true
        });
        
        emit SubscriptionPurchased(msg.sender, creator, planId, endTime);
    }
    
    /**
     * @dev Cancel a subscription
     * @param creator Address of the creator to cancel subscription from
     */
    function cancelSubscription(address creator) public {
        require(_subscriptions[msg.sender][creator].isActive, "No active subscription");
        
        // Deactivate the subscription
        _subscriptions[msg.sender][creator].isActive = false;
        
        emit SubscriptionCancelled(msg.sender, creator, _subscriptions[msg.sender][creator].planId);
        
        // Remove creator from subscribed list
        for (uint i = 0; i < _subscribedCreators[msg.sender].length; i++) {
            if (_subscribedCreators[msg.sender][i] == creator) {
                // Replace with the last element and pop
                _subscribedCreators[msg.sender][i] = _subscribedCreators[msg.sender][_subscribedCreators[msg.sender].length - 1];
                _subscribedCreators[msg.sender].pop();
                break;
            }
        }
    }
    
    /**
     * @dev Check if a user has an active subscription to a creator
     * @param subscriber Address of the subscriber
     * @param creator Address of the creator
     */
    function hasActiveSubscription(address subscriber, address creator) public view returns (bool) {
        Subscription memory sub = _subscriptions[subscriber][creator];
        return sub.isActive && sub.endTime > block.timestamp;
    }
    
    /**
     * @dev Get subscription details
     * @param subscriber Address of the subscriber
     * @param creator Address of the creator
     */
    function getSubscriptionDetails(address subscriber, address creator) public view returns (
        uint256 planId,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        Subscription memory sub = _subscriptions[subscriber][creator];
        return (sub.planId, sub.startTime, sub.endTime, sub.isActive && sub.endTime > block.timestamp);
    }
    
    /**
     * @dev Get plan details
     * @param planId ID of the plan
     */
    function getPlanDetails(uint256 planId) public view returns (
        address creator,
        string memory name,
        string memory description,
        uint256 price,
        uint256 durationDays,
        bool isActive
    ) {
        SubscriptionPlan memory plan = _plans[planId];
        return (
            plan.creator,
            plan.name,
            plan.description,
            plan.price,
            plan.durationDays,
            plan.isActive
        );
    }
    
    /**
     * @dev Get all plans for a creator
     * @param creator Address of the creator
     */
    function getCreatorPlans(address creator) public view returns (uint256[] memory) {
        return _creatorPlans[creator];
    }
    
    /**
     * @dev Get all creators a user is subscribed to
     * @param subscriber Address of the subscriber
     */
    function getSubscribedCreators(address subscriber) public view returns (address[] memory) {
        return _subscribedCreators[subscriber];
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