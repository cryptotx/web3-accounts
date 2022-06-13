import {APIConfig, Asset, ExchangeMetadata, Token} from "./types";
import {ETH_TOKEN_ADDRESS, LimitedCallSpec, NULL_ADDRESS} from "web3-wallets";
import {PopulatedTransaction} from "@ethersproject/contracts";
import * as QueryString from "querystring";
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

export class BaseFetch {
    /**
     * Page size to use for fetching orders
     */
    public apiBaseUrl: string
    public apiKey: string | undefined
    public proxyUrl: string | undefined
    public apiTimeout: number | undefined
    // public chain: string
    /**
     * Logger function to use when debugging
     */
    public logger: (arg: string) => void = console.log

    constructor(config: APIConfig) {
        const {apiBaseUrl, apiKey, proxyUrl, apiTimeout} = config
        this.apiBaseUrl = apiBaseUrl || ""
        if (checkURL(this.apiBaseUrl)) throw new Error("apiBaseUrl:" + apiBaseUrl)
        this.apiKey = apiKey
        this.proxyUrl = proxyUrl
        this.apiTimeout = apiTimeout || 5000
    }

    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    async get(apiPath, query = {}, opts: RequestInit = {}) {
        const qs = QueryString.stringify(query)
        const url = `${apiPath}?${qs}`
        const response = await this._fetch(url, opts)
        return response.json()
    }

    async getQueryString(apiPath: string, qs: string, opts: RequestInit = {}) {
        const url = `${apiPath}?${qs}`
        // return this._fetch(url)
        const response = await this._fetch(url, opts)
        return response.json()
    }

    async getURL(url: string, opts: RequestInit = {}, timeout?: number) {
        const response = await fetchJson(url, {opts, timeout: timeout || this.apiTimeout, proxyUrl: this.proxyUrl})
        return response.json()
    }

    static async


    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    public async post(apiPath: string, body?: { [key: string]: any }, opts: RequestInit = {}): Promise<any> {
        const fetchOpts = {
            ...opts,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(opts.headers || {})
            }
        } as RequestInit

        // return post(this.apiBaseUrl, apiPath, body)

        const response = await this._fetch(apiPath, fetchOpts)
        if (response.ok) {
            const resJson: any = await response.json()
            if (resJson.data) {
                return resJson.data
            } else {
                return resJson
            }
        } else {
            return response
        }
    }


    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    public async put(apiPath: string, body: any, opts: RequestInit = {}) {
        return this.post(apiPath, body, {
            method: 'PUT',
            ...opts
        })
    }


    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private async _fetch(apiPath: string, opts: RequestInit = {}, timeout?: number) {
        const apiBase = this.apiBaseUrl
        const finalUrl = `${apiBase}${apiPath}`

        return fetchJson(finalUrl, {opts, timeout: timeout || this.apiTimeout, proxyUrl: this.proxyUrl})
    }

    public throwOrContinue(error: Error, retries: number) {
        const isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'))
        if (retries <= 0 || !isUnavailable) {
            throw error
        }
    }
}
