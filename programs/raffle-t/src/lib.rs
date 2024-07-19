use anchor_lang::prelude::*;
// use rand::Rng;


declare_id!("93aVSKUUHf7Jyz7qMbK1qMgWG1ZMge1D3hoHtv7tdCJy");

#[program]
mod raffle_t {
    use super::*;

    pub fn init_user(_ctx: Context<InitUser>) -> Result<()> {
        _ctx.accounts.user.raffle_count = 0;
        _ctx.accounts.user.win_count = 0;

        msg!(
            "User account have create {} raffles",
            _ctx.accounts.user.raffle_count
        );
        Ok(())
    }

    pub fn create_raffle(
        _ctx: Context<CreateRaffle>,
        // nft_id: Pubkey,
        max_tickets: u32,
        tickets_price: u32,
        end_with_deadline: bool,
        deadline: u32,
    ) -> Result<()> {
        let raffle_account = &mut _ctx.accounts.raffle;
        let user_account = &mut _ctx.accounts.user;

        raffle_account.seller = _ctx.accounts.signer.key();
        // raffle_account.nft_id = nft_id;
        raffle_account.ticket_price = tickets_price;
        raffle_account.end_with_deadline = end_with_deadline;

        match end_with_deadline {
            true => raffle_account.deadline = deadline,
            false => raffle_account.max_tickets = max_tickets,
        };

        user_account.raffle_count += 1;
        msg!(
            "User account have create {} raffles",
            user_account.raffle_count
        );

        Ok(())
    }

    pub fn buy(_ctx: Context<Buy>) -> Result<()> {
        require!(
            _ctx.accounts.signer.key() != _ctx.accounts.raffle.seller,
            RaffleError::SellerCantBeBuyer
        );
        let raffle_account = &mut _ctx.accounts.raffle;
        let buyer_account = &mut _ctx.accounts.buyer;

        buyer_account.buyer_address = _ctx.accounts.signer.key();

        // Transfer the ticket price from the buyer to the raffle account
        let lamports = raffle_account.ticket_price;
        let cpi_ctx = CpiContext::new(
            _ctx.program,
            _ctx.accounts.to_account_info(),
            _ctx.remaining_accounts,
        );
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &_ctx.accounts.signer.key(),
            &raffle_account.key(),
            lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                _ctx.accounts.signer.to_account_info(),
                _ctx.accounts.raffle.to_account_info(),
            ],
        )?;

        raffle_account.tickets_count += 1;

        Ok(())
    }

    pub fn draw(_ctx: Context<Draw>, _max_tickets: u32) -> Result<()> {
        // require!(
        //     _ctx.accounts.raffle.tickets_count >= _ctx.accounts.raffle.max_tickets,
        //     RaffleError::RaffleNotEnded
        // );

        // let slot = Clock::get()?.slot;

        // let xorshift_output = xorshift64(slot);

        // let winner = xorshift_output % max_tickets;

        // let winner = rand::thread_rng().gen_range(1..=_max_tickets);

        // // msg!("Slot : {}", slot);
        // // msg!("Xorshift output : {}", xorshift_output);
        // msg!("Winner : {}", winner);

        Ok(())
    }
}

//Initialisation du compte obligatoire avant de créer une raffle ou acheter un ticket
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
    pub user: Account<'info, User>,
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 32 + 4 + 4 + 1 + 4 + 4 + 1 + 1,
        seeds = [&user.raffle_count.to_le_bytes(), signer.key().as_ref()],
        bump)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

//PDA de l'acheteur, créer avec le compteur de tickets venant du PDA Raffle et la PubKey de la Raffle
#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    #[account(init,
    payer = signer,
    space = 8 + 32 + 1,
    seeds = [&raffle.tickets_count.to_le_bytes(), raffle.key().as_ref()],
    bump,)]
    pub buyer: Account<'info, Buyer>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Draw<'info> {
    // je voudrais récuperer les donner de la raffle pour pouvoir les utiliser dans la fonction draw
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub buyer: Account<'info, Buyer>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct User {
    raffle_count: u32,
    win_count: u16,
}

#[account]
pub struct Raffle {
    seller: Pubkey,
    nft_id: Pubkey, //ou u32 ? Il faut regarder la struct d'un nft voir les infos necaissaires
    max_tickets: u32,
    ticket_price: u32,
    end_with_deadline: bool,
    tickets_count: u32,
    deadline: u32,
    raffle_in_progress: bool,
}

#[account]
pub struct Buyer {
    buyer_address: Pubkey,
}

#[error_code]
pub enum RaffleError {
    #[msg("You cannot participate in raffles of which you are the creator.")]
    SellerCantBeBuyer,
    #[msg("draw conditions not met")]
    RaffleNotEnded,
}

pub fn xorshift64(seed: u64) -> u64 {
    let mut x = seed;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    x
}
