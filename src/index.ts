import {ContractBase} from './contracts'
import {ApproveInfo, Asset, ExchangeMetadata, Bytes, AssetCheckInfo} from "./types";
import {
    ethers, providers,
    EIP712TypedData,
    getProvider,
    LimitedCallSpec,
    WalletInfo,
    splitECSignature,
    getChainRpcUrl, hexUtils, ecSignHash, utils,
    ECSignature, privateKeysToAddress, RpcInfo
} from "web3-wallets";
import {assetToMetadata, isETHAddress, metadataToAsset, transactionToCallData} from "./hepler";
import pkg from "../package.json"
import {BaseFetch} from "./baseFetch";

const OpenSeaApiUrl = {
    1: 'https://api.opensea.io',
    4: 'https://testnets-api.opensea.io'
}

export class Web3Accounts extends ContractBase {
    public version = pkg.version

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
        if (!priKey) throw Error("Private key error")
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
        const domain = typedData.domain
        const value = typedData.message
        const address = this.signerAddress.toLowerCase();
        signature = await (<any>walletSigner)._signTypedData(domain, types, value).catch((error: any) => {
            this.emit('SignTypedData', error)
            throw error
        })

        const pubAddress = utils.verifyTypedData(domain, types, value, signature)
        const msg = `VerifyTypedData error ${pubAddress} ${address}`
        console.assert(pubAddress.toLowerCase() == address, msg)
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

    public async assetCancelApprove(asset: Asset, operator: string, allowance?: string) {
        const tokenAddr = asset.tokenAddress
        if (asset.schemaName.toLowerCase() == 'erc721') {
            return this.cancelERC721Approve(tokenAddr, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            return this.cancelErc1155Approve(tokenAddr, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc20') {
            return this.cancelERC20Approve(tokenAddr, operator)
        } else {
            throw new Error('Asset approve error')
        }
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
    public async getGasBalances(account?: { address?: string, rpcUrl?: string, timeout?: number }): Promise<string> {
        const {address, rpcUrl, timeout} = account || {}
        const owner = address || this.signerAddress
        let provider: any = this.signer
        let ethBal = '0'
        if (rpcUrl) {
            const network = {
                name: owner,
                chainId: this.walletInfo.chainId
            }
            provider = new providers.JsonRpcProvider({url: rpcUrl, timeout: 10000}, network)
        }
        if (owner && ethers.utils.isAddress(owner)) {
            if (rpcUrl) {
                // ethBal = (await provider.getBalance(this.walletInfo.address)).toString()
                const ethStr = await provider.send('eth_getBalance', [owner, 'latest']).catch(err => {
                    throw err
                })
                ethBal = parseInt(ethStr).toString()
            } else {
                const ethStr = (await provider.provider.send('eth_getBalance', [owner, 'latest']))
                ethBal = parseInt(ethStr).toString()

            }
        }
        return ethBal
    }

    public async getTokenBalances(params: { tokenAddr: string, account?: string, rpcUrl?: string, timeout?: number }): Promise<string> {
        const {tokenAddr, account, rpcUrl, timeout} = params
        const owner = account || this.signerAddress
        let provider: any = this.signer
        let erc20Bal = '0'
        if (rpcUrl) {
            const network = {
                name: owner,
                chainId: this.walletInfo.chainId
            }
            provider = new providers.JsonRpcProvider({url: rpcUrl, timeout: timeout || 10000}, network)
        }
        if (isETHAddress(tokenAddr)) {
            erc20Bal = await this.getGasBalances({address: account, rpcUrl})
        } else {
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
        return erc20Bal.toString()
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

    public async getERC721Approved(to: string, operator: string, account?: string): Promise<boolean> {
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

    public async getERC1155Approved(to: string, operator: string, account?: string): Promise<boolean> {
        const owner = account || this.signerAddress
        const erc1155 = this.getContract(to, this.erc1155Abi)
        return erc1155.isApprovedForAll(owner, operator)
    }

    public async getAssetApprove(asset: Asset, operator: string, account?: string): Promise<ApproveInfo> {
        const owner = account || this.signerAddress
        let isApprove = false, balances = '0', calldata
        const address = asset.tokenAddress
        if (!utils.isAddress(address)) throw new Error("The address format is incorrect")
        const tokenId = asset.tokenId || '0'
        if (asset.schemaName.toLowerCase() == 'erc721') {
            isApprove = await this.getERC721Approved(address, operator, owner)
            balances = await this.getERC721Balances(address, tokenId, owner)
            calldata = isApprove || balances == "0" ? undefined : await this.approveERC721ProxyCalldata(address, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            isApprove = await this.getERC1155Approved(address, operator, owner)
            balances = await this.getERC1155Balances(address, tokenId, owner)
            calldata = isApprove || balances == "0" ? undefined : await this.approveERC1155ProxyCalldata(address, operator)
        } else if (asset.schemaName.toLowerCase() == 'erc20') {
            if (isETHAddress(address)) {
                isApprove = true
                balances = await this.getGasBalances()
            } else {
                const allowance = await this.getERC20Allowance(address, operator, owner)
                balances = await this.getERC20Balances(address, owner)
                isApprove = ethers.BigNumber.from(allowance).gt(balances)
                calldata = isApprove || balances == "0" ? undefined : await this.approveERC20ProxyCalldata(address, operator)
            }
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
        if (isETHAddress(tokenAddr)) throw new Error('Token address means is ETH')
        const allowance = await this.getERC20Allowance(tokenAddr, spender, owner)
        const balances = await this.getERC20Balances(tokenAddr, owner)
        const calldata = await this.approveERC20ProxyCalldata(tokenAddr, spender)
        return {
            allowance,
            balances,
            calldata
        }

    }

    public async getAssetBalances(asset: Asset, account?: string) {
        const owner = account || this.signerAddress
        let balances = '0'
        const address = asset.tokenAddress
        if (isETHAddress(address)) return this.getGasBalances({address})
        const tokenId = asset.tokenId || '0'
        if (asset.schemaName.toLowerCase() == 'erc721') {
            balances = await this.getERC721Balances(address, tokenId, owner)
        } else if (asset.schemaName.toLowerCase() == 'erc1155') {
            balances = await this.getERC1155Balances(address, tokenId, owner)
        } else if (asset.schemaName.toLowerCase() == 'erc20') {
            balances = await this.getERC20Balances(address, owner)
        }
        return balances
    }

    public async getUserTokenBalance(token: {
        tokenAddr?: string,
        decimals?: number,
        account?: string,
        rpcUrl?: string,
        timeout?: number
    }): Promise<{
        ethBal: number
        ethValue: string
        erc20Bal: number
        erc20Value: string
    }> {
        const {tokenAddr, account, rpcUrl, timeout} = token
        const decimals = token.decimals || 18

        const ethBal = !account ? "0" : await this.getGasBalances({address: account, rpcUrl, timeout}).catch(e => {
            throw e
        })
        const erc20Bal = !tokenAddr || isETHAddress(tokenAddr) ? "0"
            : await this.getTokenBalances({
                tokenAddr,
                account,
                rpcUrl,
                timeout
            }).catch(e => {
                throw e
            })
        return {
            ethBal: Number(ethBal),
            ethValue: utils.formatEther(ethBal),
            erc20Bal: Number(erc20Bal),
            erc20Value: utils.formatUnits(erc20Bal, decimals)
        }
    }

    public async getTokensBalance(tokens:
                                      {
                                          token: string,
                                          decimals: number
                                      }[],
                                  rpcUrl?: string,
                                  timeOut?: number
    ): Promise<{
        token: string
        balance: string
        value: string
        status: string
    }[]> {
        let promises: Promise<any>[] = []
        for (const token of tokens) {
            const tokenAddr = token.token || ""
            if (isETHAddress(tokenAddr)) {
                promises.push(this.getGasBalances({rpcUrl}))
            } else {
                promises.push(this.getTokenBalances({tokenAddr, rpcUrl}))
            }
        }
        // const decimals = token.decimals || 18
        // @ts-ignore
        const bals = await Promise.allSettled(promises)


        return tokens.map((val, index) => ({
            token: val.token,// @ts-ignore
            balance: utils.formatUnits(bals[index].value, val.decimals),// @ts-ignore
            value: bals[index].value,
            status: bals[index].status
        }))
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


            const erc20Bal = !tokenAddr || isETHAddress(tokenAddr) ? "0"
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

    public async wethBalances(account?: string) {
        if (!this.GasWarpperContract) throw new Error("Chain is not supported WETH")
        const tokenAddr = this.GasWarpperContract.address
        return this.getTokenBalances({tokenAddr, account})
    }

    public async wethWithdraw(wad: string) {
        // const wad = utils.parseEther(ether)
        const data = await this?.GasWarpperContract?.populateTransaction.withdraw(wad)
        if (!data) throw new Error("Chain is not supported WETH")
        const calldata = transactionToCallData(data)
        return this.ethSend(calldata)
    }

    public async wethDeposit(wad: string, depositFunc?: boolean) {
        // const wad = utils.parseEther(ether)
        if (!this.GasWarpperContract) throw new Error("Chain is not supported WETH")
        let callData = {
            from: this.walletInfo.address,
            to: this.GasWarpperContract.address,
            value: wad
        } as LimitedCallSpec
        if (depositFunc) {
            const data = await this.GasWarpperContract.populateTransaction.deposit({value: wad})
            callData = transactionToCallData(data)
        }
        return this.ethSend(callData)
    }

    public async getAssetsApprove(assets: Asset[], operator: string, account?: string) {
        const owner = account || this.signerAddress
        const apprves: ApproveInfo[] = []
        for (const asset of assets) {
            let isApprove = false, balances = '0', calldata
            const address = asset.tokenAddress
            if (!utils.isAddress(address)) throw new Error("The address format is incorrect")
            const tokenId = asset.tokenId || '0'
            if (asset.schemaName.toLowerCase() == 'erc721') {
                isApprove = await this.getERC721Approved(address, operator, owner)
                balances = await this.getERC721Balances(address, tokenId, owner)
                calldata = isApprove || balances == "0" ? undefined : await this.approveERC721ProxyCalldata(address, operator)
            } else if (asset.schemaName.toLowerCase() == 'erc1155') {
                isApprove = await this.getERC1155Approved(address, operator, owner)
                balances = await this.getERC1155Balances(address, tokenId, owner)
                calldata = isApprove || balances == "0" ? undefined : await this.approveERC1155ProxyCalldata(address, operator)
            } else if (asset.schemaName.toLowerCase() == 'erc20') {
                if (isETHAddress(address)) {
                    isApprove = true
                    balances = await this.getGasBalances()
                } else {
                    const allowance = await this.getERC20Allowance(address, operator, owner)
                    balances = await this.getERC20Balances(address, owner)
                    isApprove = ethers.BigNumber.from(allowance).gt(balances)
                    calldata = isApprove || balances == "0" ? undefined : await this.approveERC20ProxyCalldata(address, operator)
                }
            }
            apprves.push({
                isApprove,
                balances,
                calldata
            })
        }

        return apprves
    }

    public async getUserAssets(params: { account?: string, chainId?: number, limit?: number, orders?: boolean, proxyUrl?: string }) {
        const {account, chainId, limit, orders, proxyUrl} = params
        const baseUrl = OpenSeaApiUrl[chainId || this.walletInfo.chainId]
        const fetch = new BaseFetch({apiBaseUrl: baseUrl, proxyUrl})
        const query = {
            include_orders: orders || false,
            limit: limit || 10,
            owner: account || this.walletInfo.address
        }

        try {
            //https://testnets-api.opensea.io/api/v1/assets?include_orders=false&limit=1&owner=0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401
            // const url = `${baseUrl}${queryUrl}`
            const json = await fetch.get("/api/v1/assets", query)
            return json.assets.map(val => ({
                ...val.asset_contract,
                royaltyFeePoints: Number(val.collection?.dev_seller_fee_basis_points),
                protocolFeePoints: Number(val.collection?.opensea_seller_fee_basis_points),
                royaltyFeeAddress: val.collection?.payout_address,
                sell_orders: val.sell_orders,
                token_id: val.token_id,
                id: val.id,
                supports_wyvern: val.supports_wyvern
            }))
        } catch (error) {
            throw error
        }
    }

    public async getUserAssetsApprove(assets: Asset[], operator: string, account?: string) {
        const owner = account || this.signerAddress
        const tokens: string[] = []
        const tokenIds: string[] = []
        for (const asset of assets) {
            const address = asset.tokenAddress
            if (!utils.isAddress(address)) throw new Error("The address format is incorrect")
            tokens.push(address)
            const tokenId = asset.tokenId || '0'
            tokenIds.push(tokenId)
        }
        const checkInfo: AssetCheckInfo[] = await this.HelperContract?.checkAssets(owner, operator, tokens, tokenIds)
        const approves: any[] = []
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i]
            const address = asset.tokenAddress
            const approveInfo = checkInfo[i]
            let isApprove = false, balances = '0', calldata
            if (asset.schemaName.toLowerCase() == 'erc721' && approveInfo.itemType == 0) {
                balances = approveInfo.balance.toString()
                isApprove = approveInfo.allowance.toString() == "1"
                calldata = isApprove || balances == "0" ? undefined : await this.approveERC721ProxyCalldata(address, operator)
            } else if (asset.schemaName.toLowerCase() == 'erc1155' && approveInfo.itemType == 1) {
                balances = approveInfo.balance.toString()
                isApprove = approveInfo.allowance.toString() == "1"
                calldata = isApprove || balances == "0" ? undefined : await this.approveERC1155ProxyCalldata(address, operator)
            } else if (asset.schemaName.toLowerCase() == 'erc20' && approveInfo.itemType == 2) {
                if (isETHAddress(address)) {
                    isApprove = true
                    balances = await this.getGasBalances()
                } else {
                    const allowance = approveInfo.allowance.toString()
                    balances = approveInfo.balance.toString()
                    isApprove = ethers.BigNumber.from(allowance).gt(balances)
                    calldata = isApprove || balances == "0" ? undefined : await this.approveERC20ProxyCalldata(address, operator)
                }
            }
            if (approves.find(val => val.token == address)) continue
            approves.push({
                token: address,
                tokenId: asset.tokenId || "",
                isApprove,
                balances,
                calldata
            })
        }
        return approves
    }
}



