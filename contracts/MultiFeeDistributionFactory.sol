// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import { MultiFeeDistribution } from "./MultiFeeDistribution.sol";
import { IMultiFeeDistributionFactory } from "interfaces/IMultiFeeDistributionFactory.sol";
import { IOwnable } from "interfaces/IOwnable.sol";

contract MultiFeeDistributionFactory is IMultiFeeDistributionFactory {
    bytes32 public override constant bytecodeHash =
        keccak256(type(MultiFeeDistribution).creationCode);

    // This called in the MultiFeeDistribution constructor
    bytes public override cachedDeployData;

    mapping(address => address) public override vaultToStaker;

    address public immutable override owner;

    constructor() {
        owner = msg.sender;
    }

    function deployStaker(address ichiVault) external override returns (address staker) {
        bytes memory _deployData = abi.encode(ichiVault);
        cachedDeployData = _deployData;

        bytes32 salt = keccak256(_deployData);
        staker = address(new MultiFeeDistribution{salt: salt}());

        cachedDeployData = "";

        vaultToStaker[ichiVault] = staker;

        IOwnable(staker).transferOwnership(owner);

        emit StakerCreated(staker);
    }

}
