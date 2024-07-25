use anchor_lang::prelude::*;
 use anchor_lang::system_program;
 use anchor_spl::associated_token::AssociatedToken;
 use anchor_spl::token::Token;
 use anchor_spl::token::{self, Mint, TokenAccount, Transfer};
 // use spl_token::instruction::AuthorityType;
 
 declare_id!("7ix4pKbcfsCiWe9SGYVfhqPqh5bJeF3JGNGtCDVxMk3d");
 
 #[program]
 mod raffle_t {
     use super::*;
 
     pub fn init_user(_ctx: Context<InitUser>) -> Result<()> {
         _ctx.accounts.user.raffle_count = 0;
         _ctx.accounts.user.win_count = 0;
 
         msg!(
             "User account have create a ccount with {} raffles",
             _ctx.accounts.user.raffle_count
         );
         Ok(())
     }
 
     pub fn create_raffle(
         _ctx: Context<CreateRaffle>,
         nft_address: Pubkey,
         max_tickets: u32,
         tickets_price: u32,
         end_with_deadline: bool,
         deadline: u32,
     ) -> Result<()> {
         let user_pda = Pubkey::find_program_address(
             &[_ctx.accounts.signer.key().as_ref()],
             &_ctx.program_id.key(),
         );
 
         let raffle_account = &mut _ctx.accounts.raffle;
         let user_account = &mut _ctx.accounts.user;
 
         require!(
             user_pda.0 == user_account.key(),
             RaffleError::CreateUserAccount
         );
 
         if end_with_deadline == true {
             require!(
                 i64::from(deadline) > Clock::get()?.unix_timestamp,
                 RaffleError::DeadlineNotCorrect
             );
         }
 
         raffle_account.seller = _ctx.accounts.signer.key();
         raffle_account.raffle_number = user_account.raffle_count;
         raffle_account.nft_address = nft_address;
         raffle_account.ticket_price = tickets_price;
         raffle_account.end_with_deadline = end_with_deadline;
 
         match end_with_deadline {
             true => raffle_account.deadline = deadline,
             false => raffle_account.max_tickets = max_tickets,
         };
 
         let cpi_accounts = Transfer {
             from: _ctx.accounts.signer_token_account.to_account_info(),
             to: _ctx.accounts.raffle_token_account.to_account_info(),
             authority: _ctx.accounts.signer.to_account_info(),
         };
         let cpi_program = _ctx.accounts.token_program.to_account_info();
         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
         token::transfer(cpi_ctx, 1)?;
 
         raffle_account.raffle_in_progress = true;
 
         user_account.raffle_count += 1;
         msg!(
             "User account have create {} raffles",
             user_account.raffle_count
         );
 
         Ok(())
     }
 
     pub fn buy(_ctx: Context<Buy>) -> Result<()> {
         let raffle_account = &mut _ctx.accounts.raffle;
         let buyer_account = &mut _ctx.accounts.buyer;
 
         require!(
             _ctx.accounts.signer.key() != raffle_account.seller,
             RaffleError::SellerCantBeBuyer
         );
 
         if raffle_account.end_with_deadline {
             require!(
                 i64::from(raffle_account.deadline) > Clock::get()?.unix_timestamp,
                 RaffleError::RaffleEnded
             );
         } else {

             require!(
                 raffle_account.max_tickets > raffle_account.tickets_count,
                 RaffleError::AllTicketsSelling
             );
         }
 
         buyer_account.buyer_address = _ctx.accounts.signer.key();
 
         let amount = raffle_account.ticket_price.into();
 
         // Transfert du prix du ticket du compte de l'acheteur au compte de la tombola
         let cpi_context = CpiContext::new(
             _ctx.accounts.system_program.to_account_info(),
             system_program::Transfer {
                 from: _ctx.accounts.signer.to_account_info(),
                 to: raffle_account.to_account_info(),
             },
         );
         system_program::transfer(cpi_context, amount)?;
 
         msg!(
             "Le prix du ticket de {} lamports a été transféré",
             amount
         );
         msg!(
             "Solde du compte de la tombola : {}",
             raffle_account.to_account_info().lamports()
         );
 
         raffle_account.tickets_count += 1;
 
         Ok(())
     }
 
     pub fn draw(_ctx: Context<Draw>) -> Result<()> {
         let raffle_account = &mut _ctx.accounts.raffle;
 
         require!(
             raffle_account.raffle_in_progress == true,
             RaffleError::RaffleEnded
         );

         if raffle_account.end_with_deadline {
             msg!("Checking if deadline has passed");
             require!(
                 i64::from(raffle_account.deadline) < Clock::get()?.unix_timestamp,
                 RaffleError::RaffleNotEnded
             );
         } else {
             msg!("Checking if enough tickets are sold");
             require!(
                 raffle_account.tickets_count >= raffle_account.max_tickets,
                 RaffleError::RaffleNotEnded
             );
         }
 
         if raffle_account.end_with_deadline == false {
             let max_tickets = raffle_account.max_tickets;
 
             let slot = Clock::get()?.slot;
 
             let xorshift_output = xorshift64(slot);
 
             let winner = xorshift_output % (max_tickets as u64);
 
             raffle_account.winning_ticket = winner as i32;
         } else {
             let tickets = raffle_account.tickets_count;
 
             if tickets == 0 {
                 raffle_account.winning_ticket = -1;
             } else {
                 let slot = Clock::get()?.slot;
 
                 let xorshift_output = xorshift64(slot);
 
                 let winner = xorshift_output % (tickets as u64);
                 raffle_account.winning_ticket = winner as i32;
             }
         }
 
         raffle_account.raffle_in_progress = false;
 
         msg!("Winner : {}", raffle_account.winning_ticket);
         msg!(
             "La raffle est-elle en cours ? {}",
             raffle_account.raffle_in_progress
         );
 
         Ok(())
     }
 
     pub fn withdraw_sol(_ctx: Context<WithdrawSol>) -> Result<()> {
         require!(
             _ctx.accounts.raffle.seller == _ctx.accounts.signer.key(),
             RaffleError::NotTheSeller
         );
         require!(
             _ctx.accounts.raffle.raffle_in_progress == false,
             RaffleError::RaffleNotFinished
         );
 
         msg!(
             "Tickets count: {}, Ticket price: {}",
             _ctx.accounts.raffle.tickets_count,
             _ctx.accounts.raffle.ticket_price
         );
 
         let amount = (_ctx.accounts.raffle.tickets_count as u64)
             .checked_mul(_ctx.accounts.raffle.ticket_price as u64)
             .ok_or(RaffleError::ArithmeticOverflow)?;
 
         msg!("Amount to be withdrawn: {}", amount);
 
         let raffle_balance = **_ctx.accounts.raffle.to_account_info().lamports.borrow();
         let signer_balance = **_ctx.accounts.signer.to_account_info().lamports.borrow();
 
         msg!("Current raffle account balance: {}", raffle_balance);
         msg!("Current seller account balance: {}", signer_balance);
 
         require!(raffle_balance >= amount, RaffleError::InsufficientBalance);
 
         **_ctx
             .accounts
             .raffle
             .to_account_info()
             .try_borrow_mut_lamports()? -= amount;
         **_ctx
             .accounts
             .signer
             .to_account_info()
             .try_borrow_mut_lamports()? += amount;
 
         msg!(
             "Raffle account balance after withdrawal: {}",
             _ctx.accounts.raffle.to_account_info().lamports()
         );
         msg!(
             "Seller account balance after withdrawal: {}",
             _ctx.accounts.signer.to_account_info().lamports()
         );
 
         Ok(())
     }

     pub fn withdraw_nft(_ctx: Context<WithdrawNft>) -> Result<()> {
        require!(
            _ctx.accounts.buyer.buyer_address == _ctx.accounts.signer.key(),
            RaffleError::NotTheWinner
        );
        require!(
            _ctx.accounts.raffle.raffle_in_progress == false,
            RaffleError::RaffleNotFinished
        );
    
        let cpi_accounts = Transfer {
            from: _ctx.accounts.raffle_token_account.to_account_info(),
            to: _ctx.accounts.signer_token_account.to_account_info(),
            authority: _ctx.accounts.raffle.to_account_info(),
        };
        let cpi_program = _ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, 1)?;
    
        Ok(())
    }
 }
 
 #[derive(Accounts)]
 pub struct InitUser<'info> {
     #[account(
         init,
         payer = signer,
         space = 8 + 4 + 2 + 1,
         seeds = [signer.key().as_ref()],
         bump
         )]
     pub user: Account<'info, User>,
     #[account(mut)]
     pub signer: Signer<'info>,
     pub system_program: Program<'info, System>,
 }
 
 //PDA raffle, créer avec le compteur de raffle venant du PDA User et la PubKey du créateur
 #[derive(Accounts)]
 pub struct CreateRaffle<'info> {
     #[account(mut)]
     pub signer: Signer<'info>,
     #[account(mut)]
     pub signer_token_account: Account<'info, TokenAccount>,
     pub nft_mint: Account<'info, Mint>,
     #[account(mut)]
     pub user: Account<'info, User>,
     #[account(
         init,
         payer = signer,
         space = 8 + 32 + 4 + 32 + 4 + 4 + 1 + 4 + 4 + 1 + 4 + 1,
         seeds = [&user.raffle_count.to_le_bytes(), signer.key().as_ref()],
         bump)]
     pub raffle: Account<'info, Raffle>,
     #[account(
         init,
         payer = signer,
         associated_token::mint = nft_mint,
         associated_token::authority = raffle,
     )]
     pub raffle_token_account: Account<'info, TokenAccount>,
     pub system_program: Program<'info, System>,
     pub token_program: Program<'info, Token>,
     pub rent: Sysvar<'info, Rent>,
     pub associated_token_program: Program<'info, AssociatedToken>,
 }
 
 //PDA de l'acheteur, créer avec le compteur de tickets venant du PDA Raffle et la PubKey de la Raffle
 #[derive(Accounts)]
 pub struct Buy<'info> {
     #[account(mut)]
     pub raffle: Account<'info, Raffle>,
     #[account(
         init,
         payer = signer,
         space = 8 + 32 + 1,
         seeds = [&raffle.tickets_count.to_le_bytes(), raffle.key().as_ref()],
         bump
     )]
     pub buyer: Account<'info, Buyer>,
     #[account()]
     pub user: Account<'info, User>,
     #[account(mut)]
     pub signer: Signer<'info>,
     pub system_program: Program<'info, System>,
 }
 
 #[derive(Accounts)]
 pub struct Draw<'info> {
     #[account(mut)]
     pub raffle: Account<'info, Raffle>,
     #[account(mut)]
     pub signer: Signer<'info>,
     pub system_program: Program<'info, System>,
 }
 
 #[derive(Accounts)]
 pub struct WithdrawSol<'info> {
     #[account(mut)]
     pub raffle: Account<'info, Raffle>,
     #[account(mut)]
     pub signer: Signer<'info>,
     pub system_program: Program<'info, System>,
 }
 
 #[derive(Accounts)]
pub struct WithdrawNft<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub buyer: Account<'info, Buyer>,
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub raffle_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Account<'info, User>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = nft_mint,
        associated_token::authority = signer,
    )]
    pub signer_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

 
 #[account]
 pub struct User {
     raffle_count: u32,
     win_count: u16,
 }
 
 #[account]
 pub struct Raffle {
     seller: Pubkey,
     raffle_number: u32,
     nft_address: Pubkey,
     max_tickets: u32,
     ticket_price: u32,
     end_with_deadline: bool,
     tickets_count: u32,
     deadline: u32,
     raffle_in_progress: bool,
     winning_ticket: i32,
 }
 
 #[account]
 pub struct Buyer {
     buyer_address: Pubkey,
 }
 
 #[error_code]
 pub enum RaffleError {
     #[msg("You cannot participate in raffles of which you are the creator.")]
     SellerCantBeBuyer,
     #[msg("Draw conditions not met")]
     RaffleNotEnded,
     #[msg("You're not the creator of this raffle")]
     NotTheSeller,
     #[msg("All the tickets have been sold")]
     AllTicketsSelling,
     #[msg("Create a user account for this wallet")]
     CreateUserAccount,
     #[msg("This raffle isn't finished")]
     RaffleNotFinished,
     #[msg("This raffle is finished")]
     RaffleEnded,
     #[msg("The deadline is not correct")]
     DeadlineNotCorrect,
     #[msg("You're not the winner")]
     NotTheWinner,
     #[msg("Arithmetic overflow occurred")]
     ArithmeticOverflow,
     #[msg("Insufficient balance in raffle account")]
     InsufficientBalance,
 }
 
 pub fn xorshift64(seed: u64) -> u64 {
     let mut x = seed;
     x ^= x << 13;
     x ^= x >> 7;
     x ^= x << 17;
     x
 }