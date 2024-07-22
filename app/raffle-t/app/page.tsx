"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import NftDashboard from "./components/NftDashboard";
import AppWalletProvider from "./components/AppWalletProvider";
import { useContext, createContext } from "react";
import { log } from "console";
import { useAnchorClient } from "./components/AnchorClientProvider";

export default function Home() {
    const { user, createAccount } = useAnchorClient();
    let { publicKey } = useWallet();
    let wallet = useAnchorWallet();
    let { connection } = useConnection();

    console.log("anchorContext", user);

    const accountInfo = () => {
            //@ts-ignore
            createAccount(publicKey);
        
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <h1>Welcome to RaffleT !!!</h1>
                    <br />
                    <NftDashboard />
                    <br />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={accountInfo}
                    >
                        Créer un compte
                    </button>
                </div>
                <div className="flex flex-col items-center"></div>
            </div>
        </>
    );
}
