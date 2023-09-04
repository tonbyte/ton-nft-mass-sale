import axios from "axios"
import { ICollectionInfo, ICollectionRoyalty } from "./models";

export async function getCollectionRoyalty(address: string, testnet: boolean) {
    if (!address) {
        return null;
    }

    const url = `https://tonbyte.com/dapp/tools/nftInfo/${address}?testnet=${testnet ? "true" : "false"}`;

    try {
        const response = await axios.get(url);
    
        if (!response.data.result) {
            console.log("Error loading collection royalty", response.data.error);
            return null;
        }
    
        const collectionInfo = response.data.result as ICollectionInfo;
        const royalty = collectionInfo.collection.royalty as ICollectionRoyalty;
    
        console.info("Royalty loaded", royalty);
        return royalty;
    } catch (error) {
        console.log("Error loading collection royalty", error.message); 
        return null;
    }
}
