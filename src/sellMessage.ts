import TonWeb from "tonweb";
import { MinBalanceForSale, ensureItemOnSale, getBalance, tryNTimes, wait } from "./utils";
import { IAuction, ICollectionRoyalty, IFixedPrice, INftItem } from "./models";
import { KeyPair } from "tonweb-mnemonic";

const Cell = TonWeb.boc.Cell;
const AuctionV3R2Code = Cell.fromBoc(TonWeb.utils.base64ToBytes('te6cckECHAEABZcAART/APSkE/S88sgLAQIBIAIDAgFIBAUELPLbPPhEwACOiDD4AH/4ZNs84Ns8wAIUGxUWAgLOBgcCi6A4WbZ5tnkEEIKqh/CF8KHwh/Cn8KXwnfCb8Jnwl/CV8Ivwn/CMGiImGhgiJBgWIiIWFCIgFCE+IRwg+iDYILYg9CDSILEUGQIBIAgJAgEgEhME9QB0NMDAXGw8kD6QDDbPPhCwP/4Q1IgxwWwjtAzMdMfIcAAjQScmVwZWF0X2VuZF9hdWN0aW9ugUiDHBbCOg1vbPOAywACNBFlbWVyZ2VuY3lfbWVzc2FnZYFIgxwWwmtQw0NMH1DAB+wDgMOD4U1IQxwWOhDMx2zzgAYBQXCgsAEyCEDuaygABqYSABXDGBA+n4UtdJwgLy8oED6gHTH4IQBRONkRK6EvL0gEDXIfpAMPhycPhif/hk2zwbBOjbPCDAAY69MDKBA+34I/hQvvLygQPt+ELA//LygQPwAYIQO5rKALny8oED8fhOwgDy8vhSUhDHBfhDUiDHBbHy4ZPbPOAgwALjAsADkl8D4PhCwP/4I/hQvrGXXwOBA+3y8OD4S4IQO5rKAKBSIL74S8IAsBUYDA0BdjAygQPt+ELA//LygQPwAYIQO5rKALny8oED8vgj+FC58vL4UlIQxwX4Q1IgxwWx+E1SIMcFsfLhk9s8FwTOjxYCcNs8IfhtghA7msoAofhu+CP4b9s84PhQ+FGh+CO5l/hQ+FGg+HDe+E6OlTKBA+j4SlIgufLy+G74bfgj+G/bPOH4ToIQBfXhAKD4TvhMpmSAZPADtglSILmXXwOBA+jy8OACcA8XGw4CGts8Afht+G74I/hv2zwPGwLy+E7BAZFb4PhO+EehIoIImJaAoVIQvJkwAYIImJaAoQGRMuKNClZb3VyIGJpZCBoYXMgYmVlbiBvdXRiaWQgYnkgYW5vdGhlciB1c2VyLoAHA/44fMI0G0F1Y3Rpb24gaGFzIGJlZW4gY2FuY2VsbGVkLoN4hwgDjDxARADhwIIAYyMsF+E3PFlAE+gITy2oSyx8BzxbJcvsAAAJbABEghA7msoAqYSAAHQgwACTXwNw4FnwAgHwAYADK+EFu3e1E0NIAAfhi0gAB+GTSAAH4ZvpAAfht+gAB+G7THwH4b9MfAfhw+kAB+HLUAfho1DD4afhJ0NIfAfhn+kAB+GP6AAH4avoAAfhr+gAB+GzTHwH4cfpAAfhz0x8w+GV/+GEAjCDHAMD/kjBw4NMfMYtmNhbmNlbIIccFkjBx4ItHN0b3CCHHBZIwcuCLZmaW5pc2iCHHBZIwcuCLZkZXBsb3mAHHBZFz4HABZI6rgQPt+ELA//LygQPy+CP4ULny8vgnbyIwgQPwAYIQO5rKALny8vgA+FLbPOCED/LwFwP2+E7AAI6C2zzg2zz4TkBU8AMgwgCOK3AggBDIywVQB88WIvoCFstqFcsfi/TWFya2V0cGxhY2UgZmVljPFsly+wCRNOL4TkAD8AMgwgCOI3AggBDIywVQBM8WIvoCE8tqEssfi3Um95YWx0eYzxbJcvsAkTHigggPQkBwGBkaAYpwIPglghBfzD0UyMsfyz/4Us8WUAPPFhLLACH6AssAyXGAGMjLBfhTzxZw+gLLasyCCA9CQHD7AsmDBvsAf/hif/hm2zwbACD4SND6QNMf0x/6QNMf0x8wAeD7AvhOWKEBoSDCAI4icCCAEMjLBfhSzxZQA/oCEstqyx+LZQcm9maXSM8WyXL7AJEw4nAg+CWCEF/MPRTIyx/LP/hNzxZQA88WEssAggiYloD6AssAyXGAGMjLBfhTzxZw+gLLaszJgwb7AH/4Yts8GwBU+En4SPhQ+E/4RvhE+ELIygDKAMoA+E3PFvhO+gLLH8sf+FLPFszMye1UZp3BZw=='));
const FixPriceV3R2Code = Cell.fromBoc(TonWeb.utils.base64ToBytes('te6cckECCwEAArkAART/APSkE/S88sgLAQIBIAIDAgFIBAUAfvIw7UTQ0wDTH/pA+kD6QPoA1NMAMMABjh34AHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVOBfB4IA//7y8AICzQYHAFegOFnaiaGmAaY/9IH0gfSB9AGppgBgYaH0gfQB9IH0AGEEIIySsKAVgAKrAQH30A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEqYhOmPhW8Q4YBKGATpn8cIxbMbC3MbK2QV44LJOZlvKAVxFWAAyS+G8BJrpOEBFcCBFd0VYACRWdjYKdxjgthOjq+G6hhoaYPqGAD9gHAU4ADAgB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIKAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AkA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVNZeZYk='));

const ContractDeployer = "EQBmSy9SfRj44LZPi84NyvI4seJlZYSz33MM0rl78DnkCb2Z";
const ServiceFeeAddress = "EQAiybdndsGkvXphCXWLDu76jwETEKP3aTM2PBjJ7nQ_TkjB"

const ContractDeployerTestnet = "EQDThGn4NoiaXm-rmfZhhtKbppqTuwLnenhzW5jROU1ixSCy";
const ServiceFeeAddressTestnet = "kQAAgWbO3wOQ6z-NHSvvICav6MbefILGAEpMN4F9-8TxDj6b";

export interface SellResponse {
    address: string;
    message: string;
}

export async function sendSellMessage(tonweb: TonWeb,
                                     userWallet: any,
                                     keyPair: KeyPair,
                                     userAddress: string,
                                     stateInitCell: any,
                                     testnet: boolean,
                                     isAuction: boolean,
                                     itemAddress: string): Promise<SellResponse> {
    
    const userWalletAddress = new tonweb.utils.Address(userAddress);
    var contractDeployer = new tonweb.utils.Address(ContractDeployer);
    if (testnet) {
        contractDeployer = new tonweb.utils.Address(ContractDeployerTestnet);
    }

    const saleBody = new Cell();
    saleBody.bits.writeUint(0, 32);
    if (isAuction)
        saleBody.bits.writeString("deploy");
    else 
        saleBody.bits.writeUint(0, 64);

    const transferNftBody = new Cell();
    transferNftBody.bits.writeUint(0x5fcc3d14, 32);
    transferNftBody.bits.writeUint(0, 64);
    transferNftBody.bits.writeAddress(contractDeployer);
    transferNftBody.bits.writeAddress(userWalletAddress);
    transferNftBody.bits.writeBit(0);
    transferNftBody.bits.writeCoins(tonweb.utils.toNano("1"));
    transferNftBody.bits.writeBit(0);
    transferNftBody.bits.writeUint(0x0fe0ede, 31);
    transferNftBody.refs.push(stateInitCell);
    transferNftBody.refs.push(saleBody);

    const amount = tonweb.utils.toNano(MinBalanceForSale);
    await wait(1000);
    const seqno = await tryNTimes(userWallet.methods.seqno().call, 10, 2000); 
    const stateInitHash = await stateInitCell.hash();
    const sellContractAddress = new tonweb.utils.Address("0:" + tonweb.utils.bytesToHex(stateInitHash));
    const saleAddress = sellContractAddress.toString(true, true, true);
    console.info("Sell contract address:", saleAddress);

    var isOnSale = false;
    for (var i = 0; i < 5; ++i) {
        if (i > 0) {
            const balance = await getBalance(tonweb, userAddress);
            if (balance < amount) {
                const error = "low balance";
                console.info(error);
                return {
                    address: "",
                    message: error,
                };
            }
        }

        await wait(2000);
        console.info(`${i} try transfer nft to sale contract`);
        await tryNTimes(userWallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: itemAddress,
                amount,
                seqno,
                payload: transferNftBody,
                sendMode: 3,
            }).send, 10, 2000);

        console.info("check owner");
        isOnSale = await ensureItemOnSale(tonweb, itemAddress, saleAddress);
        if (isOnSale) {
            break;
        }
    }

    if (!isOnSale) {
        return {
            address: "",
            message: "can not transfer nft to sale contract",
        };
    }

    console.info("item on sale");
    return {
        address: saleAddress,
        message: "",
    };
}

export function createAuctionStateInit(tonweb: TonWeb,
                                       sellAuctionInfo: IAuction,
                                       collectionRoyalty: ICollectionRoyalty,
                                       testnet: boolean,
                                       userWalletAddress: any,
                                       itemAddress: string) {

    const endTimestamp = sellAuctionInfo.duration + Math.round(Date.now() / 1000);
    console.info("endTimestamp:", endTimestamp);
    console.info("duration:", sellAuctionInfo.duration);

    const creatorRoyaltyAddress = new tonweb.utils.Address(collectionRoyalty.address);
    var contractDeployer = new tonweb.utils.Address(ContractDeployer);
    var serviceFeeAddress = new tonweb.utils.Address(ServiceFeeAddress);
    if (testnet) {
        contractDeployer = new tonweb.utils.Address(ContractDeployerTestnet);
        serviceFeeAddress = new tonweb.utils.Address(ServiceFeeAddressTestnet);
    }

    const startPrice = BigInt(tonweb.utils.toNano(`${sellAuctionInfo.price}`).toString());
    const maxPrice = BigInt(tonweb.utils.toNano(`${sellAuctionInfo.maxBid}`).toString());
    const serviceFee = sellAuctionInfo.serviceFeePercent;
    const createdAtTimestamp = Math.round(Date.now() / 1000);
    console.info("createdAtTimestamp", createdAtTimestamp);

    const constantCell = new Cell();
    constantCell.bits.writeUint(8449000, 32); // sub gas price?
    constantCell.bits.writeAddress(serviceFeeAddress); // marketplace address to resolve problems
    constantCell.bits.writeCoins(startPrice); // start price
    constantCell.bits.writeCoins(maxPrice); // max  bid
    constantCell.bits.writeCoins(sellAuctionInfo.minStepPercent); // min step percent
    constantCell.bits.writeUint(0, 32); // prevent bid at last second
    constantCell.bits.writeAddress(new tonweb.utils.Address(itemAddress)); // nftAddress
    constantCell.bits.writeUint(createdAtTimestamp, 32); // createdAtTimestamp

    const feesCell = new Cell();
    feesCell.bits.writeAddress(serviceFeeAddress);
    feesCell.bits.writeUint(serviceFee, 32); // mp factor
    feesCell.bits.writeUint(100, 32); // mp base
    feesCell.bits.writeAddress(creatorRoyaltyAddress);
    feesCell.bits.writeUint(collectionRoyalty.factor, 32); // creator factor
    feesCell.bits.writeUint(collectionRoyalty.base, 32); // creator base

    const auctionData = new Cell();
    auctionData.bits.writeBit(0); // end
    auctionData.bits.writeBit(0); // activated
    auctionData.bits.writeBit(0); // is_canceled
    auctionData.bits.writeUint(0, 2); // last_member    ??? storeBitArray
    auctionData.bits.writeCoins(0); // last_bid
    auctionData.bits.writeUint(0, 32); // last_bid_at
    auctionData.bits.writeUint(endTimestamp, 32); // end_time   
    auctionData.bits.writeAddress(userWalletAddress);
    auctionData.refs.push(feesCell);
    auctionData.refs.push(constantCell);

    const stateInitCell = new Cell();
    stateInitCell.bits.writeBit(0);
    stateInitCell.bits.writeBit(0);
    stateInitCell.bits.writeBit(1);
    stateInitCell.refs.push(AuctionV3R2Code[0]);
    stateInitCell.bits.writeBit(1);
    stateInitCell.refs.push(auctionData);
    stateInitCell.bits.writeBit(0);

    return stateInitCell;
}

export function createFixedPriceStateInit(tonweb: TonWeb,
                                          sellFixedPriceInfo: IFixedPrice,
                                          collectionRoyalty: ICollectionRoyalty,
                                          testnet: boolean,
                                          userWalletAddress: any,
                                          itemAddress: string) {

    const creatorRoyaltyAddress = new tonweb.utils.Address(collectionRoyalty.address);
    var serviceFeeAddress = new tonweb.utils.Address(ServiceFeeAddress);
    if (testnet) {
        serviceFeeAddress = new tonweb.utils.Address(ServiceFeeAddressTestnet);
    }

    const price = BigInt(tonweb.utils.toNano(`${sellFixedPriceInfo.price}`).toString());
    const serviceFee = sellFixedPriceInfo.serviceFeePercent;

    const feesData = new Cell();
    feesData.bits.writeAddress(serviceFeeAddress);
    feesData.bits.writeCoins(price / BigInt(100) * BigInt(serviceFee));
    feesData.bits.writeAddress(creatorRoyaltyAddress);
    feesData.bits.writeCoins(price / BigInt(collectionRoyalty.base) * BigInt(collectionRoyalty.factor));

    const sellData = new Cell();
    sellData.bits.writeBit(0);
    sellData.bits.writeUint(Math.round(Date.now() / 1000), 32);
    sellData.bits.writeAddress(serviceFeeAddress);
    sellData.bits.writeAddress(new tonweb.utils.Address(itemAddress));
    sellData.bits.writeAddress(userWalletAddress);
    sellData.bits.writeCoins(price);
    sellData.refs.push(feesData);
    sellData.bits.writeBit(0);

    const stateInitCell = new Cell();
    stateInitCell.bits.writeBit(0);
    stateInitCell.bits.writeBit(0);
    stateInitCell.bits.writeBit(1);
    stateInitCell.refs.push(FixPriceV3R2Code[0]);
    stateInitCell.bits.writeBit(1);
    stateInitCell.refs.push(sellData);
    stateInitCell.bits.writeBit(0);

    return stateInitCell;
}
