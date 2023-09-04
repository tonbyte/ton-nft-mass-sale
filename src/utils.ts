import TonWeb from "tonweb";

const { NftItem } = TonWeb.token.nft;

export const MinBalanceForSale = "1.08";

export function computeRoyaltyPercent(factor: number, base: number): number {
    return (factor / base) * 100;
}

export async function tryNTimes<T>(func: () => T, n: number, delay: number): Promise<T> {
    var finalError: any;
    for (var i = 0; i < n; ++i) {
        try {
            const result = await func();
            if (result === null) {
                await wait(delay);
                continue;
            }

            return result;
        } catch(err) {
            finalError = err;

            await wait(delay);
        }
    }

    return finalError;
}

export function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) =>
        setTimeout(() => {
            resolve()
        }, ms)
    )
}

export async function getBalance(tonweb: TonWeb, address: string): Promise<number> {
    for (let i = 0; i < 5; i++) {
        try {
            await wait(2000);
            const balance = Number(await tonweb.getBalance(address));
            if (Number.isNaN(balance)) {
                continue;
            }

            console.info("\tbalance:", balance);
            return balance;
        } catch (err) {
            console.error(err);
        }
    }

    console.info("can not get balance");
    return -1;
}   

export async function ensureItemOnSale(tonweb: TonWeb, itemAddress: string, sellContractAddress: string): Promise<boolean> {

    const nftItem = new NftItem(tonweb.provider, {
        address: itemAddress,
    })

    for (let i = 0; i < 5; i++) {
        try {
            await wait(8000);       /// 8000 cause we to be sure that blockchain will be updated
            const result = await nftItem.methods.getData();
            const owner = result?.ownerAddress.toString(true, true, true);
            console.info("\tnft owner:", owner, "| expected:", sellContractAddress);
            if (owner === sellContractAddress) {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
    }

    console.info("false");
    return false;
}
