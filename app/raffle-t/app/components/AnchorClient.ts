// import { AnchorProvider, Program } from "@project-serum/anchor";
// import { Connection, PublicKey } from "@solana/web3.js";
// import idl from "./../../../../target/idl/raffle_t.json";
// import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";

// const { connection } = useConnection();
// const wallet = useAnchorWallet();
// const programID = new PublicKey(idl.address);
// const provider = new AnchorProvider(connection, wallet, programID);

import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { SystemProgram } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import { getProgram } from "../utils/program";
import { confirmTx, mockWallet } from "../utils/helpers";

//@ts-ignore
export const AppContext = createContext();

import { ReactNode } from "react";

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const program = useMemo(() => {
        if (connection) {
            return getProgram(connection, wallet ?? mockWallet());
        }
    }, [connection, wallet]);

    useEffect(() => {
        if (votes.length == 0) {
            viewVotes();
        }
    }, [program]);

    const [votes, setVotes] = useState([]);

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

    // return (
};

export const useAppContext = () => {
    return useContext(AppContext);
};
