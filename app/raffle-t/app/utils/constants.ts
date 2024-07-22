import { PublicKey } from "@solana/web3.js";

import IDL from "../../../../target/idl/raffle_t.json";
import { RaffleT } from "../../../../target/types/raffle_t";

const programID = "CKt7TmvijVPm7xgGPBXXDnemzjnaNHAiXPAKWDxpYQmV";

export const PROGRAM_ID = new PublicKey(programID);
