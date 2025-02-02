export const mockWallet = () => {
    return {};
};

export const shortenPk = (pk: { toBase58: () => any }, chars = 5) => {
    const pkStr = typeof pk === "object" ? pk.toBase58() : pk;
    return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
};

export const confirmTx = async (
    txHash: any,
    connection: {
        getLatestBlockhash: () => any;
        confirmTransaction: (arg0: {
            blockhash: any;
            lastValidBlockHeight: any;
            signature: any;
        }) => any;
    }
) => {
    const blockhashInfo = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: txHash,
    });
};
