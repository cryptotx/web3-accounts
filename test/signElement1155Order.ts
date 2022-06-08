//


import {getEIP712Hash} from "web3-wallets";
import {Web3Accounts} from "../src/index";
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {privateKeysToAddress} from "web3-wallets/lib/src/signature/eip712TypeData";
import {AssetSchemaName, AcceptOrdersParams, OrderOption} from "../src/types";

const typedData = {
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

const hash1 = getEIP712Hash(typedData)
const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';

(async () => {
    const foo: AcceptOrdersParams = {
        orderList: [{
            orderStr: "",
            taker: "",
            metadata: ""
        }, {
            orderStr: "",
            taker: "",
            metadata: ""
        }],
        mixedPayment: {wethValue: "1", ethValue: "1"}
    }

    console.log(foo);
    const chainId = 1
    // console.log(privateKeysToAddress(secrets.privateKeys))
    const user = new Web3Accounts({
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys
    })


    const sign = await user.signTypedData(typedData)
    console.log(sign)


})()
