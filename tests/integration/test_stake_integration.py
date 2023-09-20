#!/usr/bin/python3

import brownie
import pytest
from utils import withCustomError


# Can other users stake?
@pytest.mark.parametrize("idx", range(1, 5))
def test_place_stake(multi, accounts, mvault, reward_token, idx):
    mvault.approve(multi, 1000000, {"from": accounts[idx]})
    multi.stake(1000000, accounts[idx], {"from": accounts[idx]})
    assert multi.userData(accounts[idx])["tokenAmount"] == 1000000


# NOTE: this test case succeeds when run by itself, but fails when run with the other integration tests, likely a fixture issue?
# Unbanked users should not be able to stake
@pytest.mark.parametrize("idx", range(6, 10))
def test_no_unbanked_stake(multi, accounts, mvault, idx):
    mvault.approve(multi, 1000000, {"from": accounts[idx]})
    with brownie.reverts("ERC20: transfer amount exceeds balance"):
        multi.stake(1000000, accounts[idx], {"from": accounts[idx]})
