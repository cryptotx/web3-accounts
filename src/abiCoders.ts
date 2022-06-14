import {Interface, Fragment} from "ethers/lib/utils";

//ew ethers.utils.Interface([abi])
function getAbiName(abis: readonly Fragment[], indexOrName?: number | string) {
    if (abis.length == 0) throw new Error("ABI is null")
    let name = ""
    if (typeof (indexOrName) === "string") {
        name = indexOrName
    }

    if (typeof (indexOrName) === "number") {
        name = abis[indexOrName].name || ""
    }
    if (!indexOrName) {
        name = abis[0].name || ""
    }
    if (!name) throw new Error("Name or index undefined")
    return name
}

export class AbiCoders extends Interface {
    constructor(abis: ReadonlyArray<Fragment>) {
        super(abis);
    }

    methodId(indexOrName?: number | string) {
        const name = getAbiName(this.fragments, indexOrName)
        return this.getSighash(name)
    }

    decode(data: string, indexOrName?: number | string) {
        const name = getAbiName(this.fragments, indexOrName)
        return this.decodeFunctionData(name, data)
    }

    encode(data: any[], indexOrName?: number | string) {
        const name = getAbiName(this.fragments, indexOrName)
        return this.encodeFunctionData(name, data)
    }
}
