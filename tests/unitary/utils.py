from web3 import Web3
from eth_utils import keccak, to_checksum_address, to_bytes, to_hex


def withCustomError(customErrorString):
    errMsg = Web3.keccak(text=customErrorString)[:4].hex()
    return 'typed error: ' + errMsg


# based on: https://github.com/pandadefi/brownie-create2/blob/master/tests/test_factory.py
def computeCreate2Address(factory, saltBytes32, init_code_hash):

    pre = "0xff"
    b_pre = bytes.fromhex(pre[2:])

    b_address = bytes.fromhex(factory.address[2:])
    b_salt = saltBytes32
    keccak_b_init_code = init_code_hash

    b_result = keccak(b_pre + b_address + b_salt + keccak_b_init_code)
    result_address = to_checksum_address(b_result[12:].hex())

    return result_address


# calculate_create2_address and computeCreate2Address are both valid functions for computing the create2 address
def calculate_create2_address(deployer_address: str, salt: bytes, init_code_hash: bytes) -> str:
    deployer_address = to_bytes(hexstr=deployer_address)
    prefix = to_bytes(hexstr="0xff")

    # Concatenate and hash it
    hashed_data = keccak(prefix + deployer_address + salt + init_code_hash)

    # The last 20 bytes is the address
    computed_address = hashed_data[-20:]

    return to_checksum_address(computed_address)


def address_to_bytes32(address: str) -> bytes:
    address_bytes = to_bytes(hexstr=address)
    bytes_32 = address_bytes.rjust(32, b'\0')
    return bytes_32


def bytes32_str_to_bytes(bytes32_str: str) -> bytes:
    return to_bytes(hexstr=bytes32_str)


def bytes_to_bytes_string(data: bytes) -> str:
    return to_hex(data)

