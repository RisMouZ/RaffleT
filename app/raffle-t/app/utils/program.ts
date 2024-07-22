import { AnchorProvider, Idl } from "@project-serum/anchor";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

import { PROGRAM_ID } from "./constants";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { IdlAccounts, Program } from "@coral-xyz/anchor";

export const getProgram = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    const program = new Program<Idl>(IDL as unknown as Idl, PROGRAM_ID, provider);
    return program;
};

export const getUserAddress = async (userPublicKey: PublicKey): Promise<PublicKey> => {
    return (await PublicKey.findProgramAddress([userPublicKey.toBuffer()], PROGRAM_ID))[0];
};

export const getVoterAddress = async (
    votePublicKey: PublicKey,
    userPublicKey: PublicKey
): Promise<PublicKey> => {
    return (
        await PublicKey.findProgramAddress(
            [votePublicKey.toBuffer(), userPublicKey.toBuffer()],
            PROGRAM_ID
        )
    )[0];
};
