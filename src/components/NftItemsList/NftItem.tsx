
interface NftItemProps {
    imgURL: string;
    title: string;
    isSelected: boolean;
    isOnSale: boolean;
    onClick: () => void;
}

export function NftItem({ imgURL, title, isSelected, isOnSale, onClick }: NftItemProps) {
    const imagePath = imgURL == "" ? "https://tonbyte.com/gateway/A57B2F5A06CCBCB7CD33860D0E3753782E81A84CDA4E5FE2312E59F15CAA0614" : imgURL;

    return (
        <div className="Nft-item"
            style={{
                border: isSelected ? "1px solid #000" : "1px solid grey",
                cursor: "pointer"
            }}
            onClick={() => {
                onClick();
            }}>
            <img src={imagePath} alt="" />
            <p className="Nft-item-p" 
                style={{
                    fontWeight: isSelected ? "bold" : "normal",
                }}>{title}</p>
            {
                isSelected && !isOnSale && (
                    <p className="Mark">✅</p>
                )
            }
            {
                isOnSale && (
                    <p className="OnSale">on sale</p>
                )
            }
            <p></p>
        </div>
    );
}
