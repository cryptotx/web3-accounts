import React, {createContext, useEffect, useState} from "react";
import {Web3Wallets} from "web3-wallets";
import {Web3Accounts} from "web3-accounts";


export const Context = createContext();
export const AppContext = ({children}) => {


    const [wallet, setWallet] = useState({});
    const [sdk, setSdk] = useState({});
    useEffect(() => {
        // setLoading(true);
        async function init() {
            const wallet = new Web3Wallets('metamask')
            console.log("AppContext: wallet change", wallet.address, wallet.chainId)

            if (!wallet.address) {
                const accounts = await wallet.connect()
            }
            setWallet(wallet)
            const {chainId, address} = wallet
            const sdk = new Web3Accounts({chainId, address})
            setSdk(sdk)
        }

        init()
    }, [])
    return (<Context.Provider value={{wallet, setWallet, sdk, setSdk}}>
        {children}
    </Context.Provider>)
}
