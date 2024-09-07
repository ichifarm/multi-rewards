// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRewardCampaignDistributor {
    event Initialized(address indexed mfd, address indexed rewardToken);
    event CampaignSet(address indexed sender, uint256 startTime, uint256 endTime, uint256 amount, uint256 actualAmount);
    event RewardsDistributed(address indexed sender, address indexed mfd, uint256 amount);
    event WithdrawTokens(address indexed sender, address indexed token, address indexed recipient, uint256 tokenBalance);

    /// @notice Initializes the RewardCampaignDistributor
    /// @dev This should only be called once, right after contract creation
    /// @param mfd The address of the MFD
    /// @param rewardToken The address of the reward token
    function initialize(address mfd, address rewardToken, address owner) external;

    /// @notice Checks if the distribution is enabled
    function distributionEnabled() external view returns (bool);

    /// @notice Distributes rewards to MFD
    function distributeRewards() external;

    /// @notice Sets a new campaign or resets the current campaign with new values
    /// @param startTime The start time of the campaign (timestamp)
    /// @param endTime The end time of the campaign (timestamp)
    /// @param amount The total amount of rewards for the campaign
    function setCampaign(uint256 startTime, uint256 endTime, uint256 amount) external;

    /// @notice Returns the current campaign parameters
    /// (startTime, endTime, amount, remainingAmount, isActive)
    function getCampaign() external view returns (uint256 startTime, uint256 endTime,
        uint256 amount, uint256 remainingAmount, bool isActive);

    /// @notice Returns the last distribution timestamp
    function lastDistribution() external view returns (uint256);

    /// @notice Checks if the caller has the campaign manager role
    /// @param user The address of the user to check
    function isCampaignManager(address user) external view returns (bool);

    /// @notice Checks if the caller has the distributor role
    /// @param user The address of the user to check
    function isDistributor(address user) external view returns (bool);

    /// @notice Returns the MFD address linked to this distributor
    function mfd() external view returns (address);

    /// @notice Returns the reward token address linked to this distributor
    function rewardToken() external view returns (address);

    /// @notice Grants the campaign manager role to an address
    function grantCampaignManagerRole(address account) external;

    /// @notice Grants the distributor role to an address
    function grantDistributorRole(address account) external;

    /// @notice Withdraws tokens from the contract
    function withdrawTokens(address _token, address _recipient) external;

    function CAMPAIGN_MANAGER_ROLE() external view returns (bytes32);
    function DISTRIBUTOR_ROLE() external view returns (bytes32);

}
