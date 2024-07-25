import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RaffleT } from "../target/types/raffle_t";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { assert, use } from "chai";
import { BN } from 'bn.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, getOrCreateAssociatedTokenAccount, mintTo, getAccount } from "@solana/spl-token";


describe("Raffle_T Units Tests", () => {

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.raffle_t as Program<RaffleT>;

    /*async function create_wallet_with_sol(): Promise<Keypair> {
      const wallet = Keypair.generate();
      const tx = await program.provider.connection.requestAirdrop(wallet.publicKey, 0.1 * LAMPORTS_PER_SOL);
        await program.provider.connection.confirmTransaction(tx);
        return wallet;
    }*/

      async function create_wallet_with_sol_from_existing(): Promise<Keypair> {
        const wallet = Keypair.generate();
        const fromWallet = provider.wallet; 
        const airdropAmount = 7 * LAMPORTS_PER_SOL;
      
        const tx = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: airdropAmount,
          })
        );
      
        await provider.sendAndConfirm(tx);
      
        const balance = await program.provider.connection.getBalance(wallet.publicKey);
        console.log(`Transfer successful: ${balance / LAMPORTS_PER_SOL} SOL`);
        return wallet;
      }

      async function create_nft_mint_and_account(wallet: Keypair): Promise<PublicKey> {
          const mint = await createMint(
              provider.connection,
              wallet,
              wallet.publicKey,
              null,
              0 // 0 = decimals
          );
      
          const tokenAccount = await createAssociatedTokenAccount(
              provider.connection,
              wallet,
              mint,
              wallet.publicKey
          );
      
          await mintTo(
              provider.connection,
              wallet,
              mint,
              tokenAccount,
              wallet.publicKey,
              1
          );
      
          return mint;
    }
      
    async function init_User(wallet: Keypair): Promise<PublicKey> {
      const [userPda] = PublicKey.findProgramAddressSync(
            [wallet.publicKey.toBuffer()],
            program.programId
      );

        await program.methods.initUser()
            .accounts({
                user: userPda,
                signer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([wallet])
            .rpc();

        return userPda;
    }

    async function create_raffle(
          nftMint: PublicKey,
          maxTickets: number,
          ticketPrice: number,
          endWithDeadline: boolean,
          deadline: number,
          wallet: Keypair,
          userPda: PublicKey,
          signerTokenAccount: PublicKey,
          ): Promise<PublicKey> {
                const userAccount = await program.account.user.fetch(userPda);
                const raffleCount = new BN(userAccount.raffleCount);
            
                const [rafflePda] = PublicKey.findProgramAddressSync(
                    [raffleCount.toArrayLike(Buffer, 'le', 4), wallet.publicKey.toBuffer()],
                    program.programId
                );
            
           await program.methods.createRaffle(
                    nftMint,
                    maxTickets,
                    ticketPrice,
                    endWithDeadline,
                    deadline
                )
                .accounts({
                    user: userPda,
                    raffle: rafflePda,
                    signer: wallet.publicKey,
                    signerTokenAccount: signerTokenAccount,
                    nftMint: nftMint,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })
                .signers([wallet])
                .rpc();

            return rafflePda;
      }
            
      async function buy(user: Keypair,
          rafflePda: PublicKey,
          userPda: PublicKey,
          tickets_count: number): Promise<PublicKey> {

        const userAccount = await program.account.user.fetch(userPda);
        const raffleCount = new BN(userAccount.raffleCount);
        const ticketsCountBuffer = Buffer.from(new Uint32Array([tickets_count]).buffer);

        const [buyerPda] = PublicKey.findProgramAddressSync(
          [ticketsCountBuffer, rafflePda.toBuffer()],
          program.programId
        );
  
        await program.methods.buy()
          .accounts({
            raffle: rafflePda,
            buyer: buyerPda, 
            user: userPda,
            signer: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();

        return buyerPda;
      }

      async function draw(user: Keypair, rafflePda: PublicKey): Promise<void> {
        await program.methods.draw()
          .accounts({
            raffle: rafflePda,
            signer: user.publicKey,
            systemProgram: SystemProgram.programId
        })
          .signers([user])
          .rpc();
      }

      async function withdraw_sol(user: Keypair, rafflePda: PublicKey): Promise<void> {
        await program.methods.withdrawSol()
            .accounts({
                raffle: rafflePda,
                signer: user.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([user])
            .rpc();
      }

      async function withdraw_nft(
        user: Keypair,
        rafflePda: PublicKey,
        buyerPda: PublicKey,
        signerTokenAccount: PublicKey,
        raffleTokenAccount: PublicKey,
        nftMint: PublicKey,
        userPda: PublicKey
      ): Promise<void> {
        await program.methods.withdrawNft()
          .accounts({
            signer: user.publicKey,
            buyer: buyerPda,
            raffle: rafflePda,
            raffleTokenAccount: raffleTokenAccount,
            nftMint: nftMint,
            user: userPda,
            signerTokenAccount: signerTokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
      }
  

    let wallet1: Keypair, wallet2: Keypair, wallet3: Keypair; wallet4: Keypair; 
    wallet5: Keypair;wallet6: Keypair;wallet7: Keypair;wallet8: Keypair;wallet9: Keypair;wallet10: Keypair;
    let mint1: PublicKey, mint2: PublicKey, mint3: PublicKey;
    let tokenAccount1: PublicKey, tokenAccount2: PublicKey, tokenAccount3: PublicKey; 
    let userPda1: PublicKey, userPda2: PublicKey, userPda3: PublicKey; userPda4: PublicKey; 
    userPda5: PublicKey; userPda6: PublicKey; userPda7: PublicKey;
    let rafflePda1: PublicKey, rafflePda2: PublicKey, rafflePda3: PublicKey;
    let buyerPda1: PublicKey, buyerPda2: PublicKey, buyerPda3: PublicKey;


    // WALLET BALANCE CHECKS BEFORE UNITS TESTS//


    xit("Get wallet balance after airdrop / localhost", async () => {

        wallet1 = await create_wallet_with_sol();
        assert.ok(wallet1);
        
        const balance = await provider.connection.getBalance(wallet1.publicKey);
        console.log("Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");

        assert.ok(balance >= 0.01 * LAMPORTS_PER_SOL, "Wallet should have at least 0.01 SOL");

    });

    it("Get wallet balance after airdrop / SOLANA CLI Keypair", async () => {

      wallet1 = await create_wallet_with_sol_from_existing();
      assert.ok(wallet1);
      
      const balance = await provider.connection.getBalance(wallet1.publicKey);
      console.log("Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");

      assert.ok(balance >= 0.01 * LAMPORTS_PER_SOL, "Wallet should have at least 0.01 SOL");

    });


    /// INIT USER FUNCTION TESTS ///


    it("Account + userPDA address check ", async () => {

      wallet1 = await create_wallet_with_sol_from_existing();

      userPda1 = await init_User(wallet1);

      console.log("UserPDA Address:", userPda1.toString());

      assert.ok(userPda1);
      
    });

    it("Create 3 userPDA with different wallets", async () => {

        wallet1 = await create_wallet_with_sol_from_existing();
        wallet2 = await create_wallet_with_sol_from_existing();
        wallet3 = await create_wallet_with_sol_from_existing();

        userPda1 = await init_User(wallet1);
        userPda2 = await init_User(wallet2);
        userPda3 = await init_User(wallet3);

        assert.ok(userPda1);
        assert.ok(userPda2);
        assert.ok(userPda3);

    });

    it("One user can't create more than one account", async () => {

      wallet1 = await create_wallet_with_sol_from_existing();
      userPda1 = await init_User(wallet1);
      assert.ok(userPda1, "User account creation successful");

        try {
              await init_User(wallet1);
              assert.fail("Can't create more than one account");
          } catch (error) {
              assert.ok(error.message.includes("already in use") || error.message.includes("custom program error: 0x0"), "Error message");
        }
    });

    it("Counters and Raffle_PDA checks after unique user initialisation", async () => {

      wallet1 = await create_wallet_with_sol_from_existing();

      userPda1 = await init_User(wallet1);

      const userInfo1 = await program.account.user.fetch(userPda1);

      assert.ok(userPda1);

      assert.equal(userInfo1.raffleCount, 0, "user.raffle_count should be initialized to 0");

      assert.equal(userInfo1.winCount, 0, "user.win_count should be initialized to 0");

    });
    
    it("Counters and PDA checks after multiple accounts creation", async () => {

      // 3 different wallets can create an account on the platform:

      wallet1 = await create_wallet_with_sol_from_existing();
      wallet2 = await create_wallet_with_sol_from_existing();
      wallet3 = await create_wallet_with_sol_from_existing();

      userPda1 = await init_User(wallet1);
      userPda2 = await init_User(wallet2);
      userPda3 = await init_User(wallet3);

      const userInfo1 = await program.account.user.fetch(userPda1);
      const userInfo2 = await program.account.user.fetch(userPda2);
      const userInfo3 = await program.account.user.fetch(userPda3);

      assert.ok(userPda1);
      assert.ok(userPda2);
      assert.ok(userPda3);

      assert.equal(userInfo1.raffleCount, 0, "user.raffle_count should be 0");
      assert.equal(userInfo2.raffleCount, 0, "user.raffle_count should be 0");
      assert.equal(userInfo3.raffleCount, 0, "user.raffle_count should be 0");

      assert.equal(userInfo1.winCount, 0, "user.win_count should be 0");
      assert.equal(userInfo2.winCount, 0, "user.win_count should be 0");
      assert.equal(userInfo3.winCount, 0, "user.win_count should be 0");

    });
    
    it("Insufficient balance for user account creation check", async () => {

      const walletWithoutSol = Keypair.generate();
  
      try {
          await program.methods.initUser()
              .accounts({
                  user: PublicKey.findProgramAddressSync([walletWithoutSol.publicKey.toBuffer()], program.programId)[0],
                  signer: walletWithoutSol.publicKey,
                  systemProgram: SystemProgram.programId
              })
              .signers([walletWithoutSol])
              .rpc();
  
          assert.fail("Init should fail with insufficient balance");
      } catch (error) {
          assert.ok(error.message.includes("custom program error: 0x1"), "Init should fail with insufficient balance");
      }
    });

    it("Raffle_count check after mutiple raffle creation", async () => {

      const wallet = await create_wallet_with_sol_from_existing();
      const userPda = await init_User(wallet);
  
      let userInfo = await program.account.user.fetch(userPda);
      assert.equal(userInfo.raffleCount, 0, "Initial raffle_count should be 0");
      assert.equal(userInfo.winCount, 0, "Initial win_count should be 0");
  
      const nftMint = await create_nft_mint_and_account(wallet);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet,
          nftMint,
          wallet.publicKey
      );
  
      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
  
      const rafflePda = await create_raffle(
          nftMint,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet,
          userPda,
          signerTokenAccount.address,
      );
  
      userInfo = await program.account.user.fetch(userPda);
      assert.equal(userInfo.raffleCount, 1, "raffle_count should be updated to 1");    
    });

    it("Error check for incorrect PDA address", async () => {

      const wallet = await create_wallet_with_sol_from_existing();
  
      // Incorrect PDA address:

      const [incorrectUserPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("incorrect-seed")],
          program.programId
      );
  
      try {
          await program.methods.initUser()
              .accounts({
                  user: incorrectUserPda,
                  signer: wallet.publicKey,
                  systemProgram: SystemProgram.programId
              })
              .signers([wallet])
              .rpc();
  
          assert.fail("Init_user should fail with incorrect PDA address");
      } catch (error) {
          console.log("Error message: ", error.message);
          assert.ok(error.message.includes("A seeds constraint was violated"), "'A seeds constraint was violated'");
      }
    });
  

    /// CREATE_RAFFLE FUNCTION TESTS ///


    it("Create a raffle with Seller NFT check", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const rafflePda = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );

      const raffleAccount = await program.account.raffle.fetch(rafflePda);

      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());
    });

    it("User can't create a Raffle without register first", async () => {
      
      const wallet1 = await create_wallet_with_sol_from_existing();

      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      try {
        await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          undefined,
          signerTokenAccount1.address);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        //console.log('Caught error:', error);

        assert.include(error.message, 'Cannot read properties of undefined', "Create a user account for this wallet");
      }
    });

    it("User can't create a raffle with a incorrect deadline", async () => {

      // Incorrect deadline: 1 hour in the past

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) - 3600; 

      try {
          await create_raffle(nftMint1,
            maxTickets,
            ticketPrice,
            endWithDeadline,
            deadline,
            wallet1,
            userPda1,
            signerTokenAccount1.address);

          assert.fail("Expected an error to be thrown.");
      } catch (error) {
          //console.log('Caught error:', error);
          //console.log('Error message:', error.message);
          //console.log('Error stack:', error.stack);

          assert.include(error.message, 'DeadlineNotCorrect', "The deadline is not correct");
      }
    });

    it("User can't create a raffle with an invalid signer token account", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const invalidSignerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          new PublicKey("11111111111111111111111111111111")
      );
    
      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      try {
        await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          invalidSignerTokenAccount.address
        );
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        //console.log('Caught error:', error);
        assert.include(error.message, 'Simulation failed.', "Expected error message for invalid signer token account");
      }
    });

    it("Ticket price is not correct", async () => {

      // Ticket price can't be negative:

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      const maxTickets = 100;
      const ticketPrice = -10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      try {
        await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address);

        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        //console.log('Caught error:', error);
        assert.include(error.message, 'The value of "value" is out of range', "Ticket price is not correct");
      }
      
    });

    it("Max tickets number is not correct", async () => {

      // Max ticket number can't be negative:

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      const maxTickets = -100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      try {
        await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        //console.log('Caught error:', error);
        assert.include(error.message, 'The value of "value" is out of range', "An unexpected error was thrown.");
      }

    });

    it("Create a raffle with rafflePDA address check", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
  
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
  
      const rafflePda = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
  
      // RafflePDA Address check:

      //console.log("rafflePda address:", rafflePda.toString());
  
      const raffleAccount = await program.account.raffle.fetch(rafflePda);
  
      assert.ok(rafflePda, "rafflePda should be created");
      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());
    });
  
    it("Transfert NFT check from seller account to rafflePDA with Max ticket option", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda = await init_User(wallet1);

      const nftMint = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint,
          wallet1.publicKey
      );

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Seller NFT balance check before NFT transfert:

      const initialSignerTokenAccountBalance = await provider.connection.getTokenAccountBalance(signerTokenAccount.address);
      //console.log("Seller NFT balance before NFT transfert:", initialSignerTokenAccountBalance.value.amount);

      const rafflePda = await create_raffle(
          nftMint,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda,
          signerTokenAccount.address,
      );

      // RafflePDA Address check:

      //console.log("rafflePda address:", rafflePda.toString());

      // RafflePDA check after NFT transfert:

      const raffleTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint,
          rafflePda,
          true // For ATA creation in rafflePDA
      );

      // ATA rafflePDA addres creation check:

      //console.log("RafflePDA ATA address:", raffleTokenAccount.address.toString());

      // RafflePDA NFT balance after NFT transfert:

      const raffleTokenAccountBalance = await provider.connection.getTokenAccountBalance(raffleTokenAccount.address);
      //console.log("RafflePDA NFT balance after NFT transfert:", raffleTokenAccountBalance.value.amount);

      // Seller NFT balance check after NFT transfert:

      const finalSignerTokenAccountBalance = await provider.connection.getTokenAccountBalance(signerTokenAccount.address);
      //console.log("Seller NFT balance check after NFT transfert:", finalSignerTokenAccountBalance.value.amount);

      assert.equal(finalSignerTokenAccountBalance.value.amount, initialSignerTokenAccountBalance.value.amount - 1, "NFT should be tranferred from seller account to rafflePDA");
      assert.equal(raffleTokenAccountBalance.value.amount, 1, "RafflePDA should receive 1 NFT");

      const raffleAccount = await program.account.raffle.fetch(rafflePda);
      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("Transfert NFT check from seller account to rafflePDA with deadline option", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda = await init_User(wallet1);

      const nftMint = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint,
        wallet1.publicKey
      );

      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const initialSignerTokenAccountBalance = await provider.connection.getTokenAccountBalance(signerTokenAccount.address);
      //console.log("Seller NFT balance before NFT transfert:", initialSignerTokenAccountBalance.value.amount);

      const rafflePda = await create_raffle(
        nftMint,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda,
        signerTokenAccount.address,
      );

      //console.log("rafflePda address:", rafflePda.toString());

      const raffleTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint,
        rafflePda,
        true 
      );

      const raffleTokenAccountBalance = await provider.connection.getTokenAccountBalance(raffleTokenAccount.address);
      //console.log("RafflePDA NFT balance after NFT transfert:", raffleTokenAccountBalance.value.amount);

      const finalSignerTokenAccountBalance = await provider.connection.getTokenAccountBalance(signerTokenAccount.address);
      //console.log("Seller NFT balance check after NFT transfert", finalSignerTokenAccountBalance.value.amount);

      assert.equal(finalSignerTokenAccountBalance.value.amount, initialSignerTokenAccountBalance.value.amount - 1, "NFT should be tranferred from seller account to rafflePDA");
      assert.equal(raffleTokenAccountBalance.value.amount, 1, "RafflePDA should receive 1 NFT");

      const raffleAccount = await program.account.raffle.fetch(rafflePda);
      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("Create a raffle with deadline", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint,
          wallet1.publicKey
      );
  
      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      const rafflePda1 = await create_raffle(
        nftMint,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address);

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
   
      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.deadline, deadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("Create a raffle with 100 Tickets", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint,
          wallet1.publicKey
      );

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(
        nftMint,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address,);

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);

      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("One user can create multiple differents raffles", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const nftMint2 = await create_nft_mint_and_account(wallet1);
      const nftMint3 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint2,
          wallet1.publicKey
      );

      const signerTokenAccount3 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint3,
          wallet1.publicKey
      );

      // Raffle 1 => 100 tickets (Without deadline):

      const maxTickets1 = 100;
      const ticketPrice1 = 10;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets1,
        ticketPrice1,
        endWithDeadline1,
        deadline1,
        wallet1,
        userPda1,
        signerTokenAccount1.address);

      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);

      assert.equal(raffleAccount1.maxTickets, maxTickets1);
      assert.equal(raffleAccount1.ticketPrice, ticketPrice1);
      assert.equal(raffleAccount1.endWithDeadline, endWithDeadline1);
      assert.equal(raffleAccount1.seller.toString(), wallet1.publicKey.toString());

      // Raffle 2 => 1000 tickets (Without deadline):

      const maxTickets2 = 1000;
      const ticketPrice2 = 50;
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda2 = await create_raffle(
        nftMint2,
        maxTickets2,
        ticketPrice2,
        endWithDeadline2,
        deadline2,
        wallet1,
        userPda1,
        signerTokenAccount2.address);

      const raffleAccount2 = await program.account.raffle.fetch(rafflePda2);

      assert.equal(raffleAccount2.maxTickets, maxTickets2);
      assert.equal(raffleAccount2.ticketPrice, ticketPrice2);
      assert.equal(raffleAccount2.endWithDeadline, endWithDeadline2);  
      assert.equal(raffleAccount2.seller.toString(), wallet1.publicKey.toString());

      // Raffle 3 with deadline of 2 DAY:

      const maxTickets3 = 0;
      const ticketPrice3 = 10;
      const endWithDeadline3 = true;
      const deadline3 = Math.floor(Date.now() / 1000) + 172800; 

      const rafflePda3 = await create_raffle(
        nftMint3,
        maxTickets3,
        ticketPrice3,
        endWithDeadline3,
        deadline3,
        wallet1,
        userPda1,
        signerTokenAccount3.address);

      const raffleAccount3 = await program.account.raffle.fetch(rafflePda3);

      assert.equal(raffleAccount3.maxTickets, maxTickets3);
      assert.equal(raffleAccount3.ticketPrice, ticketPrice3);
      assert.equal(raffleAccount3.endWithDeadline, endWithDeadline3);
      assert.equal(raffleAccount3.deadline, deadline3);
      assert.equal(raffleAccount3.seller.toString(), wallet1.publicKey.toString());

    });

    it("Multiple users can create multiple differents raffles", async () => {

      // User 1:

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      // User 2:

      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);
      const nftMint2 = await create_nft_mint_and_account(wallet2);
      const nftMint2_2 = await create_nft_mint_and_account(wallet2);
      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet2,
        nftMint2,
        wallet2.publicKey
      );
      const signerTokenAccount2_2 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet2,
        nftMint2_2,
        wallet2.publicKey
      );
    
      // User 3:

      const wallet3 = await create_wallet_with_sol_from_existing();
      const userPda3 = await init_User(wallet3);
      const nftMint3 = await create_nft_mint_and_account(wallet3);
      const nftMint3_2 = await create_nft_mint_and_account(wallet3);
      const signerTokenAccount3 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet3,
        nftMint3,
        wallet3.publicKey
      );
      const signerTokenAccount3_2 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet3,
        nftMint3_2,
        wallet3.publicKey
      );
    
      // User1 Raffle 1 => 25 tickets:

      const maxTickets1_user1 = 25;
      const ticketPrice1_user1 = 1;
      const endWithDeadline1_user1 = false;
      const deadline1_user1 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1_user1 = await create_raffle(
        nftMint1,
        maxTickets1_user1,
        ticketPrice1_user1,
        endWithDeadline1_user1,
        deadline1_user1,
        wallet1,
        userPda1,
        signerTokenAccount1.address
      );
      const raffleAccount1_user1 = await program.account.raffle.fetch(rafflePda1_user1);
    
      //console.log("User1 Raffle1:", raffleAccount1_user1);
      assert.equal(raffleAccount1_user1.maxTickets, maxTickets1_user1);
      assert.equal(raffleAccount1_user1.ticketPrice, ticketPrice1_user1);
      assert.equal(raffleAccount1_user1.endWithDeadline, endWithDeadline1_user1);
      assert.equal(raffleAccount1_user1.seller.toString(), wallet1.publicKey.toString());
    
      // User2 Raffle 1 => 10 tickets:

      const maxTickets1_user2 = 10;
      const ticketPrice1_user2 = 1;
      const endWithDeadline1_user2 = false;
      const deadline1_user2 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1_user2 = await create_raffle(
        nftMint2,
        maxTickets1_user2,
        ticketPrice1_user2,
        endWithDeadline1_user2,
        deadline1_user2,
        wallet2,
        userPda2,
        signerTokenAccount2.address
      );
      const raffleAccount1_user2 = await program.account.raffle.fetch(rafflePda1_user2);
    
      //console.log("User2 Raffle1:", raffleAccount1_user2);
      assert.equal(raffleAccount1_user2.maxTickets, maxTickets1_user2);
      assert.equal(raffleAccount1_user2.ticketPrice, ticketPrice1_user2);
      assert.equal(raffleAccount1_user2.endWithDeadline, endWithDeadline1_user2);
      assert.equal(raffleAccount1_user2.seller.toString(), wallet2.publicKey.toString());
    
      // User3 Raffle 1 with a 7 days deadline:

      const maxTickets1_user3 = 0;
      const ticketPrice1_user3 = 10;
      const endWithDeadline1_user3 = true;
      const deadline1_user3 = Math.floor(Date.now() / 1000) + 604800;
    
      const rafflePda1_user3 = await create_raffle(
        nftMint3,
        maxTickets1_user3,
        ticketPrice1_user3,
        endWithDeadline1_user3,
        deadline1_user3,
        wallet3,
        userPda3,
        signerTokenAccount3.address
      );
      const raffleAccount1_user3 = await program.account.raffle.fetch(rafflePda1_user3);
    
      //console.log("User3 Raffle1:", raffleAccount1_user3);
      assert.equal(raffleAccount1_user3.maxTickets, maxTickets1_user3);
      assert.equal(raffleAccount1_user3.ticketPrice, ticketPrice1_user3);
      assert.equal(raffleAccount1_user3.endWithDeadline, endWithDeadline1_user3);
      assert.equal(raffleAccount1_user3.deadline, deadline1_user3);
      assert.equal(raffleAccount1_user3.seller.toString(), wallet3.publicKey.toString());
    
      // User2 Raffle 2 with 3 days deadline:

      const maxTickets2_user2 = 0;
      const ticketPrice2_user2 = 1;
      const endWithDeadline2_user2 = true;
      const deadline2_user2 = Math.floor(Date.now() / 1000) + 259200;
    
      const rafflePda2_user2 = await create_raffle(
        nftMint2_2,
        maxTickets2_user2,
        ticketPrice2_user2,
        endWithDeadline2_user2,
        deadline2_user2,
        wallet2,
        userPda2,
        signerTokenAccount2_2.address
      );
      const raffleAccount2_user2 = await program.account.raffle.fetch(rafflePda2_user2);
    
      console.log("User2 Raffle2:", raffleAccount2_user2);
      assert.equal(raffleAccount2_user2.maxTickets, maxTickets2_user2);
      assert.equal(raffleAccount2_user2.ticketPrice, ticketPrice2_user2);
      assert.equal(raffleAccount2_user2.endWithDeadline, endWithDeadline2_user2);
      assert.equal(raffleAccount2_user2.deadline, deadline2_user2);
      assert.equal(raffleAccount2_user2.seller.toString(), wallet2.publicKey.toString());
    
      // User3 Raffle 2 => 150 tickets:

      const maxTickets2_user3 = 150;
      const ticketPrice2_user3 = 15;
      const endWithDeadline2_user3 = false;
      const deadline2_user3 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda2_user3 = await create_raffle(
        nftMint3_2,
        maxTickets2_user3,
        ticketPrice2_user3,
        endWithDeadline2_user3,
        deadline2_user3,
        wallet3,
        userPda3,
        signerTokenAccount3_2.address
      );
      const raffleAccount2_user3 = await program.account.raffle.fetch(rafflePda2_user3);
    
      console.log("User3 Raffle2:", raffleAccount2_user3);
      assert.equal(raffleAccount2_user3.maxTickets, maxTickets2_user3);
      assert.equal(raffleAccount2_user3.ticketPrice, ticketPrice2_user3);
      assert.equal(raffleAccount2_user3.endWithDeadline, endWithDeadline2_user3);
      assert.equal(raffleAccount2_user3.seller.toString(), wallet3.publicKey.toString());
    });
    
    it("Match test 1: Deadline is activated for raffle Test and max tickets are null", async () => {

        // Raffle activated with a 1 DAY deadline:

        const wallet1 = await create_wallet_with_sol_from_existing();
        const userPda1 = await init_User(wallet1);

        const nftMint1 = await create_nft_mint_and_account(wallet1);
        const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
        );
      
        const maxTickets = 0;
        const ticketPrice = 10;
        const endWithDeadline = true;
        const deadline = Math.floor(Date.now() / 1000) + 86400;
        const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
        );

        const raffleAccount = await program.account.raffle.fetch(rafflePda1);

        //console.log("Stored deadline in raffle account:", raffleAccount.deadline);
      
        assert.equal(raffleAccount.endWithDeadline, true, "end_with_deadline should be true");
        assert.equal(raffleAccount.deadline, deadline, "The deadline should be set correctly");
        assert.equal(raffleAccount.maxTickets, 0, "max_tickets should be 0 when end_with_deadline is true");
        assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true"); 
    });

    it("Match test 2:Deadline is not activated for raffle and max number's tickets is correct", async () => {

      // Raffle activated without deadline and 100 tickets:

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000); 

      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);

      //console.log("Stored deadline in raffle account:", raffleAccount.deadline);

      assert.equal(raffleAccount.endWithDeadline, false, "end_with_deadline should be false");
      assert.equal(raffleAccount.maxTickets, maxTickets, "The max_tickets should be set correctly");
      assert.equal(raffleAccount.deadline, 0, "deadline should be 0 when end_with_deadline is false");
      assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true");
    });

    it("Raffle is stil in Progress Test", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
    
      const rafflePda = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
      const raffleAccount = await program.account.raffle.fetch(rafflePda);
    
      //console.log("Raffle in progress:", raffleAccount.raffleInProgress);
  
      assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true");
    
    });

    it("Raffle count per user Test for one user", async () => {

      // User 1 account creation : counter check = 0

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const nftMint2 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint2,
          wallet1.publicKey
      );

      const userInfo1 = await program.account.user.fetch(userPda1);

      assert.ok(userPda1);
      assert.equal(userInfo1.raffleCount, 0, "user.raffle_count should be 0"); 
      assert.equal(userInfo1.winCount, 0, "user.win_count should be 0");
      //console.log("Initial raffle count:", userInfo1.raffleCount);

      // User 1 first raffle : counter check = 1

      const maxTickets1 = 100;
      const ticketPrice1 = 10;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets1,
          ticketPrice1,
          endWithDeadline1,
          deadline1,
          wallet1,
          userPda1,
          signerTokenAccount1.address
      );
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);

      assert.equal(raffleAccount1.maxTickets, maxTickets1);
      assert.equal(raffleAccount1.ticketPrice, ticketPrice1);
      assert.equal(raffleAccount1.endWithDeadline, endWithDeadline1);
      assert.equal(raffleAccount1.seller.toString(), wallet1.publicKey.toString());

      const userInfo2 = await program.account.user.fetch(userPda1);
      //console.log("Raffle count after first raffle:", userInfo2.raffleCount);
      assert.equal(userInfo2.raffleCount, 1, "user.raffle_count should be 1"); 

      // User 1 second raffle : counter check = 2

      const maxTickets2 = 25;
      const ticketPrice2 = 1;
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda2 = await create_raffle(
          nftMint2,
          maxTickets2,
          ticketPrice2,
          endWithDeadline2,
          deadline2,
          wallet1,
          userPda1,
          signerTokenAccount2.address
      );
      const raffleAccount2 = await program.account.raffle.fetch(rafflePda2);

      assert.equal(raffleAccount2.maxTickets, maxTickets2);
      assert.equal(raffleAccount2.ticketPrice, ticketPrice2);
      assert.equal(raffleAccount2.endWithDeadline, endWithDeadline2);
      assert.equal(raffleAccount2.seller.toString(), wallet1.publicKey.toString());

      const userInfo3 = await program.account.user.fetch(userPda1);
      console.log("Raffle count after second raffle:", userInfo3.raffleCount);
      assert.equal(userInfo3.raffleCount, 2, "user.raffle_count should be 2"); 
    });

    it("Raffle count per user Test for two different users", async () => {

      // User 1 account creation : counter check = 0

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
      
      const userInfo1_user1 = await program.account.user.fetch(userPda1);
      assert.ok(userPda1);
      assert.equal(userInfo1_user1.raffleCount, 0, "user1.raffle_count should be 0"); 
      assert.equal(userInfo1_user1.winCount, 0, "user1.win_count should be 0");
      //console.log("Initial raffle count for user 1:", userInfo1_user1.raffleCount);

      // User 2 account creation : counter check = 0

      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);
      const nftMint2 = await create_nft_mint_and_account(wallet2);
      const nftMint3 = await create_nft_mint_and_account(wallet2);

      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet2,
          nftMint2,
          wallet2.publicKey
      );

      const signerTokenAccount3 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet2,
          nftMint3,
          wallet2.publicKey
      );

      const userInfo1_user2 = await program.account.user.fetch(userPda2);
      assert.ok(userPda2);
      assert.equal(userInfo1_user2.raffleCount, 0, "user2.raffle_count should be 0"); 
      assert.equal(userInfo1_user2.winCount, 0, "user2.win_count should be 0");
      //console.log("Initial raffle count for user 2:", userInfo1_user2.raffleCount);

      // User 1 first raffle : counter check User 1 = 1

      const maxTickets1_user1 = 100;
      const ticketPrice1_user1 = 10;
      const endWithDeadline1_user1 = false;
      const deadline1_user1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user1 = await create_raffle(
          nftMint1,
          maxTickets1_user1,
          ticketPrice1_user1,
          endWithDeadline1_user1,
          deadline1_user1,
          wallet1,
          userPda1,
          signerTokenAccount1.address
      );
      const raffleAccount1_user1 = await program.account.raffle.fetch(rafflePda1_user1);

      assert.equal(raffleAccount1_user1.maxTickets, maxTickets1_user1);
      assert.equal(raffleAccount1_user1.ticketPrice, ticketPrice1_user1);
      assert.equal(raffleAccount1_user1.endWithDeadline, endWithDeadline1_user1);
      assert.equal(raffleAccount1_user1.seller.toString(), wallet1.publicKey.toString());

      const userInfo2_user1 = await program.account.user.fetch(userPda1);
      //console.log("Raffle count after first raffle for user 1:", userInfo2_user1.raffleCount);
      assert.equal(userInfo2_user1.raffleCount, 1, "user1.raffle_count should be 1"); 

      // User 2 firt raffle : counter check User 2 = 1

      const maxTickets1_user2 = 25;
      const ticketPrice1_user2 = 1;
      const endWithDeadline1_user2 = false;
      const deadline1_user2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user2 = await create_raffle(
          nftMint2,
          maxTickets1_user2,
          ticketPrice1_user2,
          endWithDeadline1_user2,
          deadline1_user2,
          wallet2,
          userPda2,
          signerTokenAccount2.address
      );
      const raffleAccount1_user2 = await program.account.raffle.fetch(rafflePda1_user2);

      assert.equal(raffleAccount1_user2.maxTickets, maxTickets1_user2);
      assert.equal(raffleAccount1_user2.ticketPrice, ticketPrice1_user2);
      assert.equal(raffleAccount1_user2.endWithDeadline, endWithDeadline1_user2);
      assert.equal(raffleAccount1_user2.seller.toString(), wallet2.publicKey.toString());

      const userInfo2_user2 = await program.account.user.fetch(userPda2);
      //console.log("Raffle count after first raffle for user 2:", userInfo2_user2.raffleCount);
      assert.equal(userInfo2_user2.raffleCount, 1, "user.raffle_count should be 1"); 

      // User 2 second raffle : counter check User 2 = 2

      const maxTickets2_user2 = 250;
      const ticketPrice2_user2 = 15;
      const endWithDeadline2_user2 = false;
      const deadline2_user2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda2_user2 = await create_raffle(
          nftMint3,
          maxTickets2_user2,
          ticketPrice2_user2,
          endWithDeadline2_user2,
          deadline2_user2,
          wallet2,
          userPda2,
          signerTokenAccount3.address
      );
      const raffleAccount2_user2 = await program.account.raffle.fetch(rafflePda2_user2);

      assert.equal(raffleAccount2_user2.maxTickets, maxTickets2_user2);
      assert.equal(raffleAccount2_user2.ticketPrice, ticketPrice2_user2);
      assert.equal(raffleAccount2_user2.endWithDeadline, endWithDeadline2_user2);
      assert.equal(raffleAccount2_user2.seller.toString(), wallet2.publicKey.toString());

      const userInfo3_user2 = await program.account.user.fetch(userPda2);
      //console.log("Raffle count after second raffle for user 2:", userInfo3_user2.raffleCount);
      assert.equal(userInfo3_user2.raffleCount, 2, "user.raffle_count should be 2"); 

      // User 1 check without additionnal raffle : counter check User 1 = 1

      const userInfo3_user1 = await program.account.user.fetch(userPda1);
      //console.log("Raffle count after first raffle for user 1:", userInfo3_user1.raffleCount);
      assert.equal(userInfo3_user1.raffleCount, 1, "user1.raffle_count should be 1"); 
    });

    
    //// BUY FUNCTION TESTS ////


    it("Buy function test", async () => {
      
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      try {
        await buy(wallet2, rafflePda1, userPda2, 0);      
      } catch (error) {
        console.error("Erreur lors de l'achat:", error);
        assert.fail("L'achat du ticket a échoué");
      }
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, 1, "Ticket Count should be 1");
    });

    it("Seller for a raffle can't be buyer for the same raffle Test", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );

      try {
        await buy(wallet1, rafflePda1, userPda1, 1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
          //console.log('Caught error:', error);
          //console.log('Error message:', error.message);
          //console.log('Error stack:', error.stack);
        assert.include(error.message, 'ConstraintSeeds.', "A seeds constraint was violated.");
      }
    });

    it("User cannot buy a ticket after the deadline has passed", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);
    
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
      
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
    
      // User 1 create a raffle with deadline:

      const maxTickets = 0;
      const ticketPrice = 1;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
     //console.log("Raffle created with deadline:", deadline);
      
      // User 2 buys a ticket before the deadline ends:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
       // console.log("User 2 bought a ticket before the deadline.");
      } catch (error) {
        console.error("Error", error);
        assert.fail("Buy before deadline failed");
      }
    
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle account after first purchase:", raffleAccount);
      assert.equal(raffleAccount.ticketsCount, 1, "Ticket Check 1 should be 1");
    
      // Wait for the deadline to pass simulation:

      await new Promise(resolve => setTimeout(resolve, 7000)); 
    
      // User 3 can't buy a ticket after the deadline has passed:

      try {
        await buy(wallet3, rafflePda1, userPda3, 1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        //console.log('Caught error:', error);
        assert.include(error.message, 'RaffleEnded', "Expected error message for raffle ended");
      }
    
      const raffleAccount2 = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle account after attempting purchase post-deadline:", raffleAccount2);
      assert.equal(raffleAccount2.ticketsCount, 1, "Ticket Check 2 should be 1");
    });

    it("User can't buy a ticket if all tickets are sold (raffle without deadline)", async () => {

      // 4 users can register and create their own PDA:

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
      
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
    
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);

      // Create a raffle with 2 tickets from user 1 :
    
      const maxTickets = 2;  
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;  
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // User 2 buys the first tickets:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Error", error);
        assert.fail("First ticket purchase failed");
      }
    
      // User 3 buys the last tickets:

      try {
        await buy(wallet3, rafflePda1, userPda3, 1);
      } catch (error) {
        console.error("Error", error);
        assert.fail("Second ticket purchase failed");
      }
    
      // User 4 should not be able to buy a ticket because all tickets are sold:

      try {
        await buy(wallet4, rafflePda1, userPda4, 2);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.include(error.message, 'AllTicketsSelling', "All the tickets have been sold");
      }
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, maxTickets, "Ticket Count should be equal to maxTickets");

    });
    
    it("A buyer can buy multiple tickets in a single raffle until max tickets are sold", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
      
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);

      // Create a raffle with max tickets from user 1 :
    
      const maxTickets = 2;  
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;  
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // User 2 can buy 2 tickets in the same raffle:
      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Error", error);
        assert.fail("First ticket purchase failed");
      }
    
      try {
        await buy(wallet2, rafflePda1, userPda2, 1);
      } catch (error) {
        console.error("Error", error);
        assert.fail("Second ticket purchase failed");
      }
    
      // Third buy should fail because all tickets are sold
      try {
        await buy(wallet2, rafflePda1, userPda2, 2);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.include(error.message, 'AllTicketsSelling', "All the tickets have been sold");
      }
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, maxTickets, "Ticket Count should be equal to maxTickets");

    });
    
    it("Ticket counter works correctly over multiple ticket purchases", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const wallet2 = await create_wallet_with_sol_from_existing(); 
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // User 2 buys the 1st ticket

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
        const raffleAccount = await program.account.raffle.fetch(rafflePda1);
        assert.equal(raffleAccount.ticketsCount, 1, "Ticket Count should be 1 after the first purchase");
      } catch (error) {
        console.error("Erreur lors de l'achat du premier ticket:", error);
        assert.fail("L'achat du premier ticket a échoué");
      }
    
      // User 3 buys the 2nd ticket:

      try {
        await buy(wallet3, rafflePda1, userPda3, 1);
        const raffleAccount = await program.account.raffle.fetch(rafflePda1);
        assert.equal(raffleAccount.ticketsCount, 2, "Ticket Count should be 2 after the second purchase");
      } catch (error) {
        console.error("Erreur lors de l'achat du deuxième ticket:", error);
        assert.fail("L'achat du deuxième ticket a échoué");
      }
    
      // User 4 buys the 3rd ticket:

      try {
        await buy(wallet4, rafflePda1, userPda4, 2);
        const raffleAccount = await program.account.raffle.fetch(rafflePda1);
        assert.equal(raffleAccount.ticketsCount, 3, "Ticket Count should be 3 after the third purchase");
      } catch (error) {
        console.error("Erreur lors de l'achat du troisième ticket:", error);
        assert.fail("L'achat du troisième ticket a échoué");
      }
    
      // Final ticket_count's check:

      const finalRaffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(finalRaffleAccount.ticketsCount, 3, "Ticket Count should match the number of tickets purchased");
    });
    
    it("Buyer transfers the ticket price in SOL to the raffle account", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);
    
      // User 1 create a raffle with 10 tickets and a ticket price of 1 SOL:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL; 
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // Get initial balances:

      const initialBuyerBalance = await program.provider.connection.getBalance(wallet2.publicKey);
      const initialRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
    
      // User 2 buy a ticket:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Error during ticket purchase:", error);
        assert.fail("Ticket purchase failed");
      }
    
      // Get final balances:

      const finalBuyerBalance = await program.provider.connection.getBalance(wallet2.publicKey);
      const finalRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
    
      // Verify the balances with tolerance for transaction fees

      const tolerance = 1_200_000; 
    
      assert.closeTo(
        finalBuyerBalance,
        initialBuyerBalance - ticketPrice,
        tolerance,
        "Buyer's balance should decrease by the ticket price within tolerance"
      );
    
      assert.closeTo(
        finalRaffleBalance,
        initialRaffleBalance + ticketPrice,
        tolerance,
        "Raffle's balance should increase by the ticket price within tolerance"
      );
    });

    it("Buyer transfers the ticket price in SOL to the raffle account / with balance logs", async () => {
     
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      const wallet2 = await create_wallet_with_sol_from_existing(); 
      const userPda2 = await init_User(wallet2);
    
      // User 1 create a raffle with 10 tickets and a ticket price of 1 SOL:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL; 
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // Get initial balances

      const initialBuyerBalance = await program.provider.connection.getBalance(wallet2.publicKey);
      const initialRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
    
      //console.log("Initial Buyer Balance:", initialBuyerBalance / LAMPORTS_PER_SOL, "SOL");
      //console.log("Initial Raffle Balance:", initialRaffleBalance / LAMPORTS_PER_SOL, "SOL");
    
      // User 2 buy a ticket:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Error during ticket purchase:", error);
        assert.fail("Ticket purchase failed");
      }
    
      // Get final balances

      const finalBuyerBalance = await program.provider.connection.getBalance(wallet2.publicKey);
      const finalRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
    
      //console.log("Final Buyer Balance:", finalBuyerBalance / LAMPORTS_PER_SOL, "SOL");
     // console.log("Final Raffle Balance:", finalRaffleBalance / LAMPORTS_PER_SOL, "SOL");
    
      // Verify the balances with tolerance for transaction fees (0.0012 SOL / 0.21$ / 1 SOL +/- 180$)

      const tolerance = 1_200_000; 
    
      assert.closeTo(
        finalBuyerBalance,
        initialBuyerBalance - ticketPrice,
        tolerance,
        "Buyer's balance should decrease by the ticket price within tolerance"
      );
    
      assert.closeTo(
        finalRaffleBalance,
        initialRaffleBalance + ticketPrice,
        tolerance,
        "Raffle's balance should increase by the ticket price within tolerance"
      );
    });

    it("Raffles transfer and balance checks with multiple raffles", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const wallet5 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const nftMint2 = await create_nft_mint_and_account(wallet2);
    
      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet2,
        nftMint2,
        wallet2.publicKey
      );
    
      // User 1 create a raffle:

      const maxTickets1 = 10;
      const ticketPrice1 = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets1,
        ticketPrice1,
        endWithDeadline1,
        deadline1,
        wallet1,
        userPda1,
        signerTokenAccount1.address
      );
    
      // User 2 create a raffle:

      const maxTickets2 = 15;
      const ticketPrice2 = 0.5 * LAMPORTS_PER_SOL;
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda2 = await create_raffle(
        nftMint2,
        maxTickets2,
        ticketPrice2,
        endWithDeadline2,
        deadline2,
        wallet2,
        userPda2,
        signerTokenAccount2.address
      );
    
      // Get initial balances:

      const initialRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const initialRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      //console.log("Initial Raffle 1 Balance (in SOL):", initialRaffleBalance1 / LAMPORTS_PER_SOL);
      //console.log("Initial Raffle 2 Balance (in SOL):", initialRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // User 3 buys a ticket for raffle 1, user 4 buys a ticket for raffle 2, and user 5 buys a ticket for raffle 2:

      try {
        await buy(wallet3, rafflePda1, userPda3, 0);
        await buy(wallet4, rafflePda2, userPda4, 0);
        await buy(wallet5, rafflePda2, userPda5, 1);
      } catch (error) {
        console.error("Error during ticket purchase:", error);
        assert.fail("Ticket purchase failed");
      }
    
      // Get final balances:

      const finalRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const finalRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      //console.log("Final Raffle 1 Balance (in SOL):", finalRaffleBalance1 / LAMPORTS_PER_SOL);
      //console.log("Final Raffle 2 Balance (in SOL):", finalRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // Verify the balances with tolerance for transaction fees:

      const tolerance = 1_200_000;
    
      assert.closeTo(
        finalRaffleBalance1,
        initialRaffleBalance1 + ticketPrice1,
        tolerance,
        "Raffle 1's balance should increase by the ticket price within tolerance"
      );
    
      assert.closeTo(
        finalRaffleBalance2,
        initialRaffleBalance2 + 2 * ticketPrice2,
        tolerance,
        "Raffle 2's balance should increase by the ticket price within tolerance"
      );
    
      // Ticket count checks:

      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      const raffleAccount2 = await program.account.raffle.fetch(rafflePda2);
      //console.log("Raffle 1 Account after purchases:", raffleAccount1);
      //console.log("Raffle 2 Account after purchases:", raffleAccount2);
    
      assert.equal(
        raffleAccount1.ticketsCount,
        1,
        "The ticket count for raffle 1 should be incremented by 1"
      );
    
      assert.equal(
        raffleAccount2.ticketsCount,
        2,
        "The ticket count for raffle 2 should be incremented by 2"
      );
    });
    
    it("2 Raffles transfer and balance checks with multiple raffles", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const wallet5 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const nftMint2 = await create_nft_mint_and_account(wallet2);
    
      const signerTokenAccount1 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      const signerTokenAccount2 = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet2,
        nftMint2,
        wallet2.publicKey
      );
    
      // User 1 creates raffle 1 with 10 tickets and a ticket price of 1 SOL:

      const maxTickets1 = 10;
      const ticketPrice1 = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets1,
        ticketPrice1,
        endWithDeadline1,
        deadline1,
        wallet1,
        userPda1,
        signerTokenAccount1.address
      );
    
      // User 2 creates raffle 2 with 15 tickets and a ticket price of 0.5 SOL:

      const maxTickets2 = 15;
      const ticketPrice2 = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda2 = await create_raffle(
        nftMint2,
        maxTickets2,
        ticketPrice2,
        endWithDeadline2,
        deadline2,
        wallet2,
        userPda2,
        signerTokenAccount2.address
      );
    
      // Get initial balances:

      const initialRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const initialRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      //console.log("Initial Raffle 1 Balance:", initialRaffleBalance1 / LAMPORTS_PER_SOL);
      //console.log("Initial Raffle 2 Balance:", initialRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // User 3 buys a ticket for raffle 1, user 4 buys a ticket for raffle 2, and user 5 buys 2 tickets for raffle 2:

      try {
        await buy(wallet3, rafflePda1, userPda3, 0);
        await buy(wallet4, rafflePda2, userPda4, 0);
        await buy(wallet5, rafflePda2, userPda5, 1);
      } catch (error) {
        console.error("Error during ticket purchase:", error);
        assert.fail("Ticket purchase failed");
      }
    
      // Get final balances:

      const finalRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const finalRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      //console.log("Final Raffle 1 Balance:", finalRaffleBalance1 / LAMPORTS_PER_SOL);
      //console.log("Final Raffle 2 Balance:", finalRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // Verify the balances with tolerance for transaction fees:

      const tolerance = 1_200_000;
    
      assert.closeTo(
        finalRaffleBalance1,
        initialRaffleBalance1 + ticketPrice1,
        tolerance,
        "Raffle 1's balance should increase by the ticket price within tolerance"
      );
    
      assert.closeTo(
        finalRaffleBalance2,
        initialRaffleBalance2 + (2 * ticketPrice2),
        tolerance,
        "Raffle 2's balance should increase by the ticket price within tolerance"
      );
    
      // Ticket count checks:

      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      const raffleAccount2 = await program.account.raffle.fetch(rafflePda2);
      //console.log("Raffle 1 Account after purchases:", raffleAccount1);
      //console.log("Raffle 2 Account after purchases:", raffleAccount2);
    
      assert.equal(
        raffleAccount1.ticketsCount,
        1,
        "The ticket count for raffle 1 should be incremented by 1"
      );
    
      assert.equal(
        raffleAccount2.ticketsCount,
        2,
        "The ticket count for raffle 2 should be incremented by 2"
      );
    });

    it("Two users can't buy the same ticket", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);
    
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("First buy failed:", error);
        assert.fail("First buy should succeed");
      }
    
      // User 2 should not be able to buy the same ticket:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
        assert.fail("Error");
      } catch (error) {
        assert.include(error.message, 'Error', "Second buy should fail");
      }
    
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.ticketsCount, 1, "Ticket count should be 1 after the first buy");
    });
  
    it('Verify signatures and accounts', async () => {
   
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const nftMint = await create_nft_mint_and_account(wallet1);

      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint,
        wallet1.publicKey
      );

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const rafflePda = await create_raffle(
        nftMint,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );

      const initialBuyerBalance = await provider.connection.getBalance(wallet2.publicKey);
      const initialRaffleBalance = await provider.connection.getBalance(rafflePda);

      try {
        await buy(wallet2, rafflePda, userPda2, 0);
      } catch (error) {
        console.error("Error:", error);
        assert.fail("Ticket purchase failed");
      }

      const finalBuyerBalance = await provider.connection.getBalance(wallet2.publicKey);
      const finalRaffleBalance = await provider.connection.getBalance(rafflePda);

      const tolerance = 1_200_000;

    
      assert.closeTo(
        finalBuyerBalance,
        initialBuyerBalance - ticketPrice,
        tolerance,
        "Buyer's balance should decrease by the ticket price within tolerance"
      );

      assert.closeTo(
        finalRaffleBalance,
        initialRaffleBalance + ticketPrice,
        tolerance,
        "Raffle's balance should increase by the ticket price within tolerance"
      );

      // Incorrect signature test:

      try {
        const fakeWallet = await create_wallet_with_sol_from_existing();
        await buy(fakeWallet, rafflePda, userPda2, 1);
        assert.fail("Signature verification failed");
      } catch (error) {
        assert.include(error.message, 'Signature verification failed', "Signature verification failed");
      }
    });

    it("2 Users can't purchase the same ticket at the same time", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const nftMint1 = await create_nft_mint_and_account(wallet1);
    
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
    
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
    
      const maxTickets = 3;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      // Users 2 and 3 buy tickets first:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
    
      // Simultaneous attempt to buy a ticket:

      const buyPromises = [
        buy(wallet4, rafflePda1, userPda4, 2),
        buy(wallet3, rafflePda1, userPda3, 2)
      ];
    
      // Wait for both transactions to finish:

      const results = await Promise.allSettled(buyPromises);
    
      // Logs:

      /*results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`Transaction ${index + 1} succeeded`);
        } else {
          console.log(`Transaction ${index + 1} failed:`, result.reason);
        }
      });*/
    
      // Check:

      const fulfilledCount = results.filter(r => r.status === "fulfilled").length;
      const rejectedCount = results.filter(r => r.status === "rejected").length;
    
      assert.equal(fulfilledCount, 1, "Only one transaction should succeed");
      assert.equal(rejectedCount, 1, "One transaction should fail");
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, maxTickets, "Ticket Count should be equal to maxTickets");
    });
  

    /// DRAW FUNCTION TESTS ///


    it("In progress raffle check", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      // User 1 creates a raffle with deadline:

      const maxTickets = 0;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5;
    
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      await new Promise(resolve => setTimeout(resolve, 7000));
    
      try {
        await draw(wallet1, rafflePda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.error('Caught error:', error);
        //console.log('Error message:', error.message);
        assert.include(error.message, 'Expected an error to be thrown.', "Draw conditions not met");
      }
    });

    it("RaffleNotEnded check on a raffle with deadline", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      // Create a raffle with a deadline:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 10;
    
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      const raffleAccountBeforeDraw = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle state before draw:", raffleAccountBeforeDraw);
    
      try {
        await draw(wallet1, rafflePda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.error('Caught error:', error);
        //console.log('Error message:', error.message);
        assert.include(error.message, 'RaffleNotEnded', "An unexpected error was thrown.");
      }
    
      // Check that the raffle is still in progress after the failed draw attempt
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle state after draw attempt:", raffleAccount);
      assert.equal(raffleAccount.raffleInProgress, true, "Raffle should still be in progress");
    });

    it("RaffleNotEnded error test in draw function with max tickets condition", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      // Create a raffle with a max ticket condition:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
    
      const raffleAccountBeforeDraw = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle state before draw:", raffleAccountBeforeDraw);
    
      // Try to call draw before the raffle has ended:

      try {
        await draw(wallet1, rafflePda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.error('Caught error:', error);
        //console.log('Error message:', error.message);
        assert.include(error.message, 'RaffleNotEnded', "An unexpected error was thrown.");
      }
    
      // Check that the raffle is still in progress:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      //console.log("Raffle state after draw attempt:", raffleAccount);
      assert.equal(raffleAccount.raffleInProgress, true, "Raffle should still be in progress");
    });

    it("Draw function test with max tickets option", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const wallet5 = await create_wallet_with_sol_from_existing();
      const wallet6 = await create_wallet_with_sol_from_existing();
      const wallet7 = await create_wallet_with_sol_from_existing();
      
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
      const userPda6 = await init_User(wallet6);
      const userPda7 = await init_User(wallet7);
  
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      // User 1 creates a raffle with 6 tickets:

      const maxTickets = 6;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
  
      // Users 2 to 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      await buy(wallet4, rafflePda1, userPda4, 2);
      await buy(wallet5, rafflePda1, userPda5, 3);
      await buy(wallet6, rafflePda1, userPda6, 4);
      await buy(wallet7, rafflePda1, userPda7, 5);
  
      // Draw function call to determine the winner:

      try {
          await draw(wallet1, rafflePda1);
      } catch (error) {
          console.error("Error during draw:", error);
          assert.fail("Draw failed");
      }
  
      // Check that the raffle is marked as ended and a winner is set:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.isAtLeast(raffleAccount.winningTicket, 0, "Winning ticket should be set");
  
      // Log the winner's information:

      //console.log("Raffle is no longer in progress.");
      //console.log("Winning ticket:", raffleAccount.winningTicket);
  
      // Determine the winner:

      const winningTicket = raffleAccount.winningTicket;
      let winnerWallet;
      switch (winningTicket) {
          case 0:
              winnerWallet = wallet2.publicKey.toString();
              break;
          case 1:
              winnerWallet = wallet3.publicKey.toString();
              break;
          case 2:
              winnerWallet = wallet4.publicKey.toString();
              break;
          case 3:
              winnerWallet = wallet5.publicKey.toString();
              break;
          case 4:
              winnerWallet = wallet6.publicKey.toString();
              break;
          case 5:
              winnerWallet = wallet7.publicKey.toString();
              break;
          default:
              winnerWallet = "No winner";
              break;
      }
      console.log("Winner's wallet:", winnerWallet);
    });

    it("Draw function test with deadline option", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
  
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      // User 1 creates a raffle with a deadline:

      const maxTickets = 0;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5;
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
  
      // User 2 buys a ticket:
      
      await buy(wallet2, rafflePda1, userPda2, 0);
  
      // Wait for the deadline to pass:

      await new Promise(resolve => setTimeout(resolve, 7000));
  
      // Call the draw function to determine the winner:

      try {
          await draw(wallet1, rafflePda1);
      } catch (error) {
          console.error("Error during draw:", error);
          assert.fail("Draw failed");
      }
  
      // Check that the raffle is marked as ended and a winner is set:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.isAtLeast(raffleAccount.winningTicket, 0, "Winning ticket should be set");
  
      // Log the winner's information:

      //console.log("Raffle is no longer in progress.");
      //console.log("Winning ticket:", raffleAccount.winningTicket);
    });
  
    it("Draw function test with 7 users and Max ticket option + raffle end check", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const wallet5 = await create_wallet_with_sol_from_existing();
      const wallet6 = await create_wallet_with_sol_from_existing();
      const wallet7 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
      const userPda6 = await init_User(wallet6);
      const userPda7 = await init_User(wallet7);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      // User 1 create a raffle with 6 tickets:

      const maxTickets = 6;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );
    
      // Users 2 to 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      await buy(wallet4, rafflePda1, userPda4, 2);
      await buy(wallet5, rafflePda1, userPda5, 3);
      await buy(wallet6, rafflePda1, userPda6, 4);
      await buy(wallet7, rafflePda1, userPda7, 5);
    
      // Draw function call to determine the winner:

      try {
        await draw(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }
    
      // Check that the raffle is marked as ended:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.isAtLeast(raffleAccount.winningTicket, 0, "Winning ticket should be set");
    });

    it("Draw function test with 7 users and deadline option + raffle end check", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const wallet5 = await create_wallet_with_sol_from_existing();
      const wallet6 = await create_wallet_with_sol_from_existing();
      const wallet7 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
      const userPda6 = await init_User(wallet6);
      const userPda7 = await init_User(wallet7);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
      );
    
      const maxTickets = 0; 
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
      const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
      );
    
      // Users 2 to 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      await buy(wallet4, rafflePda1, userPda4, 2);
      await buy(wallet5, rafflePda1, userPda5, 3);
      await buy(wallet6, rafflePda1, userPda6, 4);
      await buy(wallet7, rafflePda1, userPda7, 5);
    
      await new Promise(resolve => setTimeout(resolve, 7000)); 
    
      // Draw function call to determine the winner:

      try {
        await draw(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }
    
      // Check that the raffle is marked as ended:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.isAtLeast(raffleAccount.winningTicket, 0, "Winning ticket should be set");
    
      // Log the winner's information
      //console.log("Raffle is no longer in progress.");
      //console.log("Winning ticket:", raffleAccount.winningTicket);
    
      // Determine the winner
      /*const winningTicket = raffleAccount.winningTicket;
      let winnerWallet;
      switch (winningTicket) {
        case 0:
          winnerWallet = wallet2.publicKey.toString();
          break;
        case 1:
          winnerWallet = wallet3.publicKey.toString();
          break;
        case 2:
          winnerWallet = wallet4.publicKey.toString();
          break;
        case 3:
          winnerWallet = wallet5.publicKey.toString();
          break;
        case 4:
          winnerWallet = wallet6.publicKey.toString();
          break;
        case 5:
          winnerWallet = wallet7.publicKey.toString();
          break;
        default:
          winnerWallet = "No winner";
          break;
      }
      console.log("Winner's wallet:", winnerWallet);*/
    });

    it("Draw function sets winning_ticket to -1 if no tickets are sold (with deadline)", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
  
      // Create a raffle with a deadline:

      const maxTickets = 0; 
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
  
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
  
      // Wait for the deadline to pass:

      await new Promise(resolve => setTimeout(resolve, 10000)); 
  
      // Draw function call to determine the winner:

      try {
          await draw(wallet1, rafflePda1);
      } catch (error) {
          console.error("Error during draw:", error);
          assert.fail("Draw failed");
      }
  
      // Check that the raffle is marked as ended and the winning ticket is set to -1:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.winningTicket, -1, "Winning ticket should be set to -1 after the deadline has passed");
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
    });

    
    // WITHDRAW_SOL FUNCTION TESTS // 


    it("Withdraw_sol test and balances checks", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
  
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      // Raffle with deadline option:

      const maxTickets = 0;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
  
      await new Promise(resolve => setTimeout(resolve, 10000));
    
      // Seller and rafflePDA initial balances:

      const initialRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
      const initialSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
    
      console.log("Initial rafflePDA balance:", initialRaffleBalance);
      console.log("Initial seller balance:", initialSellerBalance);
    
      try {
        await draw(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }
    
      // Seller and rafflePDA balances:

      const preWithdrawRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
      const preWithdrawSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
    
      console.log("Pre-withdraw rafflePDA balance:", preWithdrawRaffleBalance);
      console.log("Pre-withdraw seller balance:", preWithdrawSellerBalance);
    
      try {
        await withdraw_sol(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during withdraw:", error);
        assert.fail("Withdraw failed");
      }
    
      // Seller and rafflePDA final balances:

      const finalRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
      const finalSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
    
      console.log("Final rafflePDA balance:", finalRaffleBalance);
      console.log("Final seller balance:", finalSellerBalance);

      const tolerance = 2_000_000;;
    
      // Balances checks:

      assert.closeTo(finalRaffleBalance, 0, tolerance, "Raffle balance should be 0 after withdrawal within tolerance");
      assert.closeTo(finalSellerBalance, initialSellerBalance + ticketPrice, tolerance, "Seller balance should increase by the ticket price within tolerance");
      assert.equal(preWithdrawSellerBalance, initialSellerBalance, "Seller balance should not change before withdrawal");

      // Raffle account check:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle account after withdrawal:", raffleAccount);
      assert.equal(raffleAccount.ticketsCount, 1, "Ticket count should be 1");
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
    });    

    it("Seller can withdraw SOL after the raffle is finished with max tickets option", async () => {

    const wallet1 = await create_wallet_with_sol_from_existing();
    const wallet2 = await create_wallet_with_sol_from_existing();
    const wallet3 = await create_wallet_with_sol_from_existing();
    const wallet4 = await create_wallet_with_sol_from_existing();
    const wallet5 = await create_wallet_with_sol_from_existing();
    const wallet6 = await create_wallet_with_sol_from_existing();
    const wallet7 = await create_wallet_with_sol_from_existing();
    const userPda1 = await init_User(wallet1);
    const userPda2 = await init_User(wallet2);
    const userPda3 = await init_User(wallet3);
    const userPda4 = await init_User(wallet4);
    const userPda5 = await init_User(wallet5);
    const userPda6 = await init_User(wallet6);
    const userPda7 = await init_User(wallet7);

    const nftMint1 = await create_nft_mint_and_account(wallet1);
    const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet1,
        nftMint1,
        wallet1.publicKey
    );
  
    // raffle with max tickets option:

    const maxTickets = 7; 
    const ticketPrice = 1 * LAMPORTS_PER_SOL;
    const endWithDeadline = false; 
    const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
    const rafflePda1 = await create_raffle(
        nftMint1,
        maxTickets,
        ticketPrice,
        endWithDeadline,
        deadline,
        wallet1,
        userPda1,
        signerTokenAccount.address
    );
  
    await buy(wallet2, rafflePda1, userPda2, 0);
    await buy(wallet3, rafflePda1, userPda3, 1);
    await buy(wallet4, rafflePda1, userPda4, 2);
    await buy(wallet5, rafflePda1, userPda5, 3);
    await buy(wallet6, rafflePda1, userPda6, 4);
    await buy(wallet7, rafflePda1, userPda7, 5);
    await buy(wallet2, rafflePda1, userPda2, 6); 
    
    await draw(wallet1, rafflePda1);
  
    // Initial seller balance:

    const initialSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
  
    // Withdraw SOL after the raffle is finished:

    try {
        await withdraw_sol(wallet1, rafflePda1);
    } catch (error) {
        console.error("Error during withdraw:", error);
        assert.fail("Withdraw failed");
    }
  
    // Final seller balance:

    const finalSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
    const raffleAccount = await program.account.raffle.fetch(rafflePda1);
    //console.log("Raffle account after withdrawal:", raffleAccount);
  
    // Checks:

    assert.equal(raffleAccount.ticketsCount, 7, "Ticket count should be 7");
    assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
    assert.equal(finalSellerBalance, initialSellerBalance + (7 * ticketPrice), "Seller balance should increase by the total ticket price");
    });

    it("Seller can withdraw SOL after the raffle is finished with deadline option", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      // Raffle with deadline option:

      const maxTickets = 0;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5;
    
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      await new Promise(resolve => setTimeout(resolve, 10000));
  
      try {
        await draw(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }

      const initialSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
    
      try {
        await withdraw_sol(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during withdraw:", error);
        assert.fail("Withdraw failed");
      }

      const finalSellerBalance = await program.provider.connection.getBalance(wallet1.publicKey);
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle account after withdrawal:", raffleAccount);
    
      assert.equal(raffleAccount.ticketsCount, 1, "Ticket count should be 1");
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.equal(finalSellerBalance, initialSellerBalance + ticketPrice, "Seller balance should increase by the ticket price");
    });

    it("Only the seller can withdraw SOL from the raffle", async () => {
      const wallet1 = await create_wallet_with_sol_from_existing(); 
      const wallet2 = await create_wallet_with_sol_from_existing(); 
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );

      // User 1 creates a raffle:
    
      const maxTickets = 1;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      await draw(wallet1, rafflePda1);
    
      try {
        await withdraw_sol(wallet2, rafflePda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.error('Caught error:', error);
        assert.include(error.message, 'NotTheSeller', "You're not the creator of this raffle");
      }
    });

    it("Seller cannot withdraw SOL from the raffle if it is still in progress", async () => {

      const wallet1 = await create_wallet_with_sol_from_existing(); 
      const wallet2 = await create_wallet_with_sol_from_existing(); 
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const nftMint1 = await create_nft_mint_and_account(wallet1);
      const signerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          wallet1,
          nftMint1,
          wallet1.publicKey
      );
    
      // User 1 creates a raffle:

      const maxTickets = 2;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(
          nftMint1,
          maxTickets,
          ticketPrice,
          endWithDeadline,
          deadline,
          wallet1,
          userPda1,
          signerTokenAccount.address
      );
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      try {
        await withdraw_sol(wallet1, rafflePda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.error('Caught error:', error);
        assert.include(error.message, 'RaffleNotFinished', "This raffle isn't finished");
      }
    });
    
    
    // WITHDRAW_NFT FUNCTION TESTS //


    it("NFT transfert to winner", async () => {});

    it("Raffle PDA balance test after transfert SOL to seller", async () => {});

    it("Seller balace after tarnsfert?", async () => {});
    
    it("Raffle win count Test", async () => {});
    
});




