// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {MultiFeeDistribution} from "./MultiFeeDistribution.sol";

contract RewardsInjector {
    using SafeERC20 for IERC20;

    function injectRewards(
        address mfd,
        address reward,
        uint256 amount
    ) external {
        MultiFeeDistribution _mfd = MultiFeeDistribution(mfd);

        (,uint256 lastTimeUpdated,) = _mfd.rewardData(reward);

        require(
            lastTimeUpdated != 0 && lastTimeUpdated != block.timestamp,
            "invalid LTU"
        );

        IERC20(reward).safeTransferFrom(
            msg.sender,
            mfd,
            amount
        );
    }
}
