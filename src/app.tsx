import './app.css';

import { NftItemsList } from './components/NftItemsList';
import { UserContextProvider, useUserContext } from './userContext';
import { UserData } from './components/UserInfo';
import { ItemsContextProvider } from './itemsContext';
import { Sell } from './components/Sell';

function App() {
    return (
      <div className="App">
        <div className="Inline">
          <p className="Name">TON NFT Mass Sale</p>
          <p><a href='https://tonbyte.com' target='_blank'>tonbyte.com</a></p>
        </div>
  
        <UserContextProvider>
          <UserData />
          
          <br />
          <hr />
          <ItemsContextProvider>
            <div className="Board">
              <Sell />
              <NftItemsList />
            </div>
          </ItemsContextProvider>
        </UserContextProvider>
      </div>
    );
}

export default App;
