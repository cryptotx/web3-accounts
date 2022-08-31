import EventEmitter from 'events'


import {WalletInfo, LimitedCallSpec} from "web3-wallets"

export type {TokenSchemaNames} from "web3-wallets"

export type {Bytes} from "@ethersproject/bytes";

export type {PopulatedTransaction} from "@ethersproject/contracts";

export interface APIConfig {
    chainId?: number
    account?: string
    apiBaseUrl?: string
    apiKey?: string
    authToken?: string
    apiTimeout?: number
    proxyUrl?: string
    protocolFeePoints?: number
    protocolFeeAddress?: string
    contractAddresses?: any
}

export enum ElementSchemaName {
    ERC20 = 'ERC20',
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
    CryptoKitties = 'CryptoKitties',
    ENSShortNameAuction = 'ENSShortNameAuction',
    LegacyEnjin = 'Enjin',
    CryptoPunks = 'CryptoPunks'
}

export interface FeesInfo {
    royaltyFeeAddress: string;
    royaltyFeePoints: number;
    protocolFeePoints?: number;
    protocolFeeAddress?: string;
}

export interface Asset {
    // The asset's contract address
    tokenAddress: string
    // The Element schema name (e.g. "ERC721") for this asset
    schemaName: string
    // Optional for ENS names
    // The asset's token ID, or null if ERC-20
    tokenId?: string
    name?: string
    data?: string
    // Optional for fungible items
    decimals?: number
    chainId?: number
    collection?: Partial<FeesInfo>
}

interface NFTAsset {
    id: string
    address: string
    quantity?: string
    data?: string
}

interface FTAsset {
    id?: string
    address: string
    quantity: string
    data?: string
}

export type MetaAsset = NFTAsset | FTAsset

export interface ExchangeMetadata {
    asset: MetaAsset
    schema: string
    version?: number
    referrerAddress?: string
}

export interface Token {
    name: string
    symbol: string
    address: string
    decimals: number
}


export enum OrderSide {
    All = -1,
    Buy = 0,
    Sell = 1
}

export interface MixedPayment {
    ethValue: string,
    wethValue: string
}

export type MatchParams = {
    orderStr: string;
    takerAmount?: string
    makerAddress?: string
    assetRecipientAddress?: string
    metadata?: string
    protocol?: string
}

export interface CreateOrderParams {
    asset: Asset
    quantity: number
    paymentToken: Token
    startAmount: number
    expirationTime: number
    protocolFeePoints?: number
    protocolFeeAddress?: string
    protocol?: string
    nonce?: number
    accountAddress?: string,
    isCheckOrderApporve?: boolean
}

export interface SellOrderParams extends CreateOrderParams {
    listingTime?: number
    endAmount?: number
    buyerAddress?: string
    englishAuctionReservePrice?: number
}

export enum OfferType {
    ItemOffer = 'item_offer',
    ContractOffer = 'contract_offer'
}

export interface BuyOrderParams extends CreateOrderParams {
    askOrderStr?: string // best ask
    offerType?: OfferType
}

export interface FeesInfo {
    royaltyFeeAddress: string
    royaltyFeePoints: number
    protocolFeePoints?: number
    protocolFeeAddress?: string
}

export interface AdjustOrderParams extends FeesInfo {
    orderStr: string
    basePrice: string
    protocol?: string
    quantity?: number
    expirationTime?: number
    paymentToken?: Token
    accountAddress?: string,
    nonce?: number
}

export type ApproveInfo = {
    isApprove: boolean;
    balances: string;
    calldata: LimitedCallSpec | undefined;
}

export interface MatchOption {
    mixedPayment?: MixedPayment
}

export interface MatchOrderOption extends MatchOption {
    metadata?: string
    takerAmount?: string
    taker?: string
    protocol?: string
    sellTokenId?: string
}

export type OrderOption = Omit<MatchOrderOption, "mixedPayment"> & { orderStr: string }

export interface MatchOrdersParams extends MatchOption {
    orderList: OrderOption []
}

export interface ExchangetAgent extends EventEmitter {
    contracts: any
    walletInfo: WalletInfo
    getOrderApprove: (params: CreateOrderParams, side: OrderSide) => Promise<ApproveInfo>
    getMatchCallData: (params: MatchParams) => Promise<any>
    createSellOrder: (order: SellOrderParams) => Promise<any>
    createBuyOrder: (order: BuyOrderParams) => Promise<any>
    cancelOrders: (orders: string[]) => Promise<any>
    cancelAllOrders?: (nonce?: string) => Promise<any>
    fulfillOrder: (order: string, option?: MatchOrderOption) => Promise<any>
    fulfillOrders?: (orders: MatchOrdersParams) => Promise<any>
    adjustOrder?: (order: AdjustOrderParams) => Promise<any>
    postOrder?: (orderStr: string) => Promise<any>
    getAssetsFees?: (assets: string[]) => Promise<FeesInfo[]>
    createLowerPriceOrder?: (order: AdjustOrderParams) => Promise<any>
    checkOrderMatch?: (order: string, params?: MatchParams) => Promise<any>
    checkOrderPost?: (order: string, params?: MatchParams) => Promise<any>
    // matchOrder?: (order: string, option?: MatchOrderOption) => Promise<any>
    // matchOrders?: (orders: MatchOrdersParams) => Promise<any>
    // getAssetApprove?: (metadatas: ExchangeMetadata[], decimals?: number) => Promise<{ isApprove: boolean, balances: string, calldata: LimitedCallSpec | undefined }[]>
    // getRegisterProxy?: () => Promise<{ isRegister: boolean, accountProxy: string, calldata: LimitedCallSpec | undefined }>
}


// export interface EnglishAuctionOrderParams extends CreateOrderParams {
//     englishAuctionReservePrice?: number
// }

export interface AssetCheckInfo {
    itemType: number
    allowance: string
    balance: string
    erc721Owner: string
    erc721ApprovedAccount: string
}

