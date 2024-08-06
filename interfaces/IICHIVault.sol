// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IICHIVault is IERC20 {

  function ichiVaultFactory() external view returns(address);

  // ICHIVault.collectRewards() was created for the following AMMs:
  // Ramses(and friendly forks such as Pharaoh, Nile, etc)
  // Pearl
  function collectRewards() external;

  function collectFees() external returns(uint256 fees0, uint256 fees1);

  // NOTE: this returns the total0 and total1 by the ICHIVault's 2 positions in the underlying pool
  // however this does not include any fees{0|1} that have been earned but not yet collected by the ICHIVault
  function getTotalAmounts() external view returns (uint256 total0, uint256 total1);

  function farmingContract() external view returns (address);

  function pool() external view returns (address);

}
