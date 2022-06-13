export const zeroV41155TypedData = {
    "domain": {
        "chainId": 43114,
        "verifyingContract": "0x9F7A946d935c8Efc7A8329C0d894A69bA241345A",
        "name": "ElementEx",
        "version": "1.0.0"
    },
    "primaryType": "ERC1155SellOrder",
    "message": {
        "maker": "0x36B1a29E0bbD47dFe9dcf7380F276e86da90c4c2",
        "taker": "0x0000000000000000000000000000000000000000",
        "expiry": "0x0000000000000000000000000000000000000000000000006298ad7d629bd1b7",
        "nonce": "1654173060",
        "erc20Token": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        "erc20TokenAmount": "2000000000000000",
        "fees": [],
        "erc1155Token": "0xdad95f1ec9360ffd5c942592b9a5988172134a35",
        "erc1155TokenId": "2",
        "erc1155TokenAmount": "1",
        "hashNonce": "0"
    },
    "types": {
        "EIP712Domain": [],
        "ERC1155SellOrder": [
            {
                "type": "address",
                "name": "maker"
            },
            {
                "type": "address",
                "name": "taker"
            },
            {
                "type": "uint256",
                "name": "expiry"
            },
            {
                "type": "uint256",
                "name": "nonce"
            },
            {
                "type": "address",
                "name": "erc20Token"
            },
            {
                "type": "uint256",
                "name": "erc20TokenAmount"
            },
            {
                "type": "Fee[]",
                "name": "fees"
            },
            {
                "type": "address",
                "name": "erc1155Token"
            },
            {
                "type": "uint256",
                "name": "erc1155TokenId"
            },
            {
                "type": "uint128",
                "name": "erc1155TokenAmount"
            },
            {
                "type": "uint256",
                "name": "hashNonce"
            }
        ],
        "Fee": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "uint256",
                "name": "amount"
            },
            {
                "type": "bytes",
                "name": "feeData"
            }
        ]
    }
}

export const zeroV4721TypeData = {
    "types": {
        "EIP712Domain": [],
        "ERC721Order": [
            {
                "type": "uint8",
                "name": "direction"
            },
            {
                "type": "address",
                "name": "maker"
            },
            {
                "type": "address",
                "name": "taker"
            },
            {
                "type": "uint256",
                "name": "expiry"
            },
            {
                "type": "uint256",
                "name": "nonce"
            },
            {
                "type": "address",
                "name": "erc20Token"
            },
            {
                "type": "uint256",
                "name": "erc20TokenAmount"
            },
            {
                "type": "Fee[]",
                "name": "fees"
            },
            {
                "type": "address",
                "name": "erc721Token"
            },
            {
                "type": "uint256",
                "name": "erc721TokenId"
            },
            {
                "type": "Property[]",
                "name": "erc721TokenProperties"
            }
        ],
        "Fee": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "uint256",
                "name": "amount"
            },
            {
                "type": "bytes",
                "name": "feeData"
            }
        ],
        "Property": [
            {
                "type": "address",
                "name": "propertyValidator"
            },
            {
                "type": "bytes",
                "name": "propertyData"
            }
        ]
    },
    "domain": {
        "chainId": 43114,
        "verifyingContract": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        "name": "ZeroEx",
        "version": "1.0.0"
    },
    "primaryType": "ERC721Order",
    "message": {
        "direction": "0",
        "maker": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "taker": "0x0000000000000000000000000000000000000000",
        "expiry": "86410",
        "nonce": "10",
        "erc20Token": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "erc20TokenAmount": "1",
        "fees": [],
        "erc721Token": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "erc721TokenId": "2",
        "erc721TokenProperties": []
    }
}
