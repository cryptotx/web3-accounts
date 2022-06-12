import {Asset, Web3Accounts} from "../index";
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {asset721, asset1155, erc20Tokens} from "./assets";
import {ethers} from "ethers";
import {joinECSignature} from "web3-wallets";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
const operator = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 4
    const erc721 = asset721[chainId][1] as Asset
    const erc1155 = asset1155[chainId][1] as Asset
    const user = new Web3Accounts({
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,

    })
    const tx1 = await user.transfer(erc721, seller, 1)
    await tx1.wait()

    const tx = await user.transfer(erc1155, seller, 1)
    await tx.wait()


})()
