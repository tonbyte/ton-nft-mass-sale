import '../../app.css';

import { useState } from 'react';
import { Auction } from './Auction';
import { FixedPriceSell } from './FixedPriceSell';
import { useUserContext } from '../../context/userContext';
import { IAuction, IFixedPrice } from '../../models';
import { useItemsContext } from '../../context/itemsContext';
import { MinBalanceForSale, tryNTimes, wait } from '../../utils';
import { createAuctionStateInit, createFixedPriceStateInit, sendSellMessage } from '../../sellMessage';

export function Seller() {
    const [sellType, setSellType] = useState("auction");
    const [error, setError] = useState<string>("");
    const {user, setUser} = useUserContext();
    const {items, setItems} = useItemsContext();
    const [status, setStatus] = useState<string>("");

    const handleSellTypeChanged = (type: string) => {
        if (user.deployingSales) {
          return;
        }

        setError("");
        setStatus("");
        setSellType(type);
        console.info(type);

        var sellAuctionInfo = null;
        var sellFixedPriceInfo = null;
        if (type === "auction") {
            sellAuctionInfo = {
                price: 0,
                duration: 10080 * 60, // default 7 days
                maxBid: 0,
                minStepPercent: 1,
                serviceFeePercent: 5,
            } as IAuction;
        } else  {
            sellFixedPriceInfo = {
                price: 0,
                serviceFeePercent: 5,
            } as IFixedPrice;
        }
        
        setUser({
            ...user,
            sellAuctionInfo: sellAuctionInfo,
            sellFixedPriceInfo: sellFixedPriceInfo,
        })
    }

    const handlePutOnSale = async () => {
      if (user.deployingSales) {
        return;
      }

      setError("");
      user.sellAuctionInfo ? console.log(user.sellAuctionInfo) : console.log(user.sellFixedPriceInfo);
      var price = 0;
      var serviceFee = 5;

      if (user.sellAuctionInfo) {
        console.info("auction");
        price = user.sellAuctionInfo.price;
        serviceFee = user.sellAuctionInfo.serviceFeePercent;
      
        if (user.sellAuctionInfo.maxBid != 0 && user.sellAuctionInfo.maxBid <= user.sellAuctionInfo.price) {
            console.info("max bid:", user.sellAuctionInfo.maxBid);
            setError("Max bid must be more than start price");
            return;
        }
      } else if (user.sellFixedPriceInfo) {
        console.info("fixed price");
        price = user.sellFixedPriceInfo.price;
        serviceFee = user.sellFixedPriceInfo.serviceFeePercent;
      }

      console.log("price:", price);
      console.log("service fee:", serviceFee);
    
      if (price <= 0) {
        setError("Enter price");
        setStatus("");
        return;
      }

      const selectedItems = items.filter((item) => item.selected);
      if (selectedItems.length === 0) {
        setError("Select items");
        setStatus("");
        return;
      }

      setItems(selectedItems);

      setUser({
        ...user,
        deployingSales: true,
      });

      for (var i = 0; i < selectedItems.length; ++i) {
        if (user.tonweb.utils.toNano(user.balance) < user.tonweb.utils.toNano(MinBalanceForSale)) {
          setError("Low balance");
          setStatus("");
          return;
        }

        setStatus("Putting item on sale...");
        const itemAddress = selectedItems[i].itemAddress;
        var stateInitCell: any;
        if (user.sellAuctionInfo) {
          stateInitCell = createAuctionStateInit(user.tonweb, user.sellAuctionInfo, user.collectionRoyalty, user.testnet, user.userAddress, itemAddress);
        } else {
          stateInitCell = createFixedPriceStateInit(user.tonweb, user.sellFixedPriceInfo, user.collectionRoyalty, user.testnet, user.userAddress, itemAddress);
        }

        const saleResponse = await sendSellMessage(user.tonweb, user.userWallet, user.keyPair, user.userAddress, stateInitCell, user.testnet, user.sellAuctionInfo !== null, itemAddress);
        if (saleResponse.message !== "") {
          setError(saleResponse.message);
          setStatus("");
          return;
        }

        setItems(selectedItems.map((item) => {
            if (item.itemAddress === itemAddress) {
              item.selected = false;
              item.onSale = true;
            }

            return item;
          }));

        setStatus("Checking balance...");
        // Check balance
        await wait(1000);
        const balanceNum = await tryNTimes(async () => {
            return await user.tonweb.getBalance(user.userAddress);
          }, 10, 2000);
        const balance = user.tonweb.utils.fromNano(balanceNum);
        console.info("balance after sell:", balance);
        setUser({
          ...user,
          deployingSales: true,
          balance: balance,
        });
      }

      setStatus("Done. Refresh the page to list other items for sale.");
    }

    return (
        <div className="SellSettings">
          {
            status && (
              <p style={{
                color: "green",
                textAlign: "center",
              }}>{status}</p>
            )
          }
          {
            error && (
              <p style={{
                color: "red",
                textAlign: "center",
              }}>{error}</p>
            )
          }
          <p><b>Choose sell type:</b></p>
          <div className="TypePanel">
            <p onClick={() => handleSellTypeChanged("auction")}
              style={{
                fontStyle: sellType === "auction" ? "italic" : "normal",
                fontWeight: sellType === "auction" ? "bold" : "normal",
                cursor: user.deployingSales ? "default" : "pointer",
                color: user.deployingSales ? "grey" : "black",
              }}>Auction</p>
            <p>|</p>
            <p onClick={() => handleSellTypeChanged("fixed")}
              style={{
                fontStyle: sellType === "fixed" ? "italic" : "normal",
                fontWeight: sellType === "fixed" ? "bold" : "normal",
                cursor: user.deployingSales ? "default" : "pointer",
                color: user.deployingSales ? "grey" : "black",
              }}>Fixed price sell</p>
          </div>
          {
            sellType === "auction" && (
              <Auction />
            )
          } 
          {
            sellType === "fixed" && (
              <FixedPriceSell />
            )
          }

          <br />
          <button style={{
              width: "80%",
              marginTop: "0 auto 40px auto",
            }} onClick={handlePutOnSale}
            disabled={user.deployingSales}>Put on sale</button>
        </div>
    );
}

