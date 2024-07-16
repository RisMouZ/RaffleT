use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("");

#[program]
mod raffle_t {
    use super::*;

    pub fn create_raffle(ctx: Context<CreateRaffle>) -> Result<()> {
        // require!();

        let raffle_account = &mut ctx.accounts.raffle;

        let seller_account = &mut ctx.accounts.seller;

        msg!("Raffle created!",);
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, amount: u64) -> Result<()> {
        //require!();

        
        let raffle_account = &mut ctx.accounts.raffle;
        let buyer_account = &mut ctx.accounts.buyer;
        //let raffle_vault = &mut ctx.accounts.raffle_vault;
        

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.raffle_vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        msg!("{} Ticket/s purchased!", amount);
        Ok(())
    }

    pub fn increment_raffle_count(ctx: Context<RaffleCount>) -> Result<()> {
        let raffle_count = &mut ctx.accounts.raffle_count;
        raffle_count.count += 1;

        msg!("Raffle count incremented to: {}!", raffle_count.count);
        Ok(())
    }

    pub fn raffle(ctx: Context<RaffleContext>) -> Result<()> {
        //require!();

        let raffle_account = &mut ctx.accounts.raffle;
        let seller_account = &mut ctx.accounts.seller;
        let buyer_account = &mut ctx.accounts.buyer;
        let ticket_account = &mut ctx.accounts.ticket;
        //let raffle_vault = &mut ctx.accounts.raffle_vault;

        msg!("",);
        Ok(())
    }

    pub fn finalize_raffle(ctx: Context<RaffleContext>) -> Result<()> {
        //require!();

        let raffle_account = &mut ctx.accounts.raffle;
        let seller_account = &mut ctx.accounts.seller;
        let winner_account = &mut ctx.accounts.buyer;
        let ticket_winner_account = &mut ctx.accounts.ticket;

        msg!("Raffle finalized!");
        Ok(())
    }
}

// PDA Seller + Déclaration du PDA NfT en vente
#[derive(Accounts)]
pub struct CreateRaffle<'info> {
    #[account(init, payer = signer, space = 8 + 1)]
    pub seller: Account<'info, Seller>,

    #[account(init, payer = signer, space = 8 + 1)] // seeds
    pub raffle: Account<'info, Raffle>,

    /*#[account(init, payer = signer, space = 8 + 1)] // seeds
    pub raffle_vault: Account<'info, Raffle>,*/

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// PDA Buyer
#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(init, payer = user, space = 8 + 1)] // seeds
    pub buyer: Account<'info, Buyer>,

    #[account(init, payer = user, space = 8 + 1)] // seeds
    pub ticket: Account<'info, Ticket>,

    #[account(init, payer = signer, space = 8 + 1)] // seeds
    pub raffle: Account<'info, Raffle>,

    #[account(mut)]
    pub user: Signer<'info>,

    /* #[account(mut)]
    pub raffle_vault: AccountInfo<'info>,*/ 
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RaffleCount<'info> {
    #[account(init, payer = signer, space = 8 + 1)] // seeds
    pub raffle_count: Account<'info, Count>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RaffleContext<'info> {
    #[account(mut)] // seeds
    pub seller: Account<'info, Seller>,

    #[account(mut)] // seeds
    pub raffle: Account<'info, Raffle>,

    #[account(mut)] // seeds
    pub buyer: Account<'info, Buyer>,

    #[account(mut)] // seeds
    pub ticket: Account<'info, Ticket>,

    /*#[account(mut)] // seeds
    pub raffle_vault: Account<'info, Raffle>,*/

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Seller {
    pub seller_name: String,
    pub seller_id: Pubkey,
    pub sold_asset: Vec<Raffle>,
    pub sell_price: u16,
    pub raffle_deadline: u16,
    pub ticket_number: u16,
}

#[account]
pub struct Buyer {
    pub buyer_name: String,
    pub buyer_id: Pubkey,
    pub purchased_asset: Vec<Raffle>,
    pub tickets: Vec<Ticket>,
}

#[account]
pub struct Raffle {
    pub raffle_id: Pubkey,
    pub raffle_name: String,
    pub raffle_status_on: bool,
    pub raffle_transfert_to_seller: bool,
    pub raffle_transfert_to_winner: bool,
    pub balance: u16,
}

#[account]
pub struct Ticket {
    pub ticket_price: u16,
    pub ticket_id: Pubkey,
    pub ticket_status: bool,
    pub ticket_count: u16,
}

#[account]
pub struct Count {
    pub count: u16,
}

#[error_code]
pub enum ErrorCode {
    #[msg("All tickets are sold")]
    AllTicketsSold,
    
}
