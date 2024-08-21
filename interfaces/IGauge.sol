// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

interface IGauge {

  function getALMRewards(address alm) external view returns (uint256 almReward);

  function rewardToken() external view returns (address);

}
