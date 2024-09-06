// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { MultiFeeDistribution } from "./MultiFeeDistribution.sol";
import "../interfaces/IRewardCampaignDistributor.sol";

/// @title RewardCampaignDistributor
///
/// Error Codes:
///     ICM - Invalid campaign
///     IAL - Insufficient allowance
///     ILT - Invalid MFD last time updated
///     ITT - Insufficient target tokens
///     NAC - No active campaign
///     RNA - Roles: not an admin
///     RNM - Roles: not a campaign manager
///     RND - Roles: not a distributor
///     ZAD - Zero address
///     ZBL - Zero balance
///     ZAM - Zero amount

contract RewardCampaignDistributor is IRewardCampaignDistributor, ReentrancyGuard, AccessControl, Initializable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public override mfd;
    address public override rewardToken;

    uint256 private _campaignStart;
    uint256 private _campaignEnd;
    uint256 private _campaignAmount;

    uint256 public override lastDistribution;

    bytes32 public constant override CAMPAIGN_MANAGER_ROLE = keccak256("CAMPAIGN_MANAGER_ROLE");
    bytes32 public constant override DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    /// @notice Initializes the contract with MFD and rewardToken
    function initialize(
        address _mfd,
        address _rewardToken,
        address __owner) external override initializer
    {
        require(_mfd != address(0) && _rewardToken != address(0), "ZAD");
        _setupRole(DEFAULT_ADMIN_ROLE, __owner);

        mfd = _mfd;
        rewardToken = _rewardToken;
        emit Initialized(_mfd, _rewardToken);
    }

    /// @dev Reverts if called by any account other than the default admin.
    function _onlyAdmin() private view {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "RNA");
    }

    /// @dev Reverts if called by an account which is not allowed to set campaigns.
    function _onlyCampaignManager() private view {
        require(hasRole(CAMPAIGN_MANAGER_ROLE, msg.sender), "RNM");
    }

    /// @dev Reverts if called by an account which is not allowed to trigger reward distribution.
    function _onlyDistributor() private view {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "RND");
    }

    /// @notice Sets or resets a campaign with new parameters
    function setCampaign(uint256 startTime, uint256 endTime, uint256 amount) external override nonReentrant {
        _onlyCampaignManager();
        require(endTime > startTime, "ICM");

        if (amount > 0) {
            require(IERC20(rewardToken).allowance(msg.sender, address(this)) >= amount, "IAL");
            // Transfer reward tokens from sender to distributor contract
            IERC20(rewardToken).safeTransferFrom(msg.sender, address(this), amount);
        }

        _campaignStart = startTime;
        _campaignEnd = endTime;

        lastDistribution = startTime;  // Reset last distribution

        _campaignAmount = IERC20(rewardToken).balanceOf(address(this));

        emit CampaignSet(msg.sender, startTime, endTime, amount, _campaignAmount);
    }

    function _isActive() private view returns (bool) {
        return block.timestamp >= _campaignStart && lastDistribution < _campaignEnd;
    }

    function _checkMFD() private view {
        (,uint256 lastTimeUpdated,) = MultiFeeDistribution(mfd).rewardData(rewardToken);
        require(
            lastTimeUpdated != 0 && lastTimeUpdated != block.timestamp,
            "ILT"
        );
    }

    /// @notice Distributes rewards to the MFD
    function distributeRewards() external override nonReentrant {
        _onlyDistributor();
        _checkMFD();
        require(_isActive(), "NAC");

        uint256 remainingAmount = IERC20(rewardToken).balanceOf(address(this));
        require(remainingAmount > 0, "ZAM");

        // Calculate the time range for distribution
        uint256 timeSinceLastDistribution = block.timestamp.sub(lastDistribution);
        uint256 remainingCampaignTime = _campaignEnd.sub(lastDistribution);

        // Calculate the reward distribution
        uint256 rewardShare = remainingAmount;
        if (timeSinceLastDistribution < remainingCampaignTime) {
            rewardShare = timeSinceLastDistribution.mul(remainingAmount).div(remainingCampaignTime);
        }

        // Send the calculated reward share to the MFD
        IERC20(rewardToken).safeTransfer(mfd, rewardShare);

        lastDistribution = block.timestamp;  // Update the last distribution time

        emit RewardsDistributed(msg.sender, mfd, rewardShare);
    }

    /// @notice Returns the current campaign parameters
    function getCampaign() external view override returns (uint256 startTime, uint256 endTime,
            uint256 amount, uint256 remainingAmount, bool isActive) {
        isActive = _isActive();
        remainingAmount = IERC20(rewardToken).balanceOf(address(this));
        startTime = _campaignStart;
        endTime = _campaignEnd;
        amount = _campaignAmount;
    }

    /// @notice Checks if the caller has the campaign manager role
    function isCampaignManager(address user) public view override returns (bool) {
        return hasRole(CAMPAIGN_MANAGER_ROLE, user);
    }

    /// @notice Checks if the caller has the distributor role
    function isDistributor(address user) public view override returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, user);
    }

    /// @notice grants campaign manager role
    function grantCampaignManagerRole(address account) external override {
        _onlyAdmin();
        grantRole(CAMPAIGN_MANAGER_ROLE, account);
    }

    /// @notice grants distributor role
    function grantDistributorRole(address account) external override {
        _onlyAdmin();
        grantRole(DISTRIBUTOR_ROLE, account);
    }

    /// @notice Withdraws tokens from the contract
    function withdrawTokens(address _token, address _recipient) external override {
        if (_token == rewardToken) {
            _onlyCampaignManager();
        } else {
            _onlyAdmin();
        }

        IERC20 token = IERC20(_token);
        uint256 tokenBalance = token.balanceOf(address(this));
        require(tokenBalance > 0, "ZBL");
        token.safeTransfer(_recipient, tokenBalance);

        emit WithdrawTokens(msg.sender, _token, _recipient, tokenBalance);
    }

}
