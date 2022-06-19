import {ContractBase} from './contracts'
import {ApproveInfo, Asset, ExchangeMetadata, Bytes} from "./types";

import {
    ethers, providers,
    EIP712TypedData,
    getProvider,
    LimitedCallSpec,
    NULL_ADDRESS,
    WalletInfo,
    ETH_TOKEN_ADDRESS,
    splitECSignature,
    getChainRpcUrl, hexUtils, ecSignHash, utils,
    ECSignature, privateKeysToAddress
} from "web3-wallets";
import {assetToMetadata, metadataToAsset, transactionToCallData} from "./hepler";

export class Web3Accounts extends ContractBase {
    constructor(wallet: WalletInfo) {
        super(wallet)
    }

    public async optimizationRpc() {
        const url = await getChainRpcUrl(this.walletInfo.chainId)
        if (this.walletInfo.rpcUrl) {
            this.walletInfo.rpcUrl.url = url
        } else {
            this.walletInfo.rpcUrl = {url}
        }
        return url
    }

    /**
     * Generate the EC signature for a hash given a private key.
     */
    public ecSignMessage(message: string, privateKey?: string) {
        let priKey = ""
        if (privateKey) {
            priKey = privateKey
        } else {
            if (this.walletInfo.privateKeys) {
                const addr = privateKeysToAddress(this.walletInfo.privateKeys)
                priKey = addr[this.walletInfo.address.toLowerCase()]
            }
        }
        if (priKey == "") throw Error("Private key error")
        const signMsg = ecSignHash(hexUtils.hashMessage(message), priKey)
        return {
            r: signMsg.r,
            s: signMsg.s,
            v: signMsg.v
        }
    }

    public async signMessage(message: string | Bytes): Promise<string> {
        const {walletSigner} = getProvider(this.walletInfo)
        if (utils.isHexString(message)) {
            message = utils.arrayify(message)
        }
        const signature = await walletSigner.signMessage(message).catch((error: any) => {
            this.emit('SignMessage', error)
            throw error
        })

        if (typeof signature != 'string') throw new Error("SignMessage error")
        const pubAddress = utils.verifyMessage(message, signature)
        console.assert(pubAddress.toLowerCase() == this.walletInfo.address.toLowerCase(), 'Sign message error')
        return signature
    }

    public async signTypedData(typedData: EIP712TypedData)
        : Promise<{ signature: string, signatureVRS: ECSignature, typedData: EIP712TypedData }> {

        const {walletProvider, walletSigner} = getProvider(this.walletInfo)
        const types = Object.assign({}, typedData.types)
        if (types.EIP712Domain) {
            delete types.EIP712Domain
        }
        let signature: string
        // if (walletProvider.isWalletConnect) {
        //     const walletSigner = new providers.Web3Provider(walletProvider).getSigner()
        //     signature = await walletSigner._signTypedData(typedData.domain, {Order: typedData.types.Order}, typedData.message)
        // }
        signature = await (<any>walletSigner)._signTypedData(typedData.domain, types, typedData.message).catch((error: any) => {
            this.emit('SignTypedData', error)
            throw error
        })

        const pubAddress = utils.verifyTypedData(typedData.domain, types, typedData.message, signature)
        const msg = `VerifyTypedData error ${pubAddress} ${this.walletInfo.address}`
        console.assert(pubAddress.toLowerCase() == this.walletInfo.address.toLowerCase(), msg)
        return {
            signature,
            signatureVRS: splitECSignature(signature),
            typedData
        }
    }

    public async approveERC20ProxyCalldata(tokenAddr: string, spender: string, allowance?: string): Promise<LimitedCallSpec> {
        const quantity = allowance || ethers.constants.MaxInt256.toString() //200e18.toString() //
        const erc20 = this.getContract(tokenAddr, this.erc20Abi)
        const data = await erc20.populateTransaction.approve(spender, quantity)
        return transactionToCallData(data)
    }

    public async approveERC20Proxy(tokenAddr: string, spender: string, allowance?: string) {
        const callData = await this.approveERC20ProxyCalldata(tokenAddr, spender, allowance)
        return this.ethSend(callData)
    }

    public async cancelERC20Approve(tokenAddr: string, operator: string) {
        const callData = await this.approveERC20ProxyCalldata(tokenAddr, operator, "0")
        return this.ethSend(callData)
    }

    public async approveERC721ProxyCalldata(tokenAddr: string, operator: string, isApprove = true): Promise<LimitedCallSpec> {
        const erc721 = this.getContract(tokenAddr, this.erc721Abi)
        const data = await erc721.populateTransaction.setApprovalForAll(operator, isApprove)
        return transactionToCallData(data)

    }

    public async approveERC721Proxy(tokenAddr: string, operator: string) {
        const callData = await this.approveERC721ProxyCalldata(tokenAddr, operator)
        return this.ethSend(callData)
    }

    public async cancelERC721Approve(tokenAddr: string, operator: string) {
        const callData = await this.approveERC721ProxyCalldata(tokenAddr, operator, false)
        return this.ethSend(callData)
    }

    public async approveERC1155ProxyCalldata(tokenAddr: string, operator: string, isApprove = true) {
        const erc1155 = this.getContract(tokenAddr, this.erc1155Abi)
        const data = await erc1155.populateTransaction.setApprovalForAll(operator, isApprove)
        return transactionToCallData(data)
    }

    public async approveErc1155Proxy(tokenAddr: string, operator: string) {
        const calldata = await this.approveERC1155ProxyCalldata(tokenAddr, operator)
        return this.ethSend(calldata)
    }

    public async cancelErc1155Approve(tokenAddr: string, operator: string) {
        const callData = await this.approveERC1155ProxyCalldata(tokenAddr, operator, false)
        return this.ethSend(callData)
    }

    public async assetApprove(asset: Asset, operator: string, allowance?: string) {
        const tokenAddr = asset.tokenAddress
        if (asset.schemaName.toLowerCase() == 'erc721') {
            return this.approveERC721Proxy(tokenAddr, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            return this.approveErc1155Proxy(tokenAddr, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc20') {
            return this.approveERC20Proxy(tokenAddr, operator, allowance)
        } else {
            throw new Error('Asset approve error')
        }
    }

    //-----------Get basic asset information-----------------
    public async getGasBalances(account?: { address?: string, rpcUrl?: string }): Promise<string> {
        const {address, rpcUrl} = account || {}
        const owner = address || this.signerAddress
        let provider: any = this.signer
        let rpc = rpcUrl || this.walletInfo.rpcUrl
        let ethBal = '0'
        if (rpcUrl) {
            const network = {
                name: owner,
                chainId: this.walletInfo.chainId
            }
            provider = new providers.JsonRpcProvider(rpc, network)
        }
        if (owner && ethers.utils.isAddress(owner)) {
            if (rpcUrl) {
                // ethBal = (await provider.getBalance(this.walletInfo.address)).toString()
                const ethStr = await provider.send('eth_getBalance', [owner, 'latest'])
                ethBal = parseInt(ethStr).toString()
            } else {
                const ethStr = (await provider.provider.send('eth_getBalance', [owner, 'latest']))
                ethBal = parseInt(ethStr).toString()

            }
        }
        return ethBal
    }

    public async getTokenBalances(params: { tokenAddr: string, account?: string, rpcUrl?: string }): Promise<string> {
        const {tokenAddr, account, rpcUrl} = params
        const owner = account || this.signerAddress
        let provider: any = this.signer
        let erc20Bal = '0'
        let rpc = rpcUrl || this.walletInfo.rpcUrl
        if (rpcUrl) {
            const network = {
                name: owner,
                chainId: this.walletInfo.chainId
            }
            provider = new providers.JsonRpcProvider(rpc, network)
        }
        if (tokenAddr
            && utils.isAddress(tokenAddr)
            && tokenAddr != NULL_ADDRESS
            && tokenAddr.toLowerCase() != ETH_TOKEN_ADDRESS.toLowerCase()) {

            const erc20 = this.getContract(tokenAddr, this.erc20Abi)
            if (rpcUrl) {
                // erc20Bal = await erc20.connect(provider).balanceOf(owner)
                const callData = await erc20.populateTransaction.balanceOf(owner)
                const erc20Str = await provider.send('eth_call', [callData, 'latest'])
                erc20Bal = parseInt(erc20Str).toString()
            } else {
                erc20Bal = await erc20.balanceOf(owner)
            }
        }
        return erc20Bal
    }

    public async getERC20Balances(erc20Addr: string, account?: string): Promise<string> {
        const owner = account || this.signerAddress
        const erc20 = this.getContract(erc20Addr, this.erc20Abi)
        const result = await erc20.balanceOf(owner)
        return result.toString()
    }

    public async getERC20Allowance(erc20Addr: string, spender: string, account?: string): Promise<string> {
        const owner = account || this.signerAddress
        const erc20 = this.getContract(erc20Addr, this.erc20Abi)
        const result = await erc20.allowance(owner, spender)
        return result.toString()
    }

    public async getERC20Decimals(erc20Addr: string): Promise<string> {
        const erc20 = this.getContract(erc20Addr, this.erc20Abi)
        const result = await erc20.decimals()
        return result.toString()
    }

    public async getERC721Balances(to: string, tokenId: string, account?: string): Promise<string> {
        const checkAddr = account || this.signerAddress
        const owner = await this.getERC721OwnerOf(to, tokenId)
        return checkAddr.toLowerCase() === owner.toLowerCase() ? '1' : '0'
    }

    public async getERC721OwnerOf(to: string, tokenId: string): Promise<string> {
        const erc721 = this.getContract(to, this.erc721Abi)
        return erc721.ownerOf(tokenId)
    }

    public async getERC721Allowance(to: string, operator: string, account?: string): Promise<boolean> {
        const owner = account || this.signerAddress
        const erc721 = this.getContract(to, this.erc721Abi)
        return erc721.isApprovedForAll(owner, operator)
    }

    public async getERC1155Balances(to: string, tokenId: string, account?: string): Promise<string> {
        const owner = account || this.signerAddress
        const erc1155 = this.getContract(to, this.erc1155Abi)
        const result = await erc1155.balanceOf(owner, tokenId)
        return result.toString()
    }

    public async getERC1155Allowance(to: string, operator: string, account?: string): Promise<boolean> {
        const owner = account || this.signerAddress
        const erc1155 = this.getContract(to, this.erc1155Abi)
        return erc1155.isApprovedForAll(owner, operator)
    }

    public async getAssetApprove(asset: Asset, operator: string, account?: string)
        : Promise<ApproveInfo> {
        const owner = account || this.signerAddress
        let isApprove = false, balances = '0', calldata
        const tokenAddr = asset.tokenAddress
        const tokenId = asset.tokenId || '0'
        if (asset.schemaName.toLowerCase() == 'erc721') {
            isApprove = await this.getERC721Allowance(tokenAddr, operator, owner)
            calldata = isApprove ? undefined : await this.approveERC721ProxyCalldata(tokenAddr, operator)
            balances = await this.getERC721Balances(tokenAddr, tokenId, owner)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            isApprove = await this.getERC1155Allowance(tokenAddr, operator, owner)
            calldata = isApprove ? undefined : await this.approveERC1155ProxyCalldata(tokenAddr, operator)
            balances = await this.getERC1155Balances(tokenAddr, tokenId, owner)
        }
        return {
            isApprove,
            balances,
            calldata
        }
    }

    public async getTokenApprove(tokenAddr: string, spender: string, account?: string)
        : Promise<{ allowance: string, balances: string, calldata: LimitedCallSpec }> {
        const owner = account || this.signerAddress
        if (utils.isAddress(tokenAddr)
            && tokenAddr != NULL_ADDRESS
            && tokenAddr.toLowerCase() != ETH_TOKEN_ADDRESS.toLowerCase()) {
            const allowance = await this.getERC20Allowance(tokenAddr, spender, owner)
            const balances = await this.getERC20Balances(tokenAddr, owner)
            const calldata = await this.approveERC20ProxyCalldata(tokenAddr, spender)
            return {
                allowance,
                balances,
                calldata
            }
        } else {
            throw new Error('User Account GetTokenApprove error')
        }
    }


    public async getAssetBalances(asset: Asset, account?: string) {
        const owner = account || this.signerAddress
        let balances = '0'
        const tokenAddr = asset.tokenAddress
        const tokenId = asset.tokenId || '0'
        if (asset.schemaName.toLowerCase() == 'erc721') {
            balances = await this.getERC721Balances(tokenAddr, tokenId, owner)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            balances = await this.getERC1155Balances(tokenAddr, tokenId, owner)
        } else if (asset.schemaName.toLowerCase() == 'erc20') {
            balances = await this.getERC20Balances(tokenAddr, owner)
        }
        return balances
    }

    public async getUserTokenBalance(token: {
        tokenAddr?: string,
        decimals?: number,
        account?: string,
        rpcUrl?: string
    }): Promise<{
        ethBal: number
        ethValue: string
        erc20Bal: number
        erc20Value: string
    }> {
        const {tokenAddr, account, rpcUrl} = token
        const decimals = token.decimals || 18

        const ethBal = !account ? "0" : await this.getGasBalances({address: account, rpcUrl})
        const erc20Bal = !tokenAddr || tokenAddr == NULL_ADDRESS || tokenAddr.toLowerCase() == ETH_TOKEN_ADDRESS.toLowerCase() ? "0"
            : await this.getTokenBalances({
                tokenAddr,
                account,
                rpcUrl
            })
        return {
            ethBal: Number(ethBal),
            ethValue: utils.formatEther(ethBal),
            erc20Bal: Number(erc20Bal),
            erc20Value: utils.formatUnits(erc20Bal, decimals)
        }
    }

    public async getUserTokensBalance(params: {
        tokens: {
            tokenAddr: string,
            decimals: number
        }[],
        account?: string,
        rpcUrl?: string
    }): Promise<{
        ethBal: number
        ethValue: string
        erc20Bals: {
            [key: string]: {
                decimals: number,
                erc20Bal: number
                erc20Value: string
            }
        }
    }> {
        const {tokens, account, rpcUrl} = params
        const ethBal = !account ? "0" : await this.getGasBalances({address: account, rpcUrl})
        const erc20Bals: {
            [key: string]: {
                decimals: number,
                erc20Bal: number
                erc20Value: string
            }
        } = {}
        for (const token of tokens) {
            const tokenAddr = token.tokenAddr || ""
            const decimals = token.decimals || 18


            const erc20Bal = !tokenAddr || tokenAddr == NULL_ADDRESS || tokenAddr.toLowerCase() == ETH_TOKEN_ADDRESS.toLowerCase() ? "0"
                : await this.getTokenBalances({
                    tokenAddr,
                    account,
                    rpcUrl
                })
            erc20Bals[tokenAddr] = {
                decimals,
                erc20Bal: Number(erc20Bal),
                erc20Value: utils.formatUnits(erc20Bal, decimals)
            }
        }
        return {
            ethBal: Number(ethBal),
            ethValue: utils.formatEther(ethBal),
            erc20Bals
        }
    }

    public async assetTransfer(metadata: ExchangeMetadata, to: string) {
        const from = this.signerAddress
        const assetQ = metadataToAsset(metadata)
        const balance = await this.getAssetBalances(assetQ, from)

        const {asset, schema} = metadata
        const {address, quantity, data, id} = asset

        if (Number(quantity || 1) > Number(balance)) {
            throw new Error('Asset balances not enough')
        }

        const tokenId = id
        let calldata
        if (schema.toLowerCase() == 'erc721') {
            const erc721 = this.getContract(address, this.erc721Abi)
            // const gas = await erc721.estimateGas.safeTransferFrom(from, to, tokenId)
            calldata = await erc721.populateTransaction.safeTransferFrom(from, to, tokenId)
        }

        if (schema.toLowerCase() == 'cryptokitties') {
            const erc721 = this.getContract(address, this.erc721Abi)
            calldata = await erc721.populateTransaction.transferFrom(from, to, tokenId)
        }

        if (schema.toLowerCase() == 'erc1155') {
            const erc1155 = this.getContract(address, this.erc1155Abi)
            // const gas = await erc1155.estimateGas.safeTransferFrom(from, to, tokenId, quantity, data || '0x')
            calldata = await erc1155.populateTransaction.safeTransferFrom(from, to, tokenId, quantity, data || '0x')
        }

        if (schema.toLowerCase() == 'erc20') {
            const erc20 = this.getContract(address, this.erc20Abi)
            calldata = await erc20.populateTransaction.safeTransferFrom(from, to, quantity)
        }
        if (!calldata) throw new Error(schema + 'asset transfer error')

        return this.ethSend(calldata)
    }

    public async transfer(asset: Asset, to: string, quantity: number) {
        const metadata = assetToMetadata(asset, quantity.toString())
        return this.assetTransfer(metadata, to)
    }


    public async wethWithdraw(ether: string) {
        const wad = utils.parseEther(ether)
        const data = await this?.GasWarpperContract?.populateTransaction.withdraw(wad)
        if (!data) throw new Error("Chain is not supported ")
        return this.ethSend(transactionToCallData(data))
    }

    public async wethDeposit(ether: string, depositFunc?: false) {
        const wad = utils.parseEther(ether)
        if (!this.GasWarpperContract) throw new Error("Chain is not supported ")
        let callData = {
            to: this.GasWarpperContract.address,
            value: wad.toString()
        } as LimitedCallSpec
        if (depositFunc) {
            callData = transactionToCallData(await this.GasWarpperContract.populateTransaction.deposit(wad))
        }
        return this.ethSend(callData)
    }
}



