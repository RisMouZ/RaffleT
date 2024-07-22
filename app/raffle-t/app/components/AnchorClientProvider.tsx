"use client";

import { createContext, useState, useEffect, useMemo, useContext } from "react";
import { SystemProgram, PublicKey, clusterApiUrl, Connection } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import { getProgram, getUserAddress } from "../utils/program";
import { confirmTx, mockWallet } from "../utils/helpers";

import { ReactNode } from "react";
import { IdlAccounts } from "@coral-xyz/anchor";
import { IDL } from "../anchor/idl";
import { Program } from "@project-serum/anchor";

const programId = new PublicKey("CKt7TmvijVPm7xgGPBXXDnemzjnaNHAiXPAKWDxpYQmV");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(IDL as any, programId, {
    connection,
});

export const AnchorClientContext = createContext(undefined);

interface AnchorClientProviderProps {
    children: ReactNode;
}

export const AnchorClientProvider = ({ children }: AnchorClientProviderProps) => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    // const program = useMemo(() => {
    //     if (connection) {
    //         return getProgram(connection, wallet ?? mockWallet());
    //     }
    // }, [connection, wallet]);

    useEffect(() => {
        if (user.length == 0) {
            takeUser();
        }
    }, [program]);

    const [user, setUser] = useState([]);

    const takeUser = async () => {
        const users = await program?.account.user.all();
        console.log("PROGRAM", program);
    };

    const createAccount = async (publicKey: PublicKey) => {
        const userAddress = await getUserAddress(publicKey);

        // const tx = await program?.methods.init_user().accounts({
        //     signer
        //     user: userAddress,
        //     systemProgram: SystemProgram.programId,
        // });
    };

    const viewVotes = async () => {
        // TODO 3
        // viewVotes est la méthode utilisé pour récupérer tous les votes et implémenter la variable "votes"
        // Bonus : trier le tableau des votes par deadline
    };

    const createVote = async () => {
        // TODO 4
        // createVote est la méthode utilisé pour créer un vote à partir du formulaire rempli par l'utilisateur
        // Indice 1 : Aller voir où est appelé cette méthode et les paramètres transmis
        // Indice 2 : Générer aléatoirement une keypair pour le voteAccount
        // Indice 3 : Appeler la méthode du smart contract creerVote
        // Indice 4 : Avec les 3 paramètres + 3 accounts + signers
        // Indice 5 : Utiliser confirmTx
    };

    const vote = async () => {
        // TODO 5
        // vote est la méthode utilisé pour voter en tant qu'utilisateur
        // Indice 1 : Aller voir où est appelé cette méthode et les paramètres transmis
        // Indice 2 : Appeler la méthode du smart contract vote
        // Indice 3 : Avec 1 paramètre + 4 accounts
        // Indice 4 : Utiliser confirmTx
    };

    // TODO BONUS nouvelle fonctionnalité
    // Récupérer si l'utilisateur a déjà voté pour l'afficher à côté de l'option correspondante
    // Indice 1 : Faire un appel au smart contract pour récupérer le Voter account s'il existe (publickey généré avec la seed voteAccount + userWallet)

    return (
        //@ts-ignore
        <AnchorClientContext.Provider value={{ user, createAccount }}>
            {" "}
            {children}{" "}
        </AnchorClientContext.Provider>
    );
};

export const useAnchorClient = () => {
    const context = useContext(AnchorClientContext);
    if (context === undefined) {
        throw new Error("useAnchorClient must be used within an AnchorClientProvider");
    }
    return context;
};
