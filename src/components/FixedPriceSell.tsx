
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useUserContext } from '../userContext';
import { computeRoyaltyPercent } from '../utils';

const options = [
    { value: '3', label: '3%' },
    { value: '4', label: '4%' },
    { value: '5', label: '5%' },
    { value: '6', label: '6%' },
];

export function FixedPriceSell() {
    const [price, setPrice] = useState<number>(0);
    const [serviceFee, setServiceFee] = useState<number>(5);
    const [creatorFee, setCreatorFee] = useState(0.0);
    const {user, setUser} = useUserContext();

    useEffect(() => {
      if (user.collectionRoyalty === null) {
        setCreatorFee(0.0);
        return;
      }

      setCreatorFee(computeRoyaltyPercent(user.collectionRoyalty.factor, user.collectionRoyalty.base));
    }, [user]);

    const handleSetPrice = (event: any) => {
        setPrice(Number(event.target.value));
        setUser({
            ...user,
            sellFixedPriceInfo: {  
                ...user.sellFixedPriceInfo,
                price: Number(event.target.value),
            }
        });
    }

    const handleInputServiceFeeChange = (selectedOption: { value: string, label: string }) => {
        setServiceFee(Number(selectedOption.value));
        setUser({
            ...user,
            sellFixedPriceInfo: {
                ...user.sellFixedPriceInfo,
                serviceFeePercent: Number(selectedOption.value),
            }
        })
    }

    return (
        <div>
            <p><b>Price:</b><span style={{color: "red"}}>*</span></p>
            <input type="number" onChange={handleSetPrice} disabled={user.deployingSales}/>

            <hr />
            <br />
            <p><b>Service fee:</b></p>
            <div className="Inline">

                <Select options={options} 
                    defaultValue={options[2]}
                    onChange={handleInputServiceFeeChange}
                    isDisabled={user.deployingSales}/>
                <p>{(price / 100 * serviceFee).toFixed(2)} TON</p>
            </div>

            <p><b>Creator fee:</b></p>
            <div className="Inline">
                <p>{creatorFee}%</p>
                <p style={{
                    textAlign: "right",
                }}>{(price / 100 * creatorFee).toFixed(2)} TON</p>
            </div>

            <div className="Inline">
                <p><b>You will get per NFT:</b></p>
                <p style={{
                    textAlign: "right",
                }}>{(price - (price / 100 * creatorFee) - (price / 100 * serviceFee)).toFixed(2)} TON</p>
            </div>

            <p style={{
                fontSize: "12px",
                color: "grey",
            }}>* - required fields</p>
        </div>
    );
}
