import {fetchJson} from "./hepler";

export async function getBlockByNumber(rpcUrl: string, blockNum: number): Promise<{ jsonrpc: "", id: number, result: any }> {
    const blockHex = "0x" + blockNum.toString(16)
    const getBlock = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [blockHex, true],
        "id": new Date().getTime()
    }
    const option = {
        method: 'POST',
        body: JSON.stringify(getBlock),
        headers: {'Content-Type': 'application/json'}
    }
    return (await fetchJson(rpcUrl, option)).json()
}

export async function getTransactionByHash(rpcUrl: string, txHash: string) {
    const getTxByHash = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionByHash",
        "params": [txHash],
        "id": new Date().getTime()
    }
    const option = {
        method: 'POST',
        body: JSON.stringify(getTxByHash),
        headers: {'Content-Type': 'application/json'}
    }
    return (await fetchJson(rpcUrl, option)).json()
}

export async function getTransactionReceipt(rpcUrl: string, txHash: string) {
    const getReceipt = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionReceipt",
        "params": [txHash],
        "id": new Date().getTime()
    }
    const option = {
        method: 'POST',
        body: JSON.stringify(getReceipt),
        headers: {'Content-Type': 'application/json'}
    }
    return (await fetchJson(rpcUrl, option)).json()
}
