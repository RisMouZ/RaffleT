import { useWalletNfts } from "@nfteyez/sol-rayz-react";
import { Connection } from "@solana/web3.js";
// import type { Options } from "@nfteyez/sol-rayz";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const NFT = () => {
    const { connection } = useConnection();

    const { publicKey } = useWallet();

    const { nfts, isLoading, error } = useWalletNfts({
        publicAddress: publicKey?.toBase58() ?? "",
        connection,
    });

    console.log(nfts?.length);

    if (error) return <div>Have some error</div>;
    if (isLoading) return <div>Loading...</div>;

    return <div>Wallet have {nfts?.length} NFTs</div>;
};

export default NFT;
