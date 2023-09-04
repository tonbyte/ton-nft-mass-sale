import { useEffect, useState } from "react"
import { INftItem, INftItemResponse } from "../models"
import axios from "axios"

export const ItemsLimit = 250;
const previewQuality = 2;

export function useUserNfts(testnet: boolean, userAddress: string, collectionAddress: string) {
    const [userNfts, setUserNfts] = useState<INftItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userAddress || !collectionAddress) {
            return;
        }

        if (isLoading) {
            return;
        }

        setIsLoading(true);
        const url = `https://${testnet ? "testnet." : ""}tonapi.io/v2/accounts/${userAddress.trim()}/nfts?collection=${collectionAddress.trim()}&limit=${ItemsLimit}&offset=0&indirect_ownership=false`;
        
        axios.get(url).then((response) => {
            setIsLoading(false);

            if (!response.data.nft_items) {
                return;
            }

            const items = response.data.nft_items as INftItemResponse[];

            var nfts: INftItem[] = [];
            for (const item of items) {
                const nftItem: INftItem = {
                    id: item.address,
                    name: item.metadata.name,
                    itemAddress: item.address,
                    ownerAddress: item.owner.address,
                    imageURL: item.previews[previewQuality].url || "",
                    selected: false,
                    onSale: false,
                };

                nfts.push(nftItem);
            }

            console.info("NFTs loaded", nfts);
            setUserNfts(nfts);
        }).catch((error) => {
            setIsLoading(false);

            console.log(error);
        });
    }, [userAddress, collectionAddress]);

    return { userNfts, isLoading };
}
