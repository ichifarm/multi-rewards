// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { RewardCampaignDistributor } from "./RewardCampaignDistributor.sol";
import "../interfaces/IRewardCampaignDistributorFactory.sol";

/// @title RewardCampaignDistributor Factory
/// @notice This contract is responsible for deploying and managing RewardCampaignDistributor contracts
///
/// Error Codes:
///     DAE - Distributor already exists
///     ZAD - Zero address

contract RewardCampaignDistributorFactory is IRewardCampaignDistributorFactory, Ownable, ReentrancyGuard {
    using Clones for address;

    address public immutable distributorImplementation;
    mapping(address => address[]) public override allDistributorsForMFD;
    mapping(address => mapping(address => address)) public getDistributor;
    address[] public override allDistributors;

    constructor(address _distributorImplementation) {
        require(_distributorImplementation != address(0), "ZAD");

        distributorImplementation = _distributorImplementation;

        emit DeployRewardCampaignDistributorFactory(msg.sender, _distributorImplementation);
    }

    function createRewardCampaignDistributor(address mfd, address rewardToken) external onlyOwner nonReentrant returns (address distributor) {
        require(mfd != address(0) && rewardToken != address(0), "ZAD");
        require(getDistributor[mfd][rewardToken] == address(0), "DAE");

        distributor = distributorImplementation.clone();
        // Initialize the new clone instance with MFD and rewardToken
        // set owner to msg.sender
        RewardCampaignDistributor(distributor).initialize(mfd, rewardToken, msg.sender);

        allDistributors.push(distributor);
        allDistributorsForMFD[mfd].push(distributor);
        getDistributor[mfd][rewardToken] = distributor;

        emit RewardCampaignDistributorCreated(distributor, mfd, rewardToken);
    }

    function allDistributorsLength() external view override returns (uint256) {
        return allDistributors.length;
    }

    function allDistributorsForMFDLength(address mfd) external view override returns (uint256) {
        require(mfd != address(0), "ZAD");
        return allDistributorsForMFD[mfd].length;
    }

}
