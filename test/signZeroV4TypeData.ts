import {Web3Accounts} from "../index"
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {zeroV4721TypeData, zeroV41155TypedData} from "./data/order";
import {getEIP712DomainHash, getEIP712Hash} from "web3-wallets";

const DOMAIN_DEFAULT = {
    name: 'ZeroEx',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
    version: '1.0.0',
};
const hash1 = getEIP712Hash(zeroV41155TypedData)
const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 1
    const user = new Web3Accounts({
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys
    })

    const hash = getEIP712DomainHash(DOMAIN_DEFAULT)
    //0xc92fa40dbe33b59738624b1b4ec40b30ff52e4da223f68018a7e0667ffc0e798
    console.log(hash)

    // const signMsg = await user.signMessage("hello")
    // const hash = getEIP712Hash(data)
    // console.log(signMsg)
    const sign1155 = await user.signTypedData(zeroV41155TypedData)
    console.log(sign1155)

    const sign = await user.signTypedData(zeroV4721TypeData)
    console.log(sign)
})()
