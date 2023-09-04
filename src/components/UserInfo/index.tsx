import TonWeb from "tonweb";
import { mnemonicToKeyPair } from 'tonweb-mnemonic'
import Select from 'react-select';

import { useState } from "react";
import './index.css';
import '../../app.css';
import { useUserContext } from "../../context/userContext";
import { getCollectionRoyalty } from "../../getCollectionRoyalty";

const options = [
    { value: 'v4R2', label: 'v4R2' },
    { value: 'v4R1', label: 'v4R1' },
    { value: 'v3R2', label: 'v3R2' },
    { value: 'v3R1', label: 'v3R1' },
];

export function UserData() {
    const {user, setUser} = useUserContext();

    const [error, setError] = useState<string>("");
    const [mnemonic, setMnemonic] = useState<string>("");
    const [walletType, setWalletType] = useState<string>("v4R2"); // ["v4R2", "v4R1", "v3R2", "v3R1"]
    const [collectionAddress, setCollectionAddress] = useState<string>("");
    const [isTestnet, setIsTestnet] = useState<boolean>(false);

    const handleUserData = async () => {
        setError("");
        if (mnemonic === "") {
            setError("Enter seed phrase");
            return;
        }

        const words = mnemonic.split(" ");
        if (words.length !== 24) {
            setError("Invalid seed phrase");
            return;
        }

        if (collectionAddress === "") {
            setError("Enter collection address");
            return;
        }

        const tonweb = isTestnet ? new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'))
            : new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

        const key = await mnemonicToKeyPair(words)

        var wallet: any = undefined;
        if (walletType === 'v4R1') {
            wallet = new tonweb.wallet.all.v4R1(tonweb.provider, {publicKey: key.publicKey, wc: 0});
        } else if (walletType === 'v3R2') {
            wallet = new tonweb.wallet.all.v3R2(tonweb.provider, {publicKey: key.publicKey, wc: 0});
        } else if (walletType === 'v3R1') {
            wallet = new tonweb.wallet.all.v3R1(tonweb.provider, {publicKey: key.publicKey, wc: 0});
        } else {    // v4R2
            wallet = new tonweb.wallet.all.v4R2(tonweb.provider, {publicKey: key.publicKey, wc: 0});
        }

        const address = await wallet.getAddress();
        const balance = await tonweb.getBalance(address);
        const userFriendlyCollectionAddress = new tonweb.utils.Address(collectionAddress).toString(true, true, true);
        const collectionRoyalty = await getCollectionRoyalty(userFriendlyCollectionAddress, isTestnet);

        if (collectionRoyalty === null) {
            setError("Can not load collection royalty. Does collection address correct?");
            return;
        }

        setUser({
            ...user,
            tonweb: tonweb,
            keyPair: key,
            walletVersion: walletType,
            userWallet: wallet,
            userAddress: address,
            collectionAddress: userFriendlyCollectionAddress,
            testnet: isTestnet,
            balance: tonweb.utils.fromNano(balance),
            collectionRoyalty: collectionRoyalty,
        });
    }

    const handleInputSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMnemonic(event.target.value);
    };
    const handleSeedPaste = (event: React.ClipboardEvent) => {
        setMnemonic(event.clipboardData.getData('text'));
    };

    const handleInputWalletTypeChange = (newValue: { value: string, label: string }) => {
        setWalletType(newValue.value);
    }

    const handleInputCollectionAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionAddress(event.target.value.trim());
    };
    const handleCollectionAddressPaste = (event: React.ClipboardEvent) => {
        setCollectionAddress(event.clipboardData.getData('text').trim());
    };

    const userAddress = user.userAddress ? user.userAddress.toString(true, true, true) : "";
    const userCollectionAddress = user.collectionAddress ? user.collectionAddress : "";

    return (
        <div className="UserInfo">
            <div className="UserInfoBlock">
                <div className="InputBlock">
                    <div className="Inline"
                            style={{width: 220}}>
                                <label htmlFor="testnet"><b>Is testnet:</b></label>
                        <input type="checkbox" 
                            id="testnet"
                            onChange={() => setIsTestnet(!isTestnet)}
                            checked={isTestnet} />
                    </div>

                    <p><b>Enter seed:</b></p>
                    <input type="text" 
                        onChange={handleInputSeedChange}
                        onPaste={handleSeedPaste} />

                    <div>
                        <p><b>Choose wallet type:</b></p>
                        <Select options={options} 
                            defaultValue={options[0]}
                            onChange={handleInputWalletTypeChange}/>
                    </div>

                    <p><b>Enter collection address:</b></p>
                    <input type="text" 
                        onChange={handleInputCollectionAddressChange}
                        onPaste={handleCollectionAddressPaste} />

                    <br />
                </div>
                
                <div className="InfoBlock">
                    <p><b>Your address:</b></p>
                    {
                        userAddress === "" ? (
                            <p>--</p>
                        ) : (
                            <p><a target="_blank" href={`https://${user.testnet ? "testnet." : ""}tonscan.org/address/${userAddress}`}>{userAddress}</a></p>
                        )
                    }

                    <p><b>Balance:</b></p>
                    <p>{user.balance === "" ? "0" : user.balance}</p>

                    <p><b>Collection address:</b></p>
                    {
                        userCollectionAddress === "" ? (
                            <p>--</p>
                        ) : (
                            <p><a target="_blank" href={`https://${user.testnet ? "testnet." : ""}tonscan.org/address/${userCollectionAddress}`}>{userCollectionAddress}</a></p>
                        )
                    }
                </div>
            </div>
            <br />
            <br />
            {
                error && <p style={{color: "red", textAlign: "center"}}>{error}</p>
            }
            <button onClick={handleUserData}>Load collection items</button>
        </div>
    );
}
