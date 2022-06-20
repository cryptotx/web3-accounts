import {getChainRpcUrl,fetchJson} from "web3-wallets";



const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {

    // public async getAccount() {
    // const url = "https://api.nftrade.com/api/v1/tokens?address=0x20e30b5a64960a08dfb64beb8ab65d860cd71da7&search=&sort=listed_desc&connectedChainId=4&skip=0&limit=2"
    const url = "https://testnets-api.opensea.io/api/v1/assets?include_orders=true&owner=0x9f7a946d935c8efc7a8329c0d894a69ba241345a&limit=50&asset_contract_addresses=0x4cddbf865ee2a1a3711648bb192e285f290f7985&token_ids=4676314080394472507455332797632474230665182066565445726959043747700191264868&asset_contract_addresses=0xb556f251eacbec4badbcddc4a146906f2c095bee&token_ids=2&asset_contract_addresses=0x5fecbbbaf9f3126043a48a35eb2eb8667d469d53&token_ids=719455&asset_contract_addresses=0xb556f251eacbec4badbcddc4a146906f2c095bee&token_ids=3"



    const response = await fetchJson(url, {timeout: 10000, proxyUrl: 'http://127.0.0.1:7890'})
    if (response.ok) {
        console.log(await response.json())
    } else {
        console.log(response)
    }
    return
    const chainId = 97

    // const url = "https://segmentfault.com/q/1010000013437141"
    const ff = await fetch(url, {method: 'HEAD'})
    const res = await getChainRpcUrl(chainId, true)
    console.log(res)

})()
