import {Asset, Web3Accounts} from "../index";
// @ts-ignore
import * as secrets from '../../../secrets.json'
import {asset721, asset1155, erc20Tokens, erc20Asset} from "./data/assets";
import {ethers} from "ethers";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
const operator = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 4
    const erc721 = asset721[chainId][0] as Asset
    const erc1155 = asset1155[chainId][0] as Asset
    const erc20 = erc20Asset[chainId][1] as Asset
    const user = new Web3Accounts({
        chainId,
        address: seller

    })

    const wethBalance = await user.wethBalances()

    console.log(wethBalance)

    const approve20 = await user.getAssetApprove(erc20,operator)

    const approve721 = await user.getAssetApprove(erc721,operator)
    const approve1155 = await user.getAssetApprove(erc1155,operator)


    //  rpcUrl:{url:"https://api-test.element.market/api/bsc/jsonrpc"}
    // console.log(await user.optimizationRpc())
    const bal721 = await user.getAssetBalances(erc721)
    const tx = await user.cancelERC721Approve(erc721.tokenAddress, operator)
    await tx.wait()




    const bal1155 = await user.getAssetBalances(erc1155)
    console.log(bal721, bal1155)


    const tokenAddr = user.contractAddresses.GasWarpperToken
    const erc20Decimals = await user.getERC20Decimals(tokenAddr)
    const erc20Allowance = await user.getERC20Allowance(tokenAddr, seller)
    if (erc20Allowance == "0") {
        const erc20Approve = await user.approveERC20Proxy(tokenAddr, seller, "200")
        await erc20Approve.wait()
        const erc20allowance200 = await user.getERC20Allowance(tokenAddr, seller)
    } else {
        const erc20Approve = await user.cancelERC20Approve(tokenAddr, seller)
        await erc20Approve.wait()
        const erc20allowance0 = await user.getERC20Allowance(tokenAddr, seller)
    }


    const bal20 = await user.getERC20Balances(tokenAddr)

    console.log(bal20)
    const wethBal = ethers.utils.formatUnits(bal20).toString()
    const wethWithdrawTx = await user.wethWithdraw(wethBal)
    await wethWithdrawTx.wait()

    const wethDepositTx = await user.wethDeposit(wethBal)
    await wethDepositTx.wait()


})()
