// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IBatcherAccountProxyFactory } from "../../interfaces/IBatcherAccountProxyFactory.sol";

abstract contract BatcherSupported {
    IBatcherAccountProxyFactory public immutable batcherFactory;

    error ZeroAddress();
    error InvalidCaller();

    constructor(address _batcherFactory) {
        if (_batcherFactory == address(0)) revert ZeroAddress();

        batcherFactory = IBatcherAccountProxyFactory(_batcherFactory);
    }

    function _getEffectiveUser() internal view returns (address) {
        address user = batcherFactory.users(msg.sender);
        return user == address(0) ? msg.sender : user;
    }
}