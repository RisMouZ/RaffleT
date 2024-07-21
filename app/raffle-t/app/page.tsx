"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import NftDashboard from "./components/NftDashboard";
import { use } from "chai";
import { AppContext } from "./components/AnchorClient";

export default function Home() {
    let { publicKey } = useWallet();
    let wallet = useAnchorWallet();
    let { connection } = useConnection();

    console.log("wallet", publicKey?.toBase58(), wallet, useWallet());
    console.log("connection", connection);

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                {/* crée deux div minimalist en tailwind */}
                <div className="flex flex-col items-center">
                    <h1>Welcome to RaffleT !!!</h1>
                    <br />
                    <NftDashboard />
                </div>
                <div className="flex flex-col items-center"></div>
            </div>
        </>
    );
}
