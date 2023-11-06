import {Asset, Web3Accounts} from "../index";
import * as secrets from '../../../secrets.json'
import {asset721, asset1155, erc20Tokens} from "./data/assets";
import {ethers} from "ethers";
import {Contract, ContractInterface, joinECSignature} from "web3-wallets";
import {permitTypeData} from "./data/order";


//https://rinkeby.etherscan.io/address/0x9C35F8183E01acFA6B7db0408Ef9e52B8c63bEC8#writeContract

const seller = '0x36B1a29E0bbD47dFe9dcf7380F276e86da90c4c2';
(async () => {
    const chainId = 5
    const user = new Web3Accounts({
        chainId,
        address: seller,
        rpcUrl:{url:"https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"},
        privateKeys: secrets.privateKeys,
    })
    // {}
    const value = "0", deadline = "16654005311"
    permitTypeData.domain.chainId  = chainId
    permitTypeData.message.owner = seller
    permitTypeData.message.spender = seller
    permitTypeData.message.nonce = "0"
    permitTypeData.message.value = value
    permitTypeData.message.deadline = deadline
    const ecSign =await user.signTypedData(permitTypeData)
    // console.log(ecSign)

    const erc20 = await user.getContract('0xE7b2f68C1330b28950279D9806AD13951225952E', user.erc20Abi)

    const nonce = await erc20.nonces(seller)

    const gas = await erc20.estimateGas.permit(seller, seller, "0",deadline,ecSign.signatureVRS.v,ecSign.signatureVRS.r,ecSign.signatureVRS.s)
    console.log(gas)
})()
