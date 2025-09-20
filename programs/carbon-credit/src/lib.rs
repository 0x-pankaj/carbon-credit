use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("CJaPicvVzxBFrXccJQ7EtTNKPy8azXdtciXCfzPsK5aj");

// Constants
const CC_TOKEN_DECIMALS: u8 = 4; // 10000 tokens per ton
const TOKENS_PER_TON: u64 = 10_000;

#[program]
pub mod carbon_credit {
    use super::*;

    // Initialize the program
    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.admin = admin;
        program_state.total_certificates = 0;
        program_state.total_tokens_minted = 0;
        program_state.is_initialized = true;

        msg!(
            "Carbon Credit MVP Program initialized with admin: {}",
            admin
        );
        Ok(())
    }

    // Submit carbon credit certificate and mint tokens
    pub fn submit_certificate(
        ctx: Context<SubmitCertificate>,
        certificate_number: String,
        tons_amount: u64,
    ) -> Result<()> {
        require!(tons_amount > 0, CarbonCreditError::InvalidAmount);
        require!(
            certificate_number.len() > 0,
            CarbonCreditError::InvalidCertificate
        );
        require!(
            certificate_number.len() <= 50,
            CarbonCreditError::CertificateNumberTooLong
        );

        let certificate = &mut ctx.accounts.certificate;
        let program_state = &mut ctx.accounts.program_state;

        // Store certificate information
        certificate.certificate_number = certificate_number.clone();
        certificate.owner = ctx.accounts.user.key();
        certificate.tons_amount = tons_amount;
        certificate.tokens_minted = tons_amount * TOKENS_PER_TON;
        certificate.timestamp = Clock::get()?.unix_timestamp;
        certificate.is_active = true;

        // Update program state
        program_state.total_certificates += 1;
        program_state.total_tokens_minted += certificate.tokens_minted;

        // Mint tokens to user
        let cpi_accounts = MintTo {
            mint: ctx.accounts.cc_token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let seeds = &[b"mint_authority".as_ref(), &[ctx.bumps.mint_authority]];
        let signer = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, certificate.tokens_minted)?;

        msg!(
            "Certificate {} submitted: {} tons = {} CC tokens minted to {}",
            certificate_number,
            tons_amount,
            certificate.tokens_minted,
            ctx.accounts.user.key()
        );

        Ok(())
    }

    // Transfer tokens between users (P2P trading)
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, CarbonCreditError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!(
            "Transferred {} CC tokens from {} to {}",
            amount,
            ctx.accounts.from_authority.key(),
            ctx.accounts.to_token_account.owner
        );

        Ok(())
    }

    // Burn tokens (for offset/retirement)
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, CarbonCreditError::InvalidAmount);

        let cpi_accounts = Burn {
            mint: ctx.accounts.cc_token_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::burn(cpi_ctx, amount)?;

        let program_state = &mut ctx.accounts.program_state;
        program_state.total_tokens_burned =
            program_state.total_tokens_burned.saturating_add(amount);

        msg!("Burned {} CC tokens for carbon offset", amount);
        Ok(())
    }

    // Admin function to deactivate a certificate
    pub fn deactivate_certificate(ctx: Context<DeactivateCertificate>) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.program_state.admin,
            CarbonCreditError::Unauthorized
        );

        let certificate = &mut ctx.accounts.certificate;
        certificate.is_active = false;

        msg!(
            "Certificate {} deactivated by admin",
            certificate.certificate_number
        );

        Ok(())
    }

    // Get certificate info (view function)
    pub fn get_certificate_info(ctx: Context<GetCertificateInfo>) -> Result<()> {
        let certificate = &ctx.accounts.certificate;

        msg!(
            "Certificate: {}, Owner: {}, Tons: {}, Tokens: {}, Active: {}",
            certificate.certificate_number,
            certificate.owner,
            certificate.tons_amount,
            certificate.tokens_minted,
            certificate.is_active
        );

        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + ProgramState::INIT_SPACE,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init,
        payer = admin,
        mint::decimals = CC_TOKEN_DECIMALS,
        mint::authority = mint_authority,
        seeds = [b"cc_token_mint"],
        bump
    )]
    pub cc_token_mint: Account<'info, Mint>,

    /// CHECK: PDA for mint authority
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(certificate_number: String)]
pub struct SubmitCertificate<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + CarbonCertificate::INIT_SPACE,
        seeds = [b"certificate", certificate_number.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, CarbonCertificate>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        mut,
        seeds = [b"cc_token_mint"],
        bump
    )]
    pub cc_token_mint: Account<'info, Mint>,

    /// CHECK: PDA for mint authority
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = cc_token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(
        mut,
        associated_token::mint = cc_token_mint,
        associated_token::authority = from_authority,
    )]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = cc_token_mint,
        associated_token::authority = to_authority
    )]
    pub to_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"cc_token_mint"],
        bump
    )]
    pub cc_token_mint: Account<'info, Mint>,

    pub from_authority: Signer<'info>,
    pub to_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"cc_token_mint"],
        bump
    )]
    pub cc_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = cc_token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeactivateCertificate<'info> {
    #[account(
        mut,
        seeds = [b"certificate", certificate.certificate_number.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, CarbonCertificate>,

    #[account(
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCertificateInfo<'info> {
    #[account(
        seeds = [b"certificate", certificate.certificate_number.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, CarbonCertificate>,
}

// Data Structures
#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub admin: Pubkey,
    pub total_certificates: u64,
    pub total_tokens_minted: u64,
    pub total_tokens_burned: u64,
    pub is_initialized: bool,
}

#[account]
#[derive(InitSpace)]
pub struct CarbonCertificate {
    #[max_len(50)]
    pub certificate_number: String,
    pub owner: Pubkey,
    pub tons_amount: u64,
    pub tokens_minted: u64,
    pub timestamp: i64,
    pub is_active: bool,
}

// Error Handling
#[error_code]
pub enum CarbonCreditError {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Invalid certificate number")]
    InvalidCertificate,
    #[msg("Certificate number too long")]
    CertificateNumberTooLong,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Certificate already exists")]
    CertificateExists,
    #[msg("Certificate not found")]
    CertificateNotFound,
    #[msg("Certificate is not active")]
    CertificateNotActive,
}
