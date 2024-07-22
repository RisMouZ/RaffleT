import { AnchorClientProvider } from "./components/AnchorClientProvider";
import AppWalletProvider from "./components/AppWalletProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AnchorClientProvider>
                    <AppWalletProvider>{children}</AppWalletProvider>
                </AnchorClientProvider>
            </body>
        </html>
    );
}
