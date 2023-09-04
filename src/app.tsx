import './app.css';

import { NftItemsList } from './components/NftItemsList';
import { UserContextProvider, useUserContext } from './context/userContext';
import { UserData } from './components/UserInfo';
import { ItemsContextProvider } from './context/itemsContext';
import { Seller } from './components/SaleSettings/Seller';

function App() {
    return (
      <div className="App">
        <div className="Inline">
          <p className="Name">TON NFT Mass Sale</p>
          <p><a href='https://tonbyte.com' target='_blank'>tonbyte.com</a></p>
        </div>
        <div style={{
            margin: 20,
          }}>
          <details>
            <summary><span style={{color: "red"}}>(!)</span> important</summary>
            <div style={{
                margin: 20,
              }}>
                <p>* Up to 1000 NFTs can be put up for sale at once.</p>
                <p>* You can not change the commission of the collection owner.</p>
                <p>* You can choose the marketplace commission from 2% to 6%, this fee will go to the TON Byte wallets after NFTs sold.</p>
                <p><span style={{color: "red"}}>(!)</span> The TOP on the GetGems homepage only counts NFT sales that were created on Disintar, TON Diamonds, GetGems. If you use this tool, TONEX or other custom script to put NFTs on sale, these sales will not affect the position of the collection in the TOP</p>
            </div>
          </details>
          <br />
        </div>
  
        <UserContextProvider>
          <UserData />
          
          <br />
          <hr />
          <ItemsContextProvider>
            <div className="Board">
              <Seller />
              <NftItemsList />
            </div>
          </ItemsContextProvider>
        </UserContextProvider>
      </div>
    );
}

export default App;
