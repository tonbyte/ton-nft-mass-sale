import React, { createContext, useContext, useState } from 'react';
import { IAuction, IUserInfo } from './models';

interface IUserContext {
  user: IUserInfo;
  setUser: (user: IUserInfo) => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserInfo>({
    tonweb: undefined,
    keyPair: undefined,
    walletVersion: "",
    userWallet: undefined,
    userAddress: undefined,
    collectionAddress: "",
    testnet: false,
    balance: "",
    deployingSales: false,
    collectionRoyalty: null,
    sellAuctionInfo: {
      price: 0,
      duration: 10080 * 60,
      maxBid: 0,
      minStepPercent: 1,
      serviceFeePercent: 5,
    } as IAuction,
    sellFixedPriceInfo: null,
  });

  const contextValue: IUserContext = {
    user: user,
    setUser: (value: IUserInfo) => {
      console.info("user updated:", value);
      setUser(value);
    },
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (context === undefined || context.user === undefined || context.setUser === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}