import {Asset, openseaAssetToAsset, Web3Accounts} from "../index";

import * as secrets from '../../../secrets.json'
import {MockContract} from "../src/contracts/mockContract";
import {openseaAssets} from "./data/assets";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
// const operator = '0x00000000006c3852cbef3e08e8df289169ede581';
const operator = '0x8D6022B8A421B08E9E4cEf45E46f1c83C85d402F';
(async () => {
    const chainId = 4
    const wallet = {
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,
    }
    const user = new Web3Accounts(wallet)
    //
    // const openseaAssets =await user.getUserAssets({proxyUrl:"http://127.0.0.1:7890",limit:5})
    // console.log(openseaAssets)
    const assets =  openseaAssets.map(val=>openseaAssetToAsset(val))
    const approve =await user.getUserAssetsApprove(assets,operator)
    console.log(approve)

})()
