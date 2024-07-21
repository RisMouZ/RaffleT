"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import NftDashboard from "./components/NftDashboard";

export default function Home() {
    let { publicKey } = useWallet();
    let { connection } = useConnection();

    console.log("wallet", publicKey?.toBase58());
    console.log("connection", connection);

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <h1>Welcome to RaffleT !!!</h1>
                    <br />
                    <NftDashboard />
                </div>
            </div>
        </>
    );
}
