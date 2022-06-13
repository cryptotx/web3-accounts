import {Button, Radio, Space} from "antd";
import React, {useContext} from "react";
import {AppContext, Context} from '../AppContext'
import "./index.css"

export function Signature(props) {
    const {wallet, sdk} = useContext(Context)
    const handleSizeChange = e => {
        // setWallet(e.target.value);
    };
    const {walletList} = props;
    return (<div style={{padding: 24, minHeight: 360}}>
        <Space style={{padding: 10}}>
            <Radio.Group value={wallet} onChange={handleSizeChange}>
                {
                    walletList && (walletList.map((item) => (
                        <Radio.Button key={item.walletName} value={item}>{item.walletName}</Radio.Button>
                    )))
                }
            </Radio.Group>
        </Space></div>)
}



