// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRewardCampaignDistributorFactory {
    event DeployRewardCampaignDistributorFactory(address indexed owner, address indexed distributorImplementation);
    event RewardCampaignDistributorCreated(address indexed distributor, address indexed mfd, address indexed rewardToken);

    /// @notice Deploy a new RewardCampaignDistributor
    /// @param mfd MFD address
    /// @param rewardToken The reward token address
    /// @return distributor The address of the newly created distributor
    function createRewardCampaignDistributor(address mfd, address rewardToken) external returns (address distributor);

    /// @notice Retrieve all distributors
    function allDistributors(uint256 index) external view returns (address);

    /// @notice Retrieve distributors for specific MFD
    /// @param mfd MFD address
    function allDistributorsForMFD(address mfd, uint256 index) external view returns (address);

    /// @notice Retrieve distributor for specific MFD and rewardToken
    /// @param mfd MFD address
    /// @param rewardToken The reward token address
    function getDistributor(address mfd, address rewardToken) external view returns (address);

    /// @notice Returns the total number of distributors created by the factory
    function allDistributorsLength() external view returns (uint256);

    /// @notice Returns the number of distributors created for a specific MFD
    /// @param mfd MFD address
    function allDistributorsForMFDLength(address mfd) external view returns (uint256);
}


