import {Asset, Web3Accounts} from "../index";

import * as secrets from '../../../secrets.json'
import {MockContract} from "../src/contracts/mockContract";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
const operator = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 4
    const wallet = {
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,

    }
    const mock = new MockContract(wallet)
    const user = new Web3Accounts(wallet)

    if (!mock.Mock721 || !mock.Mock1155) throw 'Mock error'
    const mint721 = await mock.Mock721.mint()
    const mint721Tx = await mint721.wait()
    console.log("tokenId:",mint721Tx.events[0].args.tokenId.toString())

    const erc721 = {
        tokenId: mint721Tx.events[0].args.tokenId.toString(),
        tokenAddress: mock.Mock721.address,
        schemaName: 'ERC721'
    } as Asset
    const tx1 = await user.transfer(erc721, seller, 1)
    await tx1.wait()

    const tokenId = new Date().getTime().toString()
    const mint1155Tx = await mock.Mock1155.mint(tokenId, 10000)
    await mint1155Tx.wait()
    const erc1155 = {
        tokenId: tokenId,
        tokenAddress: mock.Mock1155.address,
        schemaName: 'ERC1155'
    } as Asset


    const tx = await user.transfer(erc1155, seller, 1)
    await tx.wait()

})()
