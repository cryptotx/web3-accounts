# web3-accounts<!-- omit in toc -->
Common utils for account operation ERC20 ERC721 ERC1155

## Installation

In your project, run:

```bash
npm i web3-accounts
```

## Getting Started
 

```JavaScript 
import { Web3Accounts} from "web3-accounts"; 
const account = new Web3Accounts({
    chainId:1,
    address: "0x548427d1418066763173dd053D9d1AE32D161310"
})
const sign =await account.signMessage('Hello Web3')
```

## The signature method
```ts
    ecSignMessage(message: string, privateKey?: string)  

    async signMessage(message: string | Bytes) 

    async signTypedData(typedData: EIP712TypedData)
```
```ts
    const user = new Web3Accounts({
        chainId,
        address: seller,
        privateKeys: secrets.privateKeys,
    })
    const msg = 'hello web3'
    const ecSign = user.ecSignMessage(msg)
    const signature = await user.signMessage(msg)
    console.assert(joinECSignature(ecSign) == signature)
```

## Approve and de-Approve
```ts
async approveERC20Proxy(tokenAddr: string, spender: string, allowance?: string)

async cancelERC20Approve(tokenAddr: string, operator: string)

async approveERC721Proxy(tokenAddr: string, operator: string)

async cancelERC721Approve(tokenAddr: string, operator: string)

async approveERC1155Proxy(tokenAddr: string, operator: string)

async cancelERC1155Approve(tokenAddr: string, operator: string)

async assetApprove(asset: Asset, operator: string, allowance?: string)

```
```ts
 const erc20Approve = await user.approveERC20Proxy(tokenAddr, seller, "200")
 await erc20Approve.wait()
```
## Get basic asset information
```ts
async getGasBalances(account?: { address?: string, rpcUrl?: string })

async getTokenBalances(params: { tokenAddr: string, account?: string, rpcUrl?: string })

async getERC20Balances(erc20Addr: string, account?: string)

async getERC20Allowance(erc20Addr: string, spender: string, account?: string)

async getERC20Decimals(erc20Addr: string)

async getERC721Balances(to: string, tokenId: string, account?: string)

async getERC721OwnerOf(to: string, tokenId: string)

async getERC721Allowance(to: string, operator: string, account?: string)

async getERC1155Balances(to: string, tokenId: string, account?: string)

async getERC1155Allowance(to: string, operator: string, account?: string)

async getAssetApprove(asset: Asset, operator: string, account?: string)

async getTokenApprove(tokenAddr: string, spender: string, account?: string)

async getAssetBalances(asset: Asset, account?: string)

async getUserTokenBalance(token: { tokenAddr?: string, decimals?: number, account?: string, rpcUrl?: string})

async getUserTokensBalance(params: {
    tokens: {
        tokenAddr: string,
            decimals: number
    }[],
    account?: string,
    rpcUrl?: string
})
```
```ts
const erc721={
    tokenId: '27',
    tokenAddress: '0x56df6c8484500dc3e2fe5a02bed70b4969ffafdb',
    schemaName: 'erc721'
}
const bal721 = await user.getAssetBalances(erc721)
const erc1155 ={
    tokenId: '13',
    tokenAddress: '0x991a868aa7b0a9a24565ede2d8fe758874a6a217',
    schemaName: 'ERC1155'
} 
const bal1155 = await user.getAssetBalances(erc1155)
```
## Transfer of assets
```ts
async assetTransfer(metadata: ExchangeMetadata, to: string)

async transfer(asset: Asset, to: string, quantity: number)
```

```ts
 const tx = await user.transfer(erc721, seller, 1)
 await tx.wait()
```

## Weth transfer between eth
```ts
async wethWithdraw(ether: string)

async wethDeposit(ether: string, depositFunc?: false)
```

```ts
    const bal20 = await user.getERC20Balances(tokenAddr)
    const wethBal = ethers.utils.formatUnits(bal20).toString()
    const wethWithdrawTx = await user.wethWithdraw(wethBal)
    await wethWithdrawTx.wait()

    const wethDepositTx = await user.wethDeposit(wethBal)
    await wethDepositTx.wait()
```

## Type conversion funciton
```ts
  assetToMetadata(asset: Asset, quantity: string = "1", data?: string): ExchangeMetadata 

  metadataToAsset(metadata: ExchangeMetadata, data?: Asset): Asset  

  tokenToAsset(token: Token): Asset  

  tokenToMetadata(token: Token, quantity: string = "1", data?: string): ExchangeMetadata  

  transactionToCallData(data: PopulatedTransaction): LimitedCallSpec
 
```


