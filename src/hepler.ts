import { Asset, ExchangeMetadata, Token, PopulatedTransaction } from "./types";
import { checkURL, ETH_TOKEN_ADDRESS, LimitedCallSpec, NULL_ADDRESS, ethers } from "web3-wallets";
import { HttpsProxyAgent } from "https-proxy-agent";


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

export function openseaAssetToMeta(asset: any, quantity: string = "1", data?: string): ExchangeMetadata {
    return <ExchangeMetadata>{
        asset: {
            id: asset.token_id,
            address: asset.address,
            quantity,
            data
        },
        schema: asset.schema_name
    }
}

export function openseaAssetToAsset(asset: any): Asset {
    return <Asset>{
        tokenId: asset.token_id,
        tokenAddress: asset.address,
        schemaName: asset.schema_name
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

export function isETHAddress(tokenAddress: string) {
    if (!ethers.isAddress(tokenAddress)) throw new Error("The address format is incorrect")
    return (tokenAddress == NULL_ADDRESS || tokenAddress.toLowerCase() == ETH_TOKEN_ADDRESS.toLowerCase())
}


export function toFixed(x): string | number {
    if (Math.abs(Number(x)) < 1.0) {
        let e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        let e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;
}




// export async function fetchRPC(url: string, body: string) {
//     const res = await fetch(url, {
//             method: 'POST',
//             body,
//             headers: {'Content-Type': 'application/json'}
//         }
//     );
//     if (res.ok) {
//         return res.json();
//     } else {
//         throw new Error("Rpc fetch Error")
//     }
// }

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
            errorMessage = `Internal server error. Request has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
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



export async function fetchJson(url: string, options?: RequestInit & {
    timeout?: number,
    proxyUrl?: string
}): Promise<Response> {
    const { timeout, proxyUrl } = options || {}
    if (!checkURL(url)) throw new Error("error url:" + url)
    if (proxyUrl && !checkURL(proxyUrl)) throw new Error("error proxyUrl:" + url)

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 5000);
    let finalOpts: RequestInit = {
        signal: controller.signal
    }
    if (options) {
        finalOpts = {
            ...options,
            headers: {
                ...(options.headers || {})
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


