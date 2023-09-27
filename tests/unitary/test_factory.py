#!/usr/bin/python3

import brownie
import pytest
from eth_utils import keccak, to_hex
from utils import computeCreate2Address, address_to_bytes32, calculate_create2_address, bytes32_str_to_bytes, bytes_to_bytes_string

def number_to_address(number: int) -> str:
    # Ensure number is within bounds
    if number >= 2**160:
        raise ValueError("Number is too large to be represented as an Ethereum address.")

    hex_representation = to_hex(number)[2:]  # Convert number to hex and remove the '0x' prefix
    address = '0x' + hex_representation.zfill(40)  # Add leading zeros to make it 40 characters long

    return address

# Cannot instantiate/create a staker for a vault that already has a staker created
def test_cannot_deploy_staker_twice(multifactory, mvault, alice):
    multifactory.deployStaker(mvault, {"from": alice})
    with brownie.reverts("ALREADY_DEPLOYED"):
        multifactory.deployStaker(mvault, {"from": alice})


# Can contract be paused
def test_vault_to_staker_set(multifactory, mvault, alice):
    tx = multifactory.deployStaker(mvault, {"from": alice})
    expectedStaker = tx.events["StakerCreated"].values()[1]

    actualStaker = multifactory.vaultToStaker(mvault)

    assert multifactory.cachedDeployData() == '0x'
    assert expectedStaker == actualStaker


def test_staker_create2_address(multifactory, mvault, alice):
    tx = multifactory.deployStaker(mvault, {"from": alice})
    actualStaker = tx.events["StakerCreated"].values()[1]

    encodedData = address_to_bytes32(mvault.address)
    salt = keccak(encodedData)
    init_code_hash = multifactory.bytecodeHash()

    expectedStaker = computeCreate2Address(multifactory, salt, init_code_hash)
    expectedStaker2 = calculate_create2_address(multifactory.address, salt, init_code_hash)

    assert expectedStaker == actualStaker
    assert expectedStaker == expectedStaker2

def test_cannot_deploy_staker_if_invalid_vault_factory(multifactory, mvault, alice):
    mvault.setIchiVaultFactory(number_to_address(1))

    with brownie.reverts("INVALID_VF"):
        multifactory.deployStaker(mvault, {"from": alice})