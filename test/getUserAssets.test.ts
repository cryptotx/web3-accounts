import {Asset, Web3Accounts} from "../index";

import * as secrets from '../../../secrets.json'
import {MockContract} from "../src/contracts/mockContract";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
const operator = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 1
    const wallet = {
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,
    }
    const user = new Web3Accounts(wallet)
    //
    const asset =await user.getUserAssets({proxyUrl:"http://127.0.0.1:7890",limit:1})
    console.log(asset)

})()
