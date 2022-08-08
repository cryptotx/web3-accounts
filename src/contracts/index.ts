import EventEmitter from 'events'

import {ContractABI} from "./abi";
import {Token} from "../types";
import {
    ethers, Signer, ContractInterface, Contract,
    ethSend,
    getProvider,
    LimitedCallSpec,
    WalletInfo,
    getChainInfo,
    getChainRpcUrl,
    getEstimateGas,
    privateKeysToAddress,
    Web3Provider,
    JsonRpcSigner
} from "web3-wallets";

export interface ContractAddresses {
    GasWarpperToken: string
    Helper?: string
}

export const COMMON_CONTRACTS_ADDRESSES: { [chainId: number]: ContractAddresses } = {
    1: {
        "GasWarpperToken": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "Helper": "0x68dc8D3ab93220e84b9923706B3DDc926C77f1Df"
    },
    4: {
        'GasWarpperToken': '0xc778417e063141139fce010982780140aa0cd5ab',
        "Helper": "0x3EA9c0104e3D218F003C74FD9Fe5fB4e883EF7DE"
    },
    56: {
        'GasWarpperToken': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    },
    97: {
        "GasWarpperToken": '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'
    },
    137: {
        'GasWarpperToken': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
    },
    80001: {
        'GasWarpperToken': '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
    },
    43114: {
        'GasWarpperToken': '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
    },
    43113: {
        'GasWarpperToken': '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
    }
}

export class ContractBase extends EventEmitter {
    public chainId: number
    public readonly signer: JsonRpcSigner
    public readonly signerAddress: string

    public walletInfo: WalletInfo
    public erc20Abi: ContractInterface
    public erc721Abi: ContractInterface
    public erc1155Abi: ContractInterface
    public contractAddresses: ContractAddresses
    public GasWarpperToken: Token | undefined
    public GasWarpperContract: Contract | undefined
    public HelperContract: Contract | undefined

    constructor(wallet: WalletInfo) {
        super()

        const {walletSigner, address, chainId} = getProvider(wallet)

        wallet.rpcUrl = {
            ...wallet.rpcUrl,
            url: wallet.rpcUrl?.url || getChainInfo(chainId).rpcs[0]
        }

        const accounts = wallet?.privateKeys && privateKeysToAddress(wallet.privateKeys)
        if (accounts) {
            if (!accounts[address.toLowerCase()]) throw 'PriKey error'
        }

        this.walletInfo = {...wallet, chainId, address}

        this.chainId = chainId
        this.signer = wallet.provider ? new Web3Provider(wallet.provider).getSigner(address) : walletSigner
        this.signerAddress = address

        this.erc20Abi = ContractABI.erc20.abi
        this.erc721Abi = ContractABI.erc721.abi
        this.erc1155Abi = ContractABI.erc1155.abi
        this.contractAddresses = COMMON_CONTRACTS_ADDRESSES[chainId]
        if (this.contractAddresses) {
            this.GasWarpperContract = this.getContract(this.contractAddresses.GasWarpperToken, ContractABI.weth.abi)
            this.GasWarpperToken = {
                name: 'GasWarpperToken',
                symbol: 'GasWarpperToken',
                address: this.contractAddresses.GasWarpperToken,
                decimals: 18
            }
            if (this.contractAddresses.Helper) {
                this.HelperContract = this.getContract(this.contractAddresses.Helper, ContractABI.helper.abi)
            }
        }

    }

    getContract(contractAddresses: string, abi: ContractInterface): Contract {
        return new ethers.Contract(contractAddresses, abi, this.signer)
    }

    async ethSend(callData: LimitedCallSpec) {
        return ethSend(this.walletInfo, callData)
    }

    async estimateGas(callData: LimitedCallSpec) {
        const rpcUrl = this.walletInfo.rpcUrl?.url || await getChainRpcUrl(this.chainId)
        return getEstimateGas(rpcUrl, callData)
    }
}
