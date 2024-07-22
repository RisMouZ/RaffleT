
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RaffleT } from "../target/types/raffle_t";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { assert } from "chai";
import { BN } from 'bn.js';
import { xit } from "mocha";

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
        const airdropAmount = 2.5 * LAMPORTS_PER_SOL;
      
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

    let raffleCount = 0; // UTILE?

    async function create_raffle(
        max_tickets: number,
        ticket_price: number,
        end_with_deadline: boolean,
        deadline: number,
        user: Keypair,
        userPda: PublicKey
      ): Promise<PublicKey> {
          const userAccount = await program.account.user.fetch(userPda);
          const raffleCount = new BN(userAccount.raffleCount);

          const [rafflePda] = PublicKey.findProgramAddressSync(
              [raffleCount.toArrayLike(Buffer, 'le', 4), user.publicKey.toBuffer()],
              program.programId
          );

        await program.methods.createRaffle(
            max_tickets,
            ticket_price,
            end_with_deadline,
            deadline)
              .accounts({
                user: userPda,
                raffle: rafflePda,
                signer: user.publicKey,
                systemProgram: SystemProgram.programId
              })
              .signers([user])
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
    

    let wallet1: Keypair, wallet2: Keypair, wallet3: Keypair; wallet4: Keypair; 
    wallet5: Keypair;wallet6: Keypair;wallet7: Keypair;wallet8: Keypair;wallet9: Keypair;wallet10: Keypair;
    let userPda1: PublicKey, userPda2: PublicKey, userPda3: PublicKey;
    let rafflePda1: PublicKey, rafflePda2: PublicKey, rafflePda3: PublicKey;
    let buyerPda1: PublicKey, buyerPda2: PublicKey, buyerPda3: PublicKey;


    it("Get wallet balance after airdrop / localhost", async () => {

        wallet1 = await create_wallet_with_sol_from_existing();
        //wallet1 = await create_wallet_with_sol();
        assert.ok(wallet1);
        
        const balance = await provider.connection.getBalance(wallet1.publicKey);
        console.log("Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");

        assert.ok(balance >= 0.01 * LAMPORTS_PER_SOL, "Wallet should have at least 0.01 SOL");

    });

    it("Get wallet balance after airdrop from SOLANA Keypair CWSOL", async () => {

      wallet1 = await create_wallet_with_sol_from_existing();
      //wallet1 = await create_wallet_with_sol();
      assert.ok(wallet1);
      
      const balance = await provider.connection.getBalance(wallet1.publicKey);
      console.log("Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL");

      assert.ok(balance >= 0.01 * LAMPORTS_PER_SOL, "Wallet should have at least 0.01 SOL");

    });


    /// INIT USER FUNCTION TESTS ///


    it("Account + user_PDA check /// MODIF ADSOL", async () => {

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();

      userPda1 = await init_User(wallet1);

      assert.ok(userPda1);
      
    });

    it("Create 3 userPDA with different wallets", async () => {

        //wallet1 = await create_wallet_with_sol();
        //wallet2 = await create_wallet_with_sol();
        //wallet3 = await create_wallet_with_sol();

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

      //wallet1 = await create_wallet_with_sol();
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

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();

      userPda1 = await init_User(wallet1);

      const userInfo1 = await program.account.user.fetch(userPda1);

      assert.ok(userPda1);

      assert.equal(userInfo1.raffleCount, 0, "user.raffle_count should be initialized to 0");

      assert.equal(userInfo1.winCount, 0, "user.win_count should be initialized to 0");

    });
    
    it("Counters and PDA checks after multiple accounts creation", async () => {

      // 3 different wallets can create an account on the platform:

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();
      //wallet2 = await create_wallet_with_sol();
      wallet2 = await create_wallet_with_sol_from_existing();
      //wallet3 = await create_wallet_with_sol();
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

    it("###### Win count test / #########", async () => {});


    /// CREATE_RAFFLE FUNCTION TESTS ///


    it("Create a raffle with deadline", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
  
      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
   
      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.deadline, deadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("Create a raffle with 100 Tickets", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);

      assert.equal(raffleAccount.maxTickets, maxTickets);
      assert.equal(raffleAccount.ticketPrice, ticketPrice);
      assert.equal(raffleAccount.endWithDeadline, endWithDeadline);
      assert.equal(raffleAccount.seller.toString(), wallet1.publicKey.toString());

    });

    it("One user can create multiple differents raffles", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      // Raffle 1 => 100 tickets (Without deadline):

      const maxTickets1 = 100;
      const ticketPrice1 = 10;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(maxTickets1, ticketPrice1, endWithDeadline1, deadline1, wallet1, userPda1);
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

      const rafflePda2 = await create_raffle(maxTickets2, ticketPrice2, endWithDeadline2, deadline2, wallet1, userPda1);
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

      const rafflePda3 = await create_raffle(maxTickets3, ticketPrice3, endWithDeadline3, deadline3, wallet1, userPda1);
      const raffleAccount3 = await program.account.raffle.fetch(rafflePda3);

      assert.equal(raffleAccount3.maxTickets, maxTickets3);
      assert.equal(raffleAccount3.ticketPrice, ticketPrice3);
      assert.equal(raffleAccount3.endWithDeadline, endWithDeadline3);
      assert.equal(raffleAccount3.deadline, deadline3);
      assert.equal(raffleAccount3.seller.toString(), wallet1.publicKey.toString());

    });

    it("Multiple users can create multiple differents raffles", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda2 = await init_User(wallet2);

      //const wallet3 = await create_wallet_with_sol();
      const wallet3 = await create_wallet_with_sol_from_existing();
      const userPda3 = await init_User(wallet3);

      // User1 Raffle 1 => 25 tickets:

      const maxTickets1_user1 = 25;
      const ticketPrice1_user1 = 1;
      const endWithDeadline1_user1 = false;
      const deadline1_user1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user1 = await create_raffle(maxTickets1_user1 , ticketPrice1_user1, endWithDeadline1_user1, deadline1_user1, wallet1, userPda1);
      const raffleAccount1_user1  = await program.account.raffle.fetch(rafflePda1_user1);

      assert.equal(raffleAccount1_user1 .maxTickets, maxTickets1_user1);
      assert.equal(raffleAccount1_user1 .ticketPrice, ticketPrice1_user1 );
      assert.equal(raffleAccount1_user1 .endWithDeadline, endWithDeadline1_user1 );
      assert.equal(raffleAccount1_user1 .seller.toString(), wallet1.publicKey.toString());

      // User2 Raffle 1 => 10 tickets:

      const maxTickets1_user2= 10;
      const ticketPrice1_user2 = 1;
      const endWithDeadline1_user2 = false;
      const deadline1_user2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user2 = await create_raffle(maxTickets1_user2, ticketPrice1_user2, endWithDeadline1_user2, deadline1_user2, wallet2, userPda2);
      const raffleAccount1_user2 = await program.account.raffle.fetch(rafflePda1_user2);

      assert.equal(raffleAccount1_user2.maxTickets, maxTickets1_user2);
      assert.equal(raffleAccount1_user2.ticketPrice, ticketPrice1_user2);
      assert.equal(raffleAccount1_user2.endWithDeadline, endWithDeadline1_user2);  
      assert.equal(raffleAccount1_user2.seller.toString(), wallet2.publicKey.toString());

      // User3 Raffle 1 with a 7 days deadline:

      const maxTickets1_user3 = 0;
      const ticketPrice1_user3 = 10;
      const endWithDeadline1_user3 = true;
      const deadline1_user3 = Math.floor(Date.now() / 1000) + 604800; 

      const rafflePda1_user3 = await create_raffle(maxTickets1_user3, ticketPrice1_user3, endWithDeadline1_user3, deadline1_user3, wallet3, userPda3);
      const raffleAccount1_user3 = await program.account.raffle.fetch(rafflePda1_user3);

      assert.equal(raffleAccount1_user3.maxTickets, maxTickets1_user3);
      assert.equal(raffleAccount1_user3.ticketPrice, ticketPrice1_user3);
      assert.equal(raffleAccount1_user3.endWithDeadline, endWithDeadline1_user3);
      assert.equal(raffleAccount1_user3.deadline, deadline1_user3);
      assert.equal(raffleAccount1_user3.seller.toString(), wallet3.publicKey.toString());

      // User2 Raffle 2 with 3 days deadline:

      const maxTickets2_user2= 0;
      const ticketPrice2_user2 = 1;
      const endWithDeadline2_user2 = true;
      const deadline2_user2 = Math.floor(Date.now() / 1000) + 259200; 

      const rafflePda2_user2 = await create_raffle(maxTickets2_user2, ticketPrice2_user2, endWithDeadline2_user2, deadline2_user2, wallet2, userPda2);
      const raffleAccount2_user2 = await program.account.raffle.fetch(rafflePda2_user2);

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

      const rafflePda2_user3 = await create_raffle(maxTickets2_user3, ticketPrice2_user3, endWithDeadline2_user3, deadline2_user3, wallet3, userPda3);
      const raffleAccount2_user3 = await program.account.raffle.fetch(rafflePda2_user3);

      assert.equal(raffleAccount2_user3.maxTickets, maxTickets2_user3);
      assert.equal(raffleAccount2_user3.ticketPrice, ticketPrice2_user3);
      assert.equal(raffleAccount2_user3.endWithDeadline, endWithDeadline2_user3);
      assert.equal(raffleAccount2_user3.seller.toString(), wallet3.publicKey.toString());

    });

    it("User can create a Raffle without register first", async () => {
      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      try {
        await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, wallet1.publicKey);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.log('Caught error:', error);
        assert.include(error.message, 'Account does not exist or has no data', "An unexpected error was thrown.");
      }
    });
    
    it("Raffle deadline is not correct", async () => {

      // Incorrect deadline: 1 hour in the past

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) - 3600; 

      try {
          await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
          assert.fail("Expected an error to be thrown.");
      } catch (error) {
          console.log('Caught error:', error);
          assert.include(error.message, 'DeadlineNotCorrect', "An unexpected error was thrown.");
      }

    });

    it("Ticket price is not correct", async () => {

      // Ticket price can't be negative:

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
  
      const maxTickets = 100;
      const ticketPrice = -10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      try {
        await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.log('Caught error:', error);
        assert.include(error.message, 'The value of "value" is out of range', "An unexpected error was thrown.");
      }
      
    });

    it("Max tickets number is not correct", async () => {

      // Max ticket number can't be negative:

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
  
      const maxTickets = -100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
  
      try {
        await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        console.log('Caught error:', error);
        assert.include(error.message, 'The value of "value" is out of range', "An unexpected error was thrown.");
      }

    });

    it("Deadline is activated for raffle Test and max tickets are null / create_raffle function", async () => {

        // Raffle activated with a 1 DAY deadline:

        //wallet1 = await create_wallet_with_sol();
        wallet1 = await create_wallet_with_sol_from_existing();
        const userPda1 = await init_User(wallet1);
      
        const maxTickets = 0;
        const ticketPrice = 10;
        const endWithDeadline = true;
        const deadline = Math.floor(Date.now() / 1000) + 86400;
        const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
        const raffleAccount = await program.account.raffle.fetch(rafflePda1);

        console.log("Stored deadline in raffle account:", raffleAccount.deadline);
      
        assert.equal(raffleAccount.endWithDeadline, true, "end_with_deadline should be true");
        assert.equal(raffleAccount.deadline, deadline, "The deadline should be set correctly");
        assert.equal(raffleAccount.maxTickets, 0, "max_tickets should be 0 when end_with_deadline is true");
        assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true");
     
    });

    it("Deadline is not activated for raffle and max number's tickets is correct / create_raffle function", async () => {

      // Raffle activated without deadline and 100 tickets:

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);

      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000); 

      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);

      console.log("Stored deadline in raffle account:", raffleAccount.deadline);

      assert.equal(raffleAccount.endWithDeadline, false, "end_with_deadline should be false");
      assert.equal(raffleAccount.maxTickets, maxTickets, "The max_tickets should be set correctly");
      assert.equal(raffleAccount.deadline, 0, "deadline should be 0 when end_with_deadline is false");
      assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true");

    });

    it("Raffle is in Progress Test / create_raffle function", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
    
      const maxTickets = 100;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
    
      const rafflePda = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
      const raffleAccount = await program.account.raffle.fetch(rafflePda);
    
      console.log("Raffle in progress:", raffleAccount.raffleInProgress);
  
      assert.equal(raffleAccount.raffleInProgress, true, "raffle_in_progress should be true");
    
    });

    it("Raffle count per user Test for one user", async () => {

      // User 1 account creation : counter check = 0

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();
      userPda1 = await init_User(wallet1);
      const userInfo1 = await program.account.user.fetch(userPda1);
      assert.ok(userPda1);
      assert.equal(userInfo1.raffleCount, 0, "user.raffle_count should be 0"); 
      assert.equal(userInfo1.winCount, 0, "user.win_count should be 0");
      console.log("Initial raffle count:", userInfo1.raffleCount);

      // User 1 first raffle : counter check = 1

      const maxTickets1 = 100;
      const ticketPrice1 = 10;
      const endWithDeadline1 = false;
      const deadline1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1 = await create_raffle(maxTickets1, ticketPrice1, endWithDeadline1, deadline1, wallet1, userPda1);
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);

      assert.equal(raffleAccount1.maxTickets, maxTickets1);
      assert.equal(raffleAccount1.ticketPrice, ticketPrice1);
      assert.equal(raffleAccount1.endWithDeadline, endWithDeadline1);
      assert.equal(raffleAccount1.seller.toString(), wallet1.publicKey.toString());

      const userInfo2 = await program.account.user.fetch(userPda1);
      console.log("Raffle count after first raffle:", userInfo2.raffleCount);
      assert.equal(userInfo2.raffleCount, 1, "user.raffle_count should be 1"); 

      // User 1 second raffle : counter check = 2

      const maxTickets2 = 25;
      const ticketPrice2 = 1;
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda2 = await create_raffle(maxTickets2, ticketPrice2, endWithDeadline2, deadline2, wallet1, userPda1);
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

      //wallet1 = await create_wallet_with_sol();
      wallet1 = await create_wallet_with_sol_from_existing();
      userPda1 = await init_User(wallet1);
      const userInfo1_user1 = await program.account.user.fetch(userPda1);
      assert.ok(userPda1);
      assert.equal(userInfo1_user1.raffleCount, 0, "user1.raffle_count should be 0"); 
      assert.equal(userInfo1_user1.winCount, 0, "user1.win_count should be 0");
      console.log("Initial raffle count for user 1:", userInfo1_user1.raffleCount);

      // User 2 account creation : counter check = 0

      //wallet2 = await create_wallet_with_sol();
      wallet2 = await create_wallet_with_sol_from_existing();
      userPda2 = await init_User(wallet2);
      const userInfo1_user2 = await program.account.user.fetch(userPda2);
      assert.ok(userPda2);
      assert.equal(userInfo1_user2.raffleCount, 0, "user2.raffle_count should be 0"); 
      assert.equal(userInfo1_user2.winCount, 0, "user2.win_count should be 0");
      console.log("Initial raffle count for user 2:", userInfo1_user2.raffleCount);

      // User 1 first raffle : counter check User 1 = 1

      const maxTickets1_user1 = 100;
      const ticketPrice1_user1 = 10;
      const endWithDeadline1_user1 = false;
      const deadline1_user1 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user1 = await create_raffle(maxTickets1_user1, ticketPrice1_user1, endWithDeadline1_user1, deadline1_user1, wallet1, userPda1);
      const raffleAccount1_user1 = await program.account.raffle.fetch(rafflePda1_user1);

      assert.equal(raffleAccount1_user1.maxTickets, maxTickets1_user1);
      assert.equal(raffleAccount1_user1.ticketPrice, ticketPrice1_user1);
      assert.equal(raffleAccount1_user1.endWithDeadline, endWithDeadline1_user1);
      assert.equal(raffleAccount1_user1.seller.toString(), wallet1.publicKey.toString());

      const userInfo2_user1 = await program.account.user.fetch(userPda1);
      console.log("Raffle count after first raffle for user 1:", userInfo2_user1.raffleCount);
      assert.equal(userInfo2_user1.raffleCount, 1, "user1.raffle_count should be 1"); 

      // User 2 firt raffle : counter check User 2 = 1

      const maxTickets1_user2 = 25;
      const ticketPrice1_user2 = 1;
      const endWithDeadline1_user2 = false;
      const deadline1_user2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda1_user2 = await create_raffle(maxTickets1_user2, ticketPrice1_user2, endWithDeadline1_user2, deadline1_user2, wallet2, userPda2);
      const raffleAccount1_user2 = await program.account.raffle.fetch(rafflePda1_user2);

      assert.equal(raffleAccount1_user2.maxTickets, maxTickets1_user2);
      assert.equal(raffleAccount1_user2.ticketPrice, ticketPrice1_user2);
      assert.equal(raffleAccount1_user2.endWithDeadline, endWithDeadline1_user2);
      assert.equal(raffleAccount1_user2.seller.toString(), wallet2.publicKey.toString());

      const userInfo2_user2 = await program.account.user.fetch(userPda2);
      console.log("Raffle count after second raffle for user 2:", userInfo2_user2.raffleCount);
      assert.equal(userInfo2_user2.raffleCount, 1, "user.raffle_count should be 1"); 

      // User 2 second raffle : counter check User 2 = 2

      const maxTickets2_user2 = 250;
      const ticketPrice2_user2 = 15;
      const endWithDeadline2_user2 = false;
      const deadline2_user2 = Math.floor(Date.now() / 1000) + 3600; 

      const rafflePda2_user2 = await create_raffle(maxTickets2_user2, ticketPrice2_user2, endWithDeadline2_user2, deadline2_user2, wallet2, userPda2);
      const raffleAccount2_user2 = await program.account.raffle.fetch(rafflePda2_user2);

      assert.equal(raffleAccount2_user2.maxTickets, maxTickets2_user2);
      assert.equal(raffleAccount2_user2.ticketPrice, ticketPrice2_user2);
      assert.equal(raffleAccount2_user2.endWithDeadline, endWithDeadline2_user2);
      assert.equal(raffleAccount2_user2.seller.toString(), wallet2.publicKey.toString());

      const userInfo3_user2 = await program.account.user.fetch(userPda2);
      console.log("Raffle count after second raffle for user 2:", userInfo3_user2.raffleCount);
      assert.equal(userInfo3_user2.raffleCount, 2, "user.raffle_count should be 2"); 

      // User 1 check without additionnal raffle : counter check User 1 = 1

      const userInfo3_user1 = await program.account.user.fetch(userPda1);
      console.log("Raffle count after first raffle for user 1:", userInfo3_user1.raffleCount);
      assert.equal(userInfo3_user1.raffleCount, 1, "user1.raffle_count should be 1"); 

    });

    it("####### NFT transfert test / #########", async () => {});

    
    //// BUY FUNCTION TESTS ////


    it("Buy function test", async () => {
      
      //const wallet1 = await create_wallet_with_sol(); 
      const wallet1 = await create_wallet_with_sol_from_existing(); 
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
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

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
    
      const maxTickets = 0;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);

      try {
        await buy(wallet1, rafflePda1, userPda1, 1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.include(error.message, 'AnchorError caused by account: buyer', "An unexpected error was thrown.");
      }

    });

    it("Buy function test with logs", async () => {
      //console.log("Création du portefeuille...");
      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //assert.ok(wallet1, "Le portefeuille n'a pas été créé");
      //console.log("Portefeuille créé:", wallet1);

      //console.log("Création du portefeuille wallet2...");
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      //console.log("Portefeuille wallet2 créé:", wallet2);
    
      //console.log("Initialisation de l'utilisateur...");
      const userPda1 = await init_User(wallet1);
      //assert.ok(userPda1, "L'utilisateur n'a pas été initialisé");
      //console.log("Utilisateur initialisé:", userPda1);

      //console.log("Initialisation de l'utilisateur...");
      const userPda2 = await init_User(wallet2);
      //assert.ok(userPda2, "L'utilisateur n'a pas été initialisé");
      //console.log("Utilisateur initialisé:", userPda2);
    
      //console.log("Paramètres de la tombola: maxTickets=0, ticketPrice=10, endWithDeadline=true");
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      //console.log("Deadline:", deadline);
    
      //console.log("Création de la tombola...");
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
      //assert.ok(rafflePda1, "La tombola n'a pas été créée");
      //console.log("Tombola créée:", rafflePda1);
    
      //console.log("Tentative d'achat de ticket...");
      try {
        await buy(wallet2, rafflePda1, userPda2, 0); 
       // console.log("Achat réussi");
      } catch (error) {
       // console.error("Erreur lors de l'achat:", error);
        assert.fail("L'achat du ticket a échoué");
      }
    
      //console.log("Vérification du nombre de tickets...");
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      //console.log("Nombre de tickets vendus:", raffleAccount1.ticketsCount);
      assert.equal(raffleAccount1.ticketsCount, 1, "Le nombre de tickets vendus devrait être 1");
    });

    it("User can buy a ticket if all tickets are sold (raffle without deadline)", async () => {

      // 4 users can register and create their own PDA:

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      //const wallet3 = await create_wallet_with_sol();
      const wallet3 = await create_wallet_with_sol_from_existing();
      //const wallet4 = await create_wallet_with_sol();
      const wallet4 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);

      // Create a raffle with 2 tickets from user 1 :
    
      const maxTickets = 2;  
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;  
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // User 2 buys the 1 tickets:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Error", error);
        assert.fail("First ticket purchase failed");
      }
    
      // User 3 buys the 1 tickets:

      try {
        await buy(wallet3, rafflePda1, userPda3, 1);
      } catch (error) {
        console.error("Error", error);
        assert.fail("Second ticket purchase failed");
      }
    
      // User 4 should not be able to buy a ticket because all tickets are sold:

      try {
        await buy(wallet4, rafflePda1, userPda3, 2);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.include(error.message, 'AllTicketsSelling', "An unexpected error was thrown.");
      }
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, maxTickets, "Ticket Count should be equal to maxTickets");

    });
    
    it("#### A buyer can buy all // multiple ???? tickets in a single raffle####?", async () => {

      // 4 users can register and create their own PDA:

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);

      // Create a raffle with 2 tickets from user 1 :
    
      const maxTickets = 2;  
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;  
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
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
        assert.include(error.message, 'AllTicketsSelling', "An unexpected error was thrown.");
      }
    
      const raffleAccount1 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1.ticketsCount, maxTickets, "Ticket Count should be equal to maxTickets");

    });

    it("User cannot buy a ticket after the deadline has passed", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);

      // For this example, user_1 create a raffle with a deadline of 5 seconds in the future:
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // User 2 buys a ticket before the deadline ends:

      try {
        await buy(wallet2, rafflePda1, userPda2, 0);
      } catch (error) {
        console.error("Erreur lors de l'achat avant la deadline:", error);
        assert.fail("L'achat du ticket avant la deadline a échoué");
      }

      const raffleAccount1_user2 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount1_user2.ticketsCount, 1, "Ticket Count should be 1");
    
      // Wait for the deadline to pass simulation:

      await new Promise(resolve => setTimeout(resolve, 6000));
    
      // User 2 can't buy a ticket after the deadline has passed:

      try {
        await buy(wallet2, rafflePda1, userPda2, 1);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.include(error.message, 'RaffleEnded', "An unexpected error was thrown.");
      }
    
      const raffleAccount2_user2 = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount2_user2.ticketsCount, 1, "Ticket Count should be 1");

    });

    it("Ticket counter works correctly over multiple ticket purchases", async () => {

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      //const wallet3 = await create_wallet_with_sol();
      const wallet3 = await create_wallet_with_sol_from_existing();
      //const wallet4 = await create_wallet_with_sol();
      const wallet4 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
    
      const maxTickets = 10;
      const ticketPrice = 10;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
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

      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      // User 1 create a raffle with 10 tickets and a ticket price of 1 SOL:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL; 
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
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

    it("###Buyer transfers the ticket price in SOL to the raffle account / with balance logs", async () => {
     
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      // User 1 create a raffle with 10 tickets and a ticket price of 1 SOL:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL; 
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // Get initial balances

      const initialBuyerBalance = await program.provider.connection.getBalance(wallet2.publicKey);
      const initialRaffleBalance = await program.provider.connection.getBalance(rafflePda1);
    
      console.log("Initial Buyer Balance:", initialBuyerBalance / LAMPORTS_PER_SOL, "SOL");
      console.log("Initial Raffle Balance:", initialRaffleBalance / LAMPORTS_PER_SOL, "SOL");
    
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
    
      console.log("Final Buyer Balance:", finalBuyerBalance / LAMPORTS_PER_SOL, "SOL");
      console.log("Final Raffle Balance:", finalRaffleBalance / LAMPORTS_PER_SOL, "SOL");
    
      // Verify the balances with tolerance for transaction fees (0.0012 SOL / 0.21$ / 1 SOL = 180$)

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
    
    it("Raffles transfert and balance checks with multiple raffles", async () => {
  
      //const wallet1 = await create_wallet_with_sol();
      const wallet1 = await create_wallet_with_sol_from_existing();
      //const wallet2 = await create_wallet_with_sol();
      const wallet2 = await create_wallet_with_sol_from_existing();
      //const wallet3 = await create_wallet_with_sol();
      const wallet3 = await create_wallet_with_sol_from_existing();
      //const wallet4 = await create_wallet_with_sol();
      const wallet4 = await create_wallet_with_sol_from_existing();
      //const wallet5 = await create_wallet_with_sol();
      const wallet5 = await create_wallet_with_sol_from_existing();
    
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
      const userPda3 = await init_User(wallet3);
      const userPda4 = await init_User(wallet4);
      const userPda5 = await init_User(wallet5);
    
      // User 1 create a raffle 1 with 10 tickets and a ticket price of 1 SOL:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL; 
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
    
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);

      // User 2 create a raffle 2 with 15 tickets and a ticket price of 0.5 SOL:

      const maxTickets2 = 15;
      const ticketPrice2 = 1.5 * LAMPORTS_PER_SOL; 
      const endWithDeadline2 = false;
      const deadline2 = Math.floor(Date.now() / 1000) + 3600;

      const rafflePda2 = await create_raffle(maxTickets2, ticketPrice2, endWithDeadline2, deadline2, wallet2, userPda2);
    
      // Get initial balances

      const initialRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const initialRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      console.log("Initial Raffle 1 Balance (in SOL):", initialRaffleBalance1 / LAMPORTS_PER_SOL);
      console.log("Initial Raffle 2 Balance (in SOL):", initialRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // User 3 buy a ticket for raffle 1, user 4 buy a ticket for raffle 2 and user 5 buy & tickets for raffle 2:
      try {
        await buy(wallet3, rafflePda1, userPda3, 0); 
        await buy(wallet4, rafflePda2, userPda4, 0); 
        await buy(wallet5, rafflePda2, userPda5, 1); 
      } catch (error) {
        console.error("Error during ticket purchase:", error);
        assert.fail("Ticket purchase failed");
      }
    
      // Get final balances

      const finalRaffleBalance1 = await program.provider.connection.getBalance(rafflePda1);
      const finalRaffleBalance2 = await program.provider.connection.getBalance(rafflePda2);
    
      console.log("Final Raffle 1 Balance (in SOL):", finalRaffleBalance1 / LAMPORTS_PER_SOL);
      console.log("Final Raffle 2 Balance (in SOL):", finalRaffleBalance2 / LAMPORTS_PER_SOL);
    
      // Verify the balances with tolerance for transaction fees

      const tolerance = 1_200_000;
    
      assert.closeTo(
        finalRaffleBalance1,
        initialRaffleBalance1 + ticketPrice,
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
      console.log("Raffle 1 Account after purchases:", raffleAccount1);
      console.log("Raffle 2 Account after purchases:", raffleAccount2);
    
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
    

    /// DRAW FUNCTION TESTS ///

    it("RaffleEnded test in draw function", async () => {
  
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      // User 1 create a raffle with a deadline of 5 seconds in the future:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5;
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      await buy(wallet2, rafflePda1, userPda2, 0);
    
      // Wait for the deadline to pass:

      console.log("Waiting for the deadline to pass...");
      await new Promise(resolve => setTimeout(resolve, 7000)); 
    
      // Draw function call to determine the winner:

      try {
          await draw(wallet1, rafflePda1);
      } catch (error) {
          console.error('Unexpected error during draw:', error);
          assert.fail("Unexpected error during draw");
      }
    
      // Try to call draw again after the raffle has ended:

      try {
          await draw(wallet1, rafflePda1);
          assert.fail("Expected an error to be thrown.");
      } catch (error) {
          console.error('Caught error:', error);
          console.log('Error message:', error.message);
          assert.include(error.message, 'RaffleEnded', "An unexpected error was thrown.");
      }
    });

    it("RaffleNotEnded error test in draw function with deadline", async () => {
      
      const wallet1 = await create_wallet_with_sol_from_existing();
      const wallet2 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
      const userPda2 = await init_User(wallet2);
    
      // Create a raffle with a deadline of 10 seconds in the future:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 10;
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      await buy(wallet2, rafflePda1, userPda2, 0);
      
      const raffleAccountBeforeDraw = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle state before draw:", raffleAccountBeforeDraw);
  
      try {
          await draw(wallet1, rafflePda1);
          assert.fail("Expected an error to be thrown.");
      } catch (error) {
          console.error('Caught error:', error);
          console.log('Error message:', error.message);
          assert.include(error.message, 'RaffleNotEnded', "An unexpected error was thrown.");
      }
    
      // Check that the raffle is still in progress after the failed draw attempt:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle state after draw attempt:", raffleAccount);
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
    
      // Create a raffle with a max ticket condition:

      const maxTickets = 10;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600; 
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      
      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      
      // Check that the raffle is still in progress after the first two ticket purchases:

      const raffleAccountBeforeDraw = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle state before draw:", raffleAccountBeforeDraw);
    
      // Try to call draw before the raffle has ended:
      try {
          await draw(wallet1, rafflePda1);
          assert.fail("Expected an error to be thrown.");
      } catch (error) {
          console.error('Caught error:', error);
          console.log('Error message:', error.message);
          assert.include(error.message, 'RaffleNotEnded', "An unexpected error was thrown.");
      }
    
      // Check that the raffle is still in progress after the failed draw attempt:
      
      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      console.log("Raffle state after draw attempt:", raffleAccount);
      assert.equal(raffleAccount.raffleInProgress, true, "Raffle should still be in progress");
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
    
      // User 1 create a raffle with 6 tickets:

      const maxTickets = 6;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // Users 2 à 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      await buy(wallet4, rafflePda1, userPda4, 2);
      await buy(wallet5, rafflePda1, userPda5, 3);
      await buy(wallet6, rafflePda1, userPda6, 4);
      await buy(wallet7, rafflePda1, userPda7, 5);
    
      // Draw function call to determine the winner

      try {
        await draw(wallet1, rafflePda1);
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }
    
      // Check that the raffle is marked as ended

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
    
      // User 1 creates a raffle with a deadline:

      const maxTickets = 0; 
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // Users 2 to 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      await buy(wallet3, rafflePda1, userPda3, 1);
      await buy(wallet4, rafflePda1, userPda4, 2);
      await buy(wallet5, rafflePda1, userPda5, 3);
      await buy(wallet6, rafflePda1, userPda6, 4);
      await buy(wallet7, rafflePda1, userPda7, 5);
    
      // Simulate waiting for the deadline to pass:

      console.log("Waiting for the deadline to pass...");
      await new Promise(resolve => setTimeout(resolve, 5 * 1000)); 
    
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
    
      // Log the winner's information:

      console.log("Raffle is no longer in progress.");
      console.log("Winning ticket:", raffleAccount.winningTicket);
    
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
    
    it("Draw function test with 7 users + LOGS", async () => {
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
    
      console.log("All users initialized.");
      
      // User 1 create a raffle with 6 tickets:

      const maxTickets = 6;
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = false;
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      console.log("Raffle created by User 1.");
    
      // Users 2 to 7 buy a ticket each:

      await buy(wallet2, rafflePda1, userPda2, 0);
      console.log("User 2 bought a ticket.");
      await buy(wallet3, rafflePda1, userPda3, 1);
      console.log("User 3 bought a ticket.");
      await buy(wallet4, rafflePda1, userPda4, 2);
      console.log("User 4 bought a ticket.");
      await buy(wallet5, rafflePda1, userPda5, 3);
      console.log("User 5 bought a ticket.");
      await buy(wallet6, rafflePda1, userPda6, 4);
      console.log("User 6 bought a ticket.");
      await buy(wallet7, rafflePda1, userPda7, 5);
      console.log("User 7 bought a ticket.");
    
      // Draw function call to determine the winner:

      try {
        await draw(wallet1, rafflePda1);
        console.log("Draw function executed.");
      } catch (error) {
        console.error("Error during draw:", error);
        assert.fail("Draw failed");
      }
    
      // Check that the raffle is marked as ended and the winning ticket is set:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
      assert.isAtLeast(raffleAccount.winningTicket, 0, "Winning ticket should be set");
    
      console.log("Raffle is no longer in progress.");
      console.log("Winning ticket:", raffleAccount.winningTicket);
    
      // Determine the winner

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

    it("Draw function sets winning_ticket to -1 if no tickets are sold (with deadline)", async () => {
      
      const wallet1 = await create_wallet_with_sol_from_existing();
      const userPda1 = await init_User(wallet1);
    
      // raffle creation with a deadline of 5 seconds in the future:

      const maxTickets = 0; 
      const ticketPrice = 1 * LAMPORTS_PER_SOL;
      const endWithDeadline = true;
      const deadline = Math.floor(Date.now() / 1000) + 5; 
      const rafflePda1 = await create_raffle(maxTickets, ticketPrice, endWithDeadline, deadline, wallet1, userPda1);
    
      // Wait for the deadline to pass:

      console.log("Waiting for the deadline to pass...");
      await new Promise(resolve => setTimeout(resolve, 6000)); 

      // Dtaw function call to determine the winner:
      try {
          await draw(wallet1, rafflePda1);
      } catch (error) {
          console.error("Error during draw :", error);
          assert.fail("Draw failed");
      }
    
      // Check that the raffle is marked as ended and the winning ticket is set to -1:

      const raffleAccount = await program.account.raffle.fetch(rafflePda1);
      assert.equal(raffleAccount.winningTicket, -1, "Winning ticket should be set to -1 after the deadline has passed");
      assert.equal(raffleAccount.raffleInProgress, false, "Raffle should be marked as not in progress after drawing");
    });

    
    // WITHDRAW FUNCTION TESTS //
    

    it("Raffle is still in progress ? Test", async () => {});

    it("Withdraw SOL test", async () => {});

    it("You'r not the seller error test", async () => {});

    it("Raffle is not ended test", async () => {});

    it("Price test", async () => {});

    it("Transfert SOL test to seller", async () => {});

    it("NFT transfert to winner", async () => {});

    it("Raffle PDA balance test after transfert SOL to seller", async () => {});

    it("Seller balace after tarnsfert?", async () => {});
    
    it("Raffle win count Test", async () => {});
    
});

