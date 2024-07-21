"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import React from "react";

const Navbar = () => {
    return (
        <div>
            {/* crée une Navbar en tailwind minimalist */}
            <nav
                className="flex justify-between items-center h-16 bg-white text-black relative shadow-sm font-mono"
                role="navigation"
            >
                <Link href="/" className="pl-8">
                    RaffleT
                </Link>
                <div className="pr-8">
                    <Link href="/explore" className="p-4">
                        Explore
                    </Link>
                    <Link href="/createRaffle" className="p-4">
                        Create Raffle
                    </Link>
                    <Link href="/dashboard" className="p-4">
                        Dashboard
                    </Link>

                    <WalletMultiButton />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
