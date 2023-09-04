import React, { createContext, useContext, useState } from 'react';
import { INftItem } from '../models';

interface IItemsContext {
  items: INftItem[];
  setItems: (items: INftItem[]) => void;
}

const ItemsContext = createContext<IItemsContext | undefined>(undefined);

export function ItemsContextProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<INftItem[]>([]);

  const contextValue: IItemsContext = {
    items: items,
    setItems: setItems,
  };

  return (
    <ItemsContext.Provider value={contextValue}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItemsContext() {
  const context = useContext(ItemsContext);

  if (context === undefined || context.items === undefined || context.setItems === undefined) {
    throw new Error('useItemsContext must be used within a ItemsProvider');
  }

  return context;
}