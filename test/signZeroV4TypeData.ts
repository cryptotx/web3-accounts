import { Web3Accounts} from "../index"
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {getEIP712Hash} from "web3-wallets";


const data = {
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
const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 1
    const user = new Web3Accounts({
        chainId,
        address: seller,
        priKey: secrets.accounts[seller]
    })

    // const signMsg = await user.signMessage("hello")
    // const hash = getEIP712Hash(data)
    // console.log(signMsg)
    const sign = await user.signTypedData(data)
    console.log(sign)
})()
