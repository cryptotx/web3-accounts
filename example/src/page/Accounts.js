import {Button, List, Divider, message, Avatar, Space} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {Context} from '../AppContext'
import {openseaAssetToMeta, openseaAssetToAsset} from "web3-accounts";

import Modal from "antd/es/modal/Modal";

export function Accounts() {
    const {wallet, sdk} = useContext(Context);
    const [assets, setAssets] = useState([])
    const [visible, setVisible] = useState(false);
    const [approveInfo, setApproveInfo] = useState([]);
    const assetTransfer = async (item) => {
        const to = prompt("To Address")
        const tx = await sdk.assetTransfer(openseaAssetToMeta(item), to)
        await tx.wait()
        message.success("  post order success")
    }

    const getApprove = async (item) => {
        const asset = openseaAssetToAsset(item)
        const opensea = await sdk.getAssetApprove(asset, "0x00000000006c3852cbef3e08e8df289169ede581")
        const nftrade = await sdk.getAssetApprove(asset, "0xE05D2BAA855C3dBA7b4762D2f02E9012Fb5F3867")

        // debugger
        opensea.name = "OpenSea"
        opensea.asset = asset
        opensea.operator = "0x00000000006c3852cbef3e08e8df289169ede581"
        nftrade.name = "Nftrade"
        nftrade.asset = asset
        nftrade.operator = "0xE05D2BAA855C3dBA7b4762D2f02E9012Fb5F3867"

        setApproveInfo([opensea, nftrade])
        setVisible(true);

    }

    const cancelApprove = async (val) => {
        await sdk.assetCancelApprove(val.asset, val.operator)
    }

    const assetApprove = async (val) => {
        await sdk.assetApprove(val.asset, val.operator)
    }

    const getGasBalances = async (val) => {
        const balacnes = await sdk.getGasBalances({rpcUrl:"https://bsc-dataseed1.binance.org"})
        message.error(balacnes);
    }

    const approveList = () => {
        return approveInfo.map(val => (<p key={val.name}>{val.name} Approve: {val.isApprove.toString()} {val.isApprove ?
            <Button type="primary" onClick={() => cancelApprove(val)}>CancelApprove</Button> :
            <Button type="primary" onClick={() => assetApprove(val)}>Approve</Button>}</p>))
    }

    const hideModal = () => {
            setVisible(false);
        }
    ;

    useEffect(() => {
            async function fetchOrder() {
                if (!wallet.address) return
                const assets = await sdk.getUserAssets({account: wallet.address, chainId: wallet.chainId, limit: 5})
                setAssets(assets)
            }

            fetchOrder().catch(err => {
                console.log(err)
                // message.error(err);
            })
        }
        , [wallet]);

    return (
        <>
            <Space style={{marginLeft:20,marginTop:20}}>
                <Button onClick={getGasBalances}>getEthBalances</Button>
            </Space>
            <Divider/>
            {assets.length > 0 && <List
                style={{padding: '20px 60px'}}
                itemLayout="vertical"
                size="large"
                dataSource={assets}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={item.image_url} shape={'square'} size={60}/>}
                            title={<a>{item.name}</a>}
                            key={item.id}
                            description={item.description}
                        />
                        <Space>
                            <Button key={item.id} onClick={() => assetTransfer(item)}>Transfer</Button>

                            <Button key={item.name} onClick={() => getApprove(item)}>GetApproveInfo</Button>

                        </Space>
                        <Divider></Divider>
                    </List.Item>
                )}
            />}

            <Modal
                title="Approve Info"
                visible={visible}
                onOk={hideModal}
                onCancel={hideModal}
                okText="Ok"
                cancelText="Cancel"
            >
                {approveList()}

            </Modal>
       </>
    )
}



