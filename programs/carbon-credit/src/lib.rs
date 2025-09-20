use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("CJaPicvVzxBFrXccJQ7EtTNKPy8azXdtciXCfzPsK5aj");

#[program]
pub mod carbon_credit {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Carbon Credit Token Mint Initialized");
        Ok(())
    }

    pub fn issue_tokens(ctx: Context<IssueTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, CarbonCreditError::InvalidAmount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );

        token::mint_to(cpi_ctx, amount)?;
        msg!("Issued {} carbon credit tokens", amount);
        Ok(())
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, CarbonCreditError::InvalidAmount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_token_account.to_account_info(),
                to: ctx.accounts.to_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );

        token::transfer(cpi_ctx, amount)?;
        msg!("Transferred {} carbon credit tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct IssueTokens<'info> {
    #[account(
        mut,
        constraint = mint.mint_authority.unwrap() == authority.key()
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = recipient_token_account.mint == mint.key()
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(
        mut,
        constraint = from_token_account.owner == owner.key()
    )]
    pub from_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = to_token_account.mint == from_token_account.mint
    )]
    pub to_token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum CarbonCreditError {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
}
