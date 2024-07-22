export const IDL = {
    address: "CKt7TmvijVPm7xgGPBXXDnemzjnaNHAiXPAKWDxpYQmV",
    metadata: {
        name: "raffle_t",
        version: "0.1.0",
        spec: "0.1.0",
        description: "Created with Anchor",
    },
    instructions: [
        {
            name: "buy",
            discriminator: [102, 6, 61, 18, 1, 218, 235, 234],
            accounts: [
                {
                    name: "raffle",
                    writable: true,
                },
                {
                    name: "buyer",
                    writable: true,
                    pda: {
                        seeds: [
                            {
                                kind: "account",
                                path: "raffle.tickets_count",
                                account: "Raffle",
                            },
                            {
                                kind: "account",
                                path: "raffle",
                            },
                        ],
                    },
                },
                {
                    name: "user",
                },
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
            ],
            args: [],
        },
        {
            name: "create_raffle",
            discriminator: [226, 206, 159, 34, 213, 207, 98, 126],
            accounts: [
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "signer_token_account",
                    writable: true,
                },
                {
                    name: "nft_mint",
                },
                {
                    name: "user",
                    writable: true,
                },
                {
                    name: "raffle",
                    writable: true,
                    pda: {
                        seeds: [
                            {
                                kind: "account",
                                path: "user.raffle_count",
                                account: "User",
                            },
                            {
                                kind: "account",
                                path: "signer",
                            },
                        ],
                    },
                },
                {
                    name: "raffle_token_account",
                    writable: true,
                    pda: {
                        seeds: [
                            {
                                kind: "account",
                                path: "raffle",
                            },
                            {
                                kind: "const",
                                value: [
                                    6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                                    235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245,
                                    133, 126, 255, 0, 169,
                                ],
                            },
                            {
                                kind: "account",
                                path: "nft_mint",
                            },
                        ],
                        program: {
                            kind: "const",
                            value: [
                                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13,
                                131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233,
                                248, 89,
                            ],
                        },
                    },
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
                {
                    name: "token_program",
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                    name: "rent",
                    address: "SysvarRent111111111111111111111111111111111",
                },
                {
                    name: "associated_token_program",
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
                },
            ],
            args: [
                {
                    name: "nft_address",
                    type: "pubkey",
                },
                {
                    name: "max_tickets",
                    type: "u32",
                },
                {
                    name: "tickets_price",
                    type: "u32",
                },
                {
                    name: "end_with_deadline",
                    type: "bool",
                },
                {
                    name: "deadline",
                    type: "u32",
                },
            ],
        },
        {
            name: "draw",
            discriminator: [61, 40, 62, 184, 31, 176, 24, 130],
            accounts: [
                {
                    name: "raffle",
                    writable: true,
                },
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
            ],
            args: [],
        },
        {
            name: "init_user",
            discriminator: [14, 51, 68, 159, 237, 78, 158, 102],
            accounts: [
                {
                    name: "user",
                    writable: true,
                    pda: {
                        seeds: [
                            {
                                kind: "account",
                                path: "signer",
                            },
                        ],
                    },
                },
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
            ],
            args: [],
        },
        {
            name: "withdraw_nft",
            discriminator: [142, 181, 191, 149, 82, 175, 216, 100],
            accounts: [
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "buyer",
                },
                {
                    name: "raffle",
                    writable: true,
                },
                {
                    name: "raffle_token_account",
                    writable: true,
                },
                {
                    name: "nft_mint",
                },
                {
                    name: "user",
                    writable: true,
                },
                {
                    name: "signer_token_account",
                    writable: true,
                    pda: {
                        seeds: [
                            {
                                kind: "account",
                                path: "signer",
                            },
                            {
                                kind: "const",
                                value: [
                                    6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                                    235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245,
                                    133, 126, 255, 0, 169,
                                ],
                            },
                            {
                                kind: "account",
                                path: "nft_mint",
                            },
                        ],
                        program: {
                            kind: "const",
                            value: [
                                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13,
                                131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233,
                                248, 89,
                            ],
                        },
                    },
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
                {
                    name: "token_program",
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                    name: "rent",
                    address: "SysvarRent111111111111111111111111111111111",
                },
                {
                    name: "associated_token_program",
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
                },
            ],
            args: [],
        },
        {
            name: "withdraw_sol",
            discriminator: [145, 131, 74, 136, 65, 137, 42, 38],
            accounts: [
                {
                    name: "raffle",
                    writable: true,
                },
                {
                    name: "signer",
                    writable: true,
                    signer: true,
                },
                {
                    name: "system_program",
                    address: "11111111111111111111111111111111",
                },
            ],
            args: [],
        },
    ],
    accounts: [
        {
            name: "Buyer",
            discriminator: [212, 193, 28, 181, 26, 219, 85, 174],
        },
        {
            name: "Raffle",
            discriminator: [143, 133, 63, 173, 138, 10, 142, 200],
        },
        {
            name: "User",
            discriminator: [159, 117, 95, 227, 239, 151, 58, 236],
        },
    ],
    errors: [
        {
            code: 6000,
            name: "SellerCantBeBuyer",
            msg: "You cannot participate in raffles of which you are the creator.",
        },
        {
            code: 6001,
            name: "RaffleNotEnded",
            msg: "Draw conditions not met",
        },
        {
            code: 6002,
            name: "NotTheSeller",
            msg: "You're not the creator of this raffle",
        },
        {
            code: 6003,
            name: "AllTicketsSelling",
            msg: "All the tickets are selling",
        },
        {
            code: 6004,
            name: "CreateUserAccount",
            msg: "Create a user account for this wallet",
        },
        {
            code: 6005,
            name: "RaffleNotFinished",
            msg: "This raffle isn't finished",
        },
        {
            code: 6006,
            name: "RaffleEnded",
            msg: "This raffle is finished",
        },
        {
            code: 6007,
            name: "DeadlineNotCorrect",
            msg: "The deadline is not correct",
        },
        {
            code: 6008,
            name: "NotTheWinner",
            msg: "You're not the winner",
        },
    ],
    types: [
        {
            name: "Buyer",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "buyer_address",
                        type: "pubkey",
                    },
                ],
            },
        },
        {
            name: "Raffle",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "seller",
                        type: "pubkey",
                    },
                    {
                        name: "raffle_number",
                        type: "u32",
                    },
                    {
                        name: "nft_address",
                        type: "pubkey",
                    },
                    {
                        name: "max_tickets",
                        type: "u32",
                    },
                    {
                        name: "ticket_price",
                        type: "u32",
                    },
                    {
                        name: "end_with_deadline",
                        type: "bool",
                    },
                    {
                        name: "tickets_count",
                        type: "u32",
                    },
                    {
                        name: "deadline",
                        type: "u32",
                    },
                    {
                        name: "raffle_in_progress",
                        type: "bool",
                    },
                    {
                        name: "winning_ticket",
                        type: "i32",
                    },
                ],
            },
        },
        {
            name: "User",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "raffle_count",
                        type: "u32",
                    },
                    {
                        name: "win_count",
                        type: "u16",
                    },
                ],
            },
        },
    ],
};

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/raffle_t.json`.
 */
export type RaffleT = {
    address: "CKt7TmvijVPm7xgGPBXXDnemzjnaNHAiXPAKWDxpYQmV";
    metadata: {
        name: "raffleT";
        version: "0.1.0";
        spec: "0.1.0";
        description: "Created with Anchor";
    };
    instructions: [
        {
            name: "buy";
            discriminator: [102, 6, 61, 18, 1, 218, 235, 234];
            accounts: [
                {
                    name: "raffle";
                    writable: true;
                },
                {
                    name: "buyer";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "raffle.tickets_count";
                                account: "raffle";
                            },
                            {
                                kind: "account";
                                path: "raffle";
                            }
                        ];
                    };
                },
                {
                    name: "user";
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [];
        },
        {
            name: "createRaffle";
            discriminator: [226, 206, 159, 34, 213, 207, 98, 126];
            accounts: [
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "signerTokenAccount";
                    writable: true;
                },
                {
                    name: "nftMint";
                },
                {
                    name: "user";
                    writable: true;
                },
                {
                    name: "raffle";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "user.raffle_count";
                                account: "user";
                            },
                            {
                                kind: "account";
                                path: "signer";
                            }
                        ];
                    };
                },
                {
                    name: "raffleTokenAccount";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "raffle";
                            },
                            {
                                kind: "const";
                                value: [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                kind: "account";
                                path: "nftMint";
                            }
                        ];
                        program: {
                            kind: "const";
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                },
                {
                    name: "tokenProgram";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "rent";
                    address: "SysvarRent111111111111111111111111111111111";
                },
                {
                    name: "associatedTokenProgram";
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
                }
            ];
            args: [
                {
                    name: "nftAddress";
                    type: "pubkey";
                },
                {
                    name: "maxTickets";
                    type: "u32";
                },
                {
                    name: "ticketsPrice";
                    type: "u32";
                },
                {
                    name: "endWithDeadline";
                    type: "bool";
                },
                {
                    name: "deadline";
                    type: "u32";
                }
            ];
        },
        {
            name: "draw";
            discriminator: [61, 40, 62, 184, 31, 176, 24, 130];
            accounts: [
                {
                    name: "raffle";
                    writable: true;
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [];
        },
        {
            name: "initUser";
            discriminator: [14, 51, 68, 159, 237, 78, 158, 102];
            accounts: [
                {
                    name: "user";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "signer";
                            }
                        ];
                    };
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [];
        },
        {
            name: "withdrawNft";
            discriminator: [142, 181, 191, 149, 82, 175, 216, 100];
            accounts: [
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "buyer";
                },
                {
                    name: "raffle";
                    writable: true;
                },
                {
                    name: "raffleTokenAccount";
                    writable: true;
                },
                {
                    name: "nftMint";
                },
                {
                    name: "user";
                    writable: true;
                },
                {
                    name: "signerTokenAccount";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "signer";
                            },
                            {
                                kind: "const";
                                value: [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                kind: "account";
                                path: "nftMint";
                            }
                        ];
                        program: {
                            kind: "const";
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                },
                {
                    name: "tokenProgram";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "rent";
                    address: "SysvarRent111111111111111111111111111111111";
                },
                {
                    name: "associatedTokenProgram";
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
                }
            ];
            args: [];
        },
        {
            name: "withdrawSol";
            discriminator: [145, 131, 74, 136, 65, 137, 42, 38];
            accounts: [
                {
                    name: "raffle";
                    writable: true;
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [];
        }
    ];
    accounts: [
        {
            name: "buyer";
            discriminator: [212, 193, 28, 181, 26, 219, 85, 174];
        },
        {
            name: "raffle";
            discriminator: [143, 133, 63, 173, 138, 10, 142, 200];
        },
        {
            name: "user";
            discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
        }
    ];
    errors: [
        {
            code: 6000;
            name: "sellerCantBeBuyer";
            msg: "You cannot participate in raffles of which you are the creator.";
        },
        {
            code: 6001;
            name: "raffleNotEnded";
            msg: "Draw conditions not met";
        },
        {
            code: 6002;
            name: "notTheSeller";
            msg: "You're not the creator of this raffle";
        },
        {
            code: 6003;
            name: "allTicketsSelling";
            msg: "All the tickets are selling";
        },
        {
            code: 6004;
            name: "createUserAccount";
            msg: "Create a user account for this wallet";
        },
        {
            code: 6005;
            name: "raffleNotFinished";
            msg: "This raffle isn't finished";
        },
        {
            code: 6006;
            name: "raffleEnded";
            msg: "This raffle is finished";
        },
        {
            code: 6007;
            name: "deadlineNotCorrect";
            msg: "The deadline is not correct";
        },
        {
            code: 6008;
            name: "notTheWinner";
            msg: "You're not the winner";
        }
    ];
    types: [
        {
            name: "buyer";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "buyerAddress";
                        type: "pubkey";
                    }
                ];
            };
        },
        {
            name: "raffle";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "seller";
                        type: "pubkey";
                    },
                    {
                        name: "raffleNumber";
                        type: "u32";
                    },
                    {
                        name: "nftAddress";
                        type: "pubkey";
                    },
                    {
                        name: "maxTickets";
                        type: "u32";
                    },
                    {
                        name: "ticketPrice";
                        type: "u32";
                    },
                    {
                        name: "endWithDeadline";
                        type: "bool";
                    },
                    {
                        name: "ticketsCount";
                        type: "u32";
                    },
                    {
                        name: "deadline";
                        type: "u32";
                    },
                    {
                        name: "raffleInProgress";
                        type: "bool";
                    },
                    {
                        name: "winningTicket";
                        type: "i32";
                    }
                ];
            };
        },
        {
            name: "user";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "raffleCount";
                        type: "u32";
                    },
                    {
                        name: "winCount";
                        type: "u16";
                    }
                ];
            };
        }
    ];
};
