// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBatcherAccountProxyFactory {
    function users(address batcher) external view returns (address);
}
