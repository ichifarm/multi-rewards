// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/src/Test.sol";
import "../contracts/RewardCampaignDistributorFactory.sol";
import "../contracts/RewardCampaignDistributor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../lib/forge-std/src/console.sol";  // Add this for logging

contract RewardCampaignDistributorTest is Test {
    RewardCampaignDistributorFactory factory;
    RewardCampaignDistributor distributor;

    // Example real reward tokens and addresses from Arbitrum
    address constant arbRewardToken = 0x912CE59144191C1204E64559FE8253a0e49E6548; // Example reward token on Arbitrum (ARB)
    address constant arbMFD = 0x1E4DbFcf4D222bd279Ee01901DA4DF1BBD10FEBf;
    address constant keeper = 0x8Bc0AEE1276DD867a92FAd7afFA7AF252569eCae;
    address constant manager = 0xC30220fc19e2db669eaa3fa042C07b28F0c10737;
    address arbOwner = address(this);

    function setUp() public {
        // Fork Arbitrum mainnet
        string memory arbitrumForkUrl = vm.envString("ARBITRUM_RPC_URL");
        vm.createSelectFork(arbitrumForkUrl);

        // Continue with your setup
        factory = new RewardCampaignDistributorFactory(address(new RewardCampaignDistributor()));
    }

    function testCreateRewardCampaignDistributor() public {
        // Create a new distributor via the factory on Arbitrum using real addresses
        address distributorAddress = factory.createRewardCampaignDistributor(arbMFD, arbRewardToken);
        distributor = RewardCampaignDistributor(distributorAddress);

        // Verify the distributor was created and initialized with the correct addresses
        assertEq(distributor.mfd(), arbMFD);
        assertEq(distributor.rewardToken(), arbRewardToken);
    }

    function testSetCampaign() public {
        address distributorAddress = factory.createRewardCampaignDistributor(arbMFD, arbRewardToken);
        distributor = RewardCampaignDistributor(distributorAddress);

        // Simulate granting the campaign manager role to the manager
        distributor.grantCampaignManagerRole(manager);

        // Simulate giving 1000 ARB tokens to the manager
        deal(arbRewardToken, manager, 1000 ether);

        // Simulate the manager starting the campaign with 100 ARB tokens
        vm.prank(manager); // Impersonate the manager
        IERC20(arbRewardToken).approve(distributorAddress, 100 ether); // Manager approves the transfer
        vm.prank(manager); // Impersonate the manager
        distributor.setCampaign(block.timestamp + 1 days, block.timestamp + 10 days, 100 ether);

        // Verify that the campaign is set correctly
        (uint256 startTime, uint256 endTime, uint256 amount,,) = distributor.getCampaign();
        assertEq(startTime, block.timestamp + 1 days);
        assertEq(endTime, block.timestamp + 10 days);
        assertEq(amount, 100 ether);

        // Verify the manager's new balance after starting the campaign
        assertEq(IERC20(arbRewardToken).balanceOf(manager), 900 ether);  // Manager should have 900 ARB left
    }

    function testDistributeRewards() public {
        // Create a new distributor via the factory
        address distributorAddress = factory.createRewardCampaignDistributor(arbMFD, arbRewardToken);
        distributor = RewardCampaignDistributor(distributorAddress);

        // Grant the campaign manager role to the manager and the distributor role to the keeper
        distributor.grantCampaignManagerRole(manager);
        distributor.grantDistributorRole(keeper);

        // Simulate funding the manager with 100 ARB tokens
        deal(arbRewardToken, address(manager), 100 ether);

        uint256 balance = IERC20(arbRewardToken).balanceOf(arbMFD);

        // Set up the campaign by the manager
        vm.prank(manager);  // Impersonate the manager to set the campaign
        IERC20(arbRewardToken).approve(distributorAddress, 100 ether); // Manager approves the transfer
        vm.prank(manager);  // Impersonate the manager to set the campaign
        distributor.setCampaign(block.timestamp, block.timestamp + 7 days, 100 ether);

        // Verify that the campaign is set up properly
        (uint256 startTime, uint256 endTime, uint256 amount,,) = distributor.getCampaign();
        assertEq(startTime, block.timestamp);
        assertEq(endTime, block.timestamp + 7 days);
        assertEq(amount, 100 ether);

        // Simulate time passing (e.g., 1 day into the campaign)
        vm.warp(block.timestamp + 1 days);

        // Distribute rewards by the keeper
        vm.prank(keeper);  // Impersonate the keeper to distribute rewards
        distributor.distributeRewards();

        // Calculate expected reward share after 1 day (1/7 of 100 ARB)
        uint256 expectedReward = uint256(100 ether) / 7;

        console.logUint(amount);

        // Ensure that the MFD received the expected portion of rewards
        assertEq(IERC20(arbRewardToken).balanceOf(arbMFD), expectedReward + balance);

        // Verify that the distributor's remaining balance is 100 ARB - the distributed amount
        assertEq(IERC20(arbRewardToken).balanceOf(address(distributor)), 100 ether - expectedReward);


        // Wait one more day (total of 2 days passed)
        vm.warp(block.timestamp + 1 days);

        // Set a new campaign with another 100 ARB, and start date being 1 day before the current time
        // Simulate funding the manager with an additional 100 ARB tokens for the second campaign
        deal(arbRewardToken, address(manager), 100 ether);

        // Simulate manager setting the new campaign with the start date being 1 day before now
        vm.prank(manager);
        IERC20(arbRewardToken).approve(distributorAddress, 100 ether); // Manager approves the transfer
        vm.prank(manager);
        distributor.setCampaign(block.timestamp - 1 days, block.timestamp + 6 days, 100 ether);

        // Wait 3 more days (total of 5 days passed since the start of the first campaign)
        vm.warp(block.timestamp + 3 days);

        // Distribute rewards by the keeper
        vm.prank(keeper);
        distributor.distributeRewards();

        // Check the expected reward after the total of 5 days for both campaigns
        uint256 newExpectedReward = 4 * (200 ether - expectedReward) / 7; // remaining fiunds plus 3 days of rewards in the second campaign

        // Ensure that the MFD received the total expected rewards
        assertEq(
            IERC20(arbRewardToken).balanceOf(arbMFD),
            balance + expectedReward + newExpectedReward
        );
    }

    function testPermissionCheck() public {
        address distributorAddress = factory.createRewardCampaignDistributor(arbMFD, arbRewardToken);
        distributor = RewardCampaignDistributor(distributorAddress);

        // Try setting the campaign without permission (should revert)
        vm.expectRevert();  // Expect revert due to missing CAMPAIGN_MANAGER_ROLE
        vm.prank(arbOwner);  // Impersonate arbOwner, who doesn't have the CAMPAIGN_MANAGER_ROLE
        distributor.setCampaign(block.timestamp, block.timestamp + 7 days, 100 ether);

        // Grant the campaign manager role to the manager
        distributor.grantCampaignManagerRole(manager);

        // Now, manager should be able to set the campaign without reverting
        deal(arbRewardToken, address(manager), 100 ether);
        vm.prank(manager);  // Impersonate the manager to set the campaign
        IERC20(arbRewardToken).approve(distributorAddress, 100 ether); // Manager approves the transfer
        vm.prank(manager);
        distributor.setCampaign(block.timestamp, block.timestamp + 7 days, 100 ether);

        // Try distributing rewards without permission (should revert)
        vm.expectRevert();  // Expect revert due to missing DISTRIBUTOR_ROLE
        vm.prank(arbOwner);  // Impersonate arbOwner, who doesn't have the DISTRIBUTOR_ROLE
        distributor.distributeRewards();

        // Grant the distributor role to the keeper
        distributor.grantDistributorRole(keeper);

        // Now, keeper should be able to distribute rewards without reverting
        vm.prank(keeper);  // Impersonate the keeper to distribute rewards
        distributor.distributeRewards();
    }

    function testDistributionEnabled() public {
        address distributorAddress = factory.createRewardCampaignDistributor(arbMFD, arbRewardToken);
        distributor = RewardCampaignDistributor(distributorAddress);

        // Grant the campaign manager role to the manager and the distributor role to the keeper
        distributor.grantCampaignManagerRole(manager);
        distributor.grantDistributorRole(keeper);

        // Set a campaign by the manager with 100 ARB tokens
        deal(arbRewardToken, address(manager), 100 ether);
        vm.prank(manager);
        IERC20(arbRewardToken).approve(distributorAddress, 100 ether); // Manager approves the transfer
        vm.prank(manager);
        distributor.setCampaign(block.timestamp, block.timestamp + 7 days, 100 ether);

        // Initially, distribution should be not enabled as the campaign started in this block
        bool isEnabled = distributor.distributionEnabled();
        assertEq(isEnabled, false, "Distribution should not be enabled yet");

        // Simulate time passing (e.g., 1 day into the campaign)
        vm.warp(block.timestamp + 1 days);

        // After distributing rewards, distribution should be enabled because there is remaining balance
        vm.prank(keeper);
        distributor.distributeRewards();
        // but not in the same block
        isEnabled = distributor.distributionEnabled();
        assertEq(isEnabled, false, "Distribution should not be enabled right after distribution");
        vm.warp(block.timestamp + 1);
        isEnabled = distributor.distributionEnabled();
        assertEq(isEnabled, true, "Distribution should be enabled shortly after distribution");

        // Simulate time passing to the end of the campaign
        vm.warp(block.timestamp + 7 days);  // Move to the end of the 7-day campaign

        isEnabled = distributor.distributionEnabled();
        assertEq(isEnabled, true, "Distribution still enabled pending last distribution");

        vm.prank(keeper);  // last distribution by the keeper
        distributor.distributeRewards();

        // Now that the campaign has ended, distribution should no longer be enabled
        isEnabled = distributor.distributionEnabled();
        assertEq(isEnabled, false, "Distribution should be disabled after campaign ends");
    }

}
