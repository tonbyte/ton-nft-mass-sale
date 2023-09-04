import TonWeb from "tonweb";
import { KeyPair } from 'tonweb-mnemonic'

export interface INftItem {
    id: string,
    name: string,
    itemAddress: string,
    ownerAddress: string,
    imageURL: string,
    selected: boolean,
    onSale: boolean,
}

export interface INftItemResponse {
    address: string,
    owner: { 
        address: string 
    },
    metadata: {
        name: string
    },
    sale?: { 
        price: { 
            value: string, 
            token_name: string 
        } 
    },
    previews: {
        resolution: string,
        url: string
    }[]
}

export interface IUserInfo {
    tonweb: TonWeb,
    keyPair: KeyPair | undefined,
    walletVersion: string,
    userWallet: any | undefined,
    userAddress: any | undefined,
    collectionAddress: string,
    testnet: boolean,
    balance: string,
    deployingSales: boolean,
    collectionRoyalty: ICollectionRoyalty | null,
    sellAuctionInfo: IAuction | null,
    sellFixedPriceInfo: IFixedPrice | null,
}

export interface IAuction {
    price: number,
    duration: number,
    maxBid: number,
    minStepPercent: number,
    serviceFeePercent: number,
}

export interface IFixedPrice {
    price: number,
    serviceFeePercent: number,
}

export interface ICollectionRoyalty {
    factor: number,
    base: number,
    address: string,
}

export interface ICollectionInfo {
    collection: {
        royalty: ICollectionRoyalty,
    }
}
