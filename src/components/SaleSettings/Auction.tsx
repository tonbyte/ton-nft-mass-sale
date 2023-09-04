
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useUserContext } from '../../context/userContext';
import { computeRoyaltyPercent } from '../../utils';

const options = [
    { value: '3', label: '3%' },
    { value: '4', label: '4%' },
    { value: '5', label: '5%' },
    { value: '6', label: '6%' },
];

const durationOptions = [
    { value: '5', label: '5 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '60', label: '1 hour' },
    { value: '360', label: '6 hours' },
    { value: '720', label: '12 hours' },
    { value: '1440', label: '1 day' },
    { value: '2880', label: '2 days' },
    { value: '4320', label: '3 days' },
    { value: '7200', label: '5 days' },
    { value: '10080', label: '7 days' },
    { value: '20160', label: '14 days' },
    { value: '30240', label: '21 days' },
]

export function Auction() {
    const [error, setError] = useState<string>("");
    const [startPrice, setStartPrice] = useState<number>(0);
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

    const handleStartPriceChanged = (event: any) => {
        setStartPrice(Number(event.target.value));
        setUser({
            ...user,
            sellAuctionInfo: {
                ...user.sellAuctionInfo,
                price: Number(event.target.value),
            }
        })
    }

    const handleDurationChanged = (selectedOption: { value: string, label: string }) => {
        setUser({
            ...user,
            sellAuctionInfo: {
                ...user.sellAuctionInfo,
                duration: Number(selectedOption.value) * 60,
            }
        })
    }

    const handleMaxBidChanged = (event: any) => {
        const maxBid = Number(event.target.value);

        setUser({
            ...user,
            sellAuctionInfo: {
                ...user.sellAuctionInfo,
                maxBid: maxBid,
            }
        })
    }

    const handleMinStepChanged = (event: any) => {
        const minStep = Number(event.target.value);
        if (minStep <= 0) {
            setError("Min step must be greater than 0");
            return;
        } if (minStep > 100) {
            setError("Min step must be less than 100");
            return;
        } else {
            setError("");
        }

        setUser({
            ...user,
            sellAuctionInfo: {
                ...user.sellAuctionInfo,
                minStepPercent: minStep,
            }
        })
    }

    const handleInputServiceFeeChange = (selectedOption: { value: string, label: string }) => {
        setServiceFee(Number(selectedOption.value));
        setUser({
            ...user,
            sellAuctionInfo: {
                ...user.sellAuctionInfo,
                serviceFeePercent: Number(selectedOption.value),
            }
        })
    }

    return (
        <div>
            {
                error !== "" && (
                    <p style={{
                        color: "red",
                    }}>{error}</p>
                )
            }
            <p><b>Start price:</b><span style={{color: "red"}}>*</span></p>
            <input type="number" onChange={handleStartPriceChanged} disabled={user.deployingSales}/>

            <p><b>Expired at:</b><span style={{color: "red"}}>*</span></p>
            <div style={{width: "50%"}}>
                <Select options={durationOptions} 
                    defaultValue={durationOptions[9]}
                    onChange={handleDurationChanged}
                    isDisabled={user.deployingSales}/>
            </div>

            <p><b>Max bid:</b></p>
            <input type="number" onChange={
                    (event) => {
                        handleMaxBidChanged(event);
                    }
                }
                disabled={user.deployingSales}/>

            <p><b>Min step (%):</b></p>
            <input type="number" onChange={
                    (event) => {
                        handleMinStepChanged(event);
                    }
                }
                defaultValue={1}
                disabled={user.deployingSales}/>

            <hr />
            <br />
            <p><b>Service fee:</b></p>
            <div className="Inline">
                <Select options={options} 
                    defaultValue={options[2]}
                    onChange={handleInputServiceFeeChange}
                    isDisabled={user.deployingSales}/>
                <p>{(startPrice / 100 * serviceFee).toFixed(2)} or more TON</p>
            </div>

            <p><b>Creator fee:</b></p>
            <div className="Inline">
                <p>{creatorFee}%</p>
                <p style={{
                    textAlign: "right",
                }}>{(startPrice / 100 * creatorFee).toFixed(2)} or more TON</p>
            </div>

            <div className="Inline">
                <p><b>You will get per NFT:</b></p>
                <p style={{
                    textAlign: "right",
                }}>{(startPrice - (startPrice / 100 * creatorFee) - (startPrice / 100 * serviceFee)).toFixed(2)} or more TON</p>
            </div>

            <p style={{
                fontSize: "12px",
                color: "grey",
            }}>* - required fields</p>
        </div>
    );
}
