import { useWalletNfts } from "@nfteyez/sol-rayz-react";
import { Connection } from "@solana/web3.js";
// import type { Options } from "@nfteyez/sol-rayz";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { use } from "chai";

const NFT = () => {
    const { connection } = useConnection();

    const { publicKey } = useWallet();

    const { nfts, isLoading, error } = useWalletNfts({
        publicAddress: publicKey?.toBase58() ?? "",
        // pass your connection object to use specific RPC node
        connection,
    });

    console.log(nfts);

    if (error) return <div>Have some error</div>;
    if (isLoading) return <div>Loading...</div>;

    return <div>Wallet have {nfts?.length} NFTs</div>;
};

export default NFT;
