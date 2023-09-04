import { useEffect } from 'react';
import './index.css';
import { NftItem } from "./NftItem";
import { useUserNfts } from '../../hooks/useUserNfts';
import { useUserContext } from '../../context/userContext';
import { INftItem } from '../../models';
import { useItemsContext } from '../../context/itemsContext';

export function NftItemsList() {
    const {user} = useUserContext();
    const {items, setItems} = useItemsContext();
    
    const { userNfts, isLoading } = useUserNfts(user.testnet, user.userAddress?.toString(false), user.collectionAddress);

    useEffect(() => {
        console.log("updated items");
        setItems(items.concat(userNfts));
    }, [userNfts]);

    const handleItemClick = (nftAddress: string) => {
        var item = items.find((nft: INftItem) => nft.itemAddress === nftAddress);
        if (item === undefined) {
            return;
        }

        if (item.onSale) {
          console.info("open nft page");
          const nftAddressObj = new user.tonweb.utils.Address(nftAddress)
          window.open(`https://${user.testnet ? "testnet." : ""}getgems.io/collection/${user.collectionAddress}/${nftAddressObj.toString(true, true, true)}`, '_blank', 'noreferrer');
        }

        if (user.deployingSales) {
          return;
        }

        var newItems = items.map((nft: INftItem) => {
            if (nft.itemAddress === nftAddress) {
                nft.selected = !nft.selected;
            }
            return nft;
        });
        setItems(newItems);
    }

    const handleSelectAll = () => {
      var newItems = items.map((nft: INftItem) => {
          nft.selected = true;
          return nft;
      });
      setItems(newItems);
    }

    const handleUnselectAll = () => {
      var newItems = items.map((nft: INftItem) => {
          nft.selected = false;
          return nft;
      });
      setItems(newItems);
    }

    if (isLoading) {
        return (
            <div className="Nfts-list">
              <p style={{
                color: "grey",
                textAlign: "center",
              }}>Loading...</p>
            </div>
        );
    }

    if (user.userAddress === undefined || user.collectionAddress === "") {
        return (
            <div className="Nfts-list">
              <p style={{
                color: "grey",
                textAlign: "center",
              }}>Please, enter your wallet data</p>
            </div>
        );
    }

    return (
        <div className="Nfts-list">
          <div className="Inline">
            <p><b>Select NFTs for sale:</b></p>
            {
              user.deployingSales ? (
                <p>{ items.filter((item) => item.onSale).length }/{ items.length } on sale</p>
              ) : (
                <p>{ items.filter((item) => item.selected).length }/{ items.length } selected</p>
              )
            }
            <div className="Inline">
              <button 
                style={{ width: "100px", marginRight: "10px" }}
                onClick={handleSelectAll}
              >select all</button>
              <div className="Inline">
                <button 
                  style={{ width: "100px", marginRight: "10px" }}
                  onClick={handleUnselectAll}
                >unselect all</button>
              </div>
            </div>
          </div>
          {
            user.deployingSales && (
              <p>* click on an item on sale to open it on getgems</p>
            )
          }
          <div className="Scrollable">
            {
              items.length === 0 &&  (
                <p style={{
                  color: "grey",
                  textAlign: "center",
                }}>{"You don't have any NFTs"}</p>
              )
            }

            {
              items.length > 0 && (
                items.map((item) => {
                  if (item.name === undefined) {
                    item.name = "unknown";
                  }
                  
                  var name = item.name;

                  if (item.name.length > 19) {
                      const middle = item.name.length / 2;
                      name = item.name.substring(0, middle - 2) + "..." + item.name.substring(middle + 2, middle * item.name.length);
                  }

                  return <NftItem
                      key={item.itemAddress}
                      imgURL={item.imageURL}
                      title={name}
                      isSelected={item.selected}
                      isOnSale={item.onSale}
                      onClick={() => handleItemClick(item.itemAddress)}
                    />;
                })
              )
            }
          </div>
        </div>
    );
}
