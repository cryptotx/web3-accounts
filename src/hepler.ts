import {Asset, ExchangeMetadata, Token, PopulatedTransaction} from "./types";
import {ETH_TOKEN_ADDRESS, LimitedCallSpec, NULL_ADDRESS} from "web3-wallets";


export const ETHToken: Token = {
    name: 'etherem',
    symbol: 'ETH',
    address: ETH_TOKEN_ADDRESS,
    decimals: 18
}

export const NullToken: Token = {
    name: 'etherem',
    symbol: 'ETH',
    address: NULL_ADDRESS,
    decimals: 18
}

export function assetToMetadata(asset: Asset, quantity: string = "1", data?: string): ExchangeMetadata {
    return <ExchangeMetadata>{
        asset: {
            id: asset.tokenId,
            address: asset.tokenAddress,
            quantity,
            data
        },
        schema: asset.schemaName
    }
}

export function metadataToAsset(metadata: ExchangeMetadata, data?: Asset): Asset {
    return <Asset>{
        ...data,
        tokenId: metadata.asset.id,
        tokenAddress: metadata.asset.address,
        schemaName: metadata.schema
    }
}

export function tokenToAsset(token: Token): Asset {
    return <Asset>{
        tokenId: undefined,
        tokenAddress: token.address,
        schemaName: 'ERC20',
        decimals: token.decimals
    }
}

export function tokenToMetadata(token: Token, quantity: string = "1", data?: string): ExchangeMetadata {
    return <ExchangeMetadata>{
        asset: {
            id: undefined,
            address: token.address,
            quantity,
            data
        },
        schema: 'ERC20'
    }
}

export function transactionToCallData(data: PopulatedTransaction): LimitedCallSpec {
    return {
        from: data.from,
        to: data.to,
        data: data.data,
        value: data.value
    } as LimitedCallSpec
}


