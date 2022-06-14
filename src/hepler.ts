import {Asset, ExchangeMetadata, Token} from "./types";
import {ETH_TOKEN_ADDRESS, LimitedCallSpec, NULL_ADDRESS} from "web3-wallets";
import {PopulatedTransaction} from "@ethersproject/contracts";
import {HttpsProxyAgent} from "https-proxy-agent";
import fetch from 'node-fetch';

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

export async function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({status: 'wakeUp'})
        }, ms)
    })
}

async function _handleApiResponse(response: Response) {
    if (response.ok) {
        // this.logger(`Got success: ${response.status}`)
        return response
    }

    let result
    let errorMessage
    try {
        result = await response.text()
        console.log(result)
        result = JSON.parse(result)
    } catch (error: any) {
        console.error('_handleApiResponse', error)
        // Result will be undefined or text
    }

    // this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`)

    switch (response.status) {
        case 400:
            errorMessage = result && result.errors ? result.errors.join(', ') : `Invalid request: ${JSON.stringify(result)}`
            break
        case 401:
        case 403:
            errorMessage = `Unauthorized. Full message was '${JSON.stringify(result)}'`
            break
        case 404:
            errorMessage = `Not found. Full message was '${JSON.stringify(result)}'`
            break
        case 500:
            errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
                result
            )}`
            break
        case 503:
            errorMessage = `Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
                result
            )}`
            break
        default:
            errorMessage = `Message: ${JSON.stringify(result)}`
            break
    }

    throw new Error(`API Error ${response.status}: ${errorMessage}`)
}

export function checkURL(URL: string) {
    const str = URL;
    const Expression = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/;
    const objExp = new RegExp(Expression);
    if (objExp.test(str) == true) {
        return true;
    } else {
        return false;
    }
}

export async function fetchJson(url: string, options?: {
    opts?: RequestInit,
    timeout?: number,
    proxyUrl?: string
}) {
    const {opts, timeout, proxyUrl} = options || {}
    if (!checkURL(url)) throw new Error("error url:" + url)
    if (proxyUrl && !checkURL(proxyUrl)) throw new Error("error proxyUrl:" + url)

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 5000);
    let finalOpts: RequestInit = {
        signal: controller.signal
    }
    if (opts) {
        finalOpts = {
            ...opts,
            headers: {
                ...(opts.headers || {})
            },
            signal: controller.signal
        } as RequestInit
    }

    if (proxyUrl && proxyUrl != "") {
        const agent = new HttpsProxyAgent(proxyUrl);
        finalOpts['agent'] = agent
    }
    const data = await fetch(url, finalOpts).then(async (res: any) => _handleApiResponse(res))
    clearTimeout(timeoutId);
    return data
}
