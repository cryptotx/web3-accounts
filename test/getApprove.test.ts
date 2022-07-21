import {Asset, Web3Accounts} from "../index";
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {asset721, asset1155, erc20Tokens, erc20Asset} from "./data/assets";
import {ethers} from "ethers";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
const operator = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 1
    const user = new Web3Accounts({
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,

    })
    const approveCall = await user.getAssetApprove({
        "tokenAddress": "0x6D77496B7C143D183157E8b979e47a0A0180e86B".toLowerCase(),
        "tokenId": "1",
        "schemaName": "ERC721",
        "collection": {
            "royaltyFeePoints": 500,
            "royaltyFeeAddress": ""
        }
    } as Asset,'0xF849de01B080aDC3A814FaBE1E2087475cF2E354')
    console.log(approveCall)
    //  isApprove = await this.getERC721Approved(address, operator, owner)
    const approve721 = await user.getERC721Approved("0x6D77496B7C143D183157E8b979e47a0A0180e86B","0xF849de01B080aDC3A814FaBE1E2087475cF2E354")

    console.log(approve721)



})()
