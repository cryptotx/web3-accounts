import {message, Layout, Descriptions, Menu} from 'antd';
import React, {useState, useEffect, useContext} from "react";
import {AppContext} from '../AppContext'
import {DesktopOutlined, FileOutlined, PieChartOutlined,} from '@ant-design/icons';
import "./index.css"
import {Context} from "../AppContext";

const {Header, Content, Footer, Sider} = Layout;

export function MainLayout() {
    const {wallet, sdk} = useContext(Context)
    const [collapsed, setCollapsed] = useState(false);
    const onCollapse = (value) => {
        setCollapsed(value);
    };

    const selectWallet = async (obj) => {
        if (obj.key == "Signature") {
            sdk.signMessage("Hello Web3 Accounts")
        }
    };
    console.log('MainLayout', wallet)
    const SupportWallet = ["Signature", "Approve", "GetAssetInfo", "TransferAssets"]
    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
                <div className="logo">Web3Accounts</div>
                <Menu theme="dark" defaultSelectedKeys={['Signature']} mode="inline"
                      onClick={selectWallet}>
                    {
                        SupportWallet.map(val => (
                            <Menu.Item key={val} icon={<FileOutlined/>}>
                                {val}
                            </Menu.Item>
                        ))
                    }

                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{padding: 10}}>
                    {wallet.walletName && <Descriptions size="small" column={2}>
                        <Descriptions.Item label="Name">{wallet.walletName}</Descriptions.Item>
                        <Descriptions.Item label="ChainId">
                            <a>{wallet.walletProvider.chainId}</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Address">{wallet.walletProvider.address}</Descriptions.Item>
                        {wallet.walletProvider.peerMetaName &&
                        <Descriptions.Item
                            label="PeerMetaName">{wallet.walletProvider.peerMetaName}</Descriptions.Item>}
                    </Descriptions>}
                </Header>

            </Layout>
        </Layout>

    )
}



