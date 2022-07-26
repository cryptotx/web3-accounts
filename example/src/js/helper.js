import QueryString from "querystring";

export async function getOwnerAssets(owner, chainId, limit) {
    const query = {
        include_orders: false,
        limit: limit || 10,
        owner
    }
    const queryUrl = QueryString.stringify(query)
    try {
        //https://testnets-api.opensea.io/api/v1/assets?include_orders=false&limit=1&owner=0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401
        const apiUrl = {
            1: 'https://api.opensea.io/api/v1/assets?',
            4: 'https://testnets-api.opensea.io/api/v1/assets?'
        }
        const baseUrl = apiUrl[chainId || 1]

        const url = `${baseUrl}${queryUrl}`
        console.log("getAssets", url)
        const res = await fetch(url)
        const json = await res.json()
        return json.assets.map(val => ({
            ...val.asset_contract,
            royaltyFeePoints: Number(val.collection?.dev_seller_fee_basis_points),
            protocolFeePoints: Number(val.collection?.opensea_seller_fee_basis_points),
            royaltyFeeAddress: val.collection?.payout_address,
            sell_orders: val.sell_orders,
            token_id: val.token_id,
            supports_wyvern: val.supports_wyvern
        }))
    } catch (error) {
        throw error
    }
}
