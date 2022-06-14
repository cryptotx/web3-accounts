import {getChainRpcUrl} from "web3-wallets";
import {BaseFetch, fetchJson} from "../src/hepler";


const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {


    const fetch = new BaseFetch({
        apiBaseUrl:"https://testnets-api.opensea.io"
    })

    console.log(fetch)

})()
