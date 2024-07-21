import { PublicKey } from "@solana/web3.js";

import IDL from "../../../../target/idl/raffle_t.json";

const programID = IDL.address;

export const PROGRAM_ID = new PublicKey(programID);
