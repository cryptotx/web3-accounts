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

## Approve and de-Approve
```ts
async approveErc20Proxy(tokenAddr: string, spender: string, allowance?: string)

async cancelErc20Approve(tokenAddr: string, operator: string)

async approveErc721Proxy(tokenAddr: string, operator: string)

async cancelErc721Approve(tokenAddr: string, operator: string)

async approveErc1155Proxy(tokenAddr: string, operator: string)

async cancelErc1155Approve(tokenAddr: string, operator: string)

async assetApprove(asset: Asset, operator: string, allowance?: string)

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
## Transfer of assets
```ts
async assetTransfer(metadata: ExchangeMetadata, to: string)

async transfer(asset: Asset, quantity: string, to: string)
```

## Weth transfer between eth
```ts
async wethWithdraw(ether: string)

async wethDeposit(ether: string, depositFunc?: false)
```
## Type conversion funciton
```ts
  assetToMetadata(asset: Asset, quantity: string = "1", data?: string): ExchangeMetadata 

  metadataToAsset(metadata: ExchangeMetadata, data?: Asset): Asset  

  tokenToAsset(token: Token): Asset  

  tokenToMetadata(token: Token, quantity: string = "1", data?: string): ExchangeMetadata  

  transactionToCallData(data: PopulatedTransaction): LimitedCallSpec
```

