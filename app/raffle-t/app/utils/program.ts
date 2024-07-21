import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

import IDL from "../../../../target/idl/raffle_t.json";
import { PROGRAM_ID } from "./constants";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";

export const getProgram = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    const program = new Program<Idl>(IDL as unknown as Idl, PROGRAM_ID, provider);
    return program;
};

// export const getVoterAddress = async (
//     votePublicKey: PublicKey,
//     userPublicKey: PublicKey
// ): Promise<PublicKey> => {
//     return (
//         await PublicKey.findProgramAddress(
//             [votePublicKey.toBuffer(), userPublicKey.toBuffer()],
//             PROGRAM_ID
//         )
//     )[0];
// };
