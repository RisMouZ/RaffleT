use anchor_lang::prelude::*;

declare_id!("93aVSKUUHf7Jyz7qMbK1qMgWG1ZMge1D3hoHtv7tdCJy");

#[program]
pub mod raffle_t {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
