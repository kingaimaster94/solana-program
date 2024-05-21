use anchor_lang::{ prelude::*, solana_program::sysvar::instructions };
use anchor_spl::{
    associated_token::{ AssociatedToken },
    mint,
    token::{ Mint, mint_to, MintTo, Token, TokenAccount },
    token_2022::spl_token_2022::extension::AccountType,
};

declare_id!("8GV99fB3sYy2rNaQSACYHcgkcUFh3egcFtdkDrW49mL2");

#[program]
pub mod anchor_movie_review_program {
    use super::*;

    pub fn initialize_token_mint(ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Token mint initialized");
        Ok(())
    }

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, MovieReviewError::InvalidRating);
        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.mint.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                },
                &[&["mint".as_bytes(), &[ctx.bumps.mint]]]
            ),
            10 * (10 ^ 6)
        )?;
        msg!("Minted tokens!");
        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8
    ) -> Result<()> {
        msg!("Movie Review Account Updated");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);
        require!(rating >= 1 && rating <= 5, MovieReviewError::InvalidRating);
        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;
        Ok(())
    }

    pub fn delete_movie_review(ctx: Context<DeleteMovieReview>, title: String) -> Result<()> {
        msg!("Movie Review Account Deleted");
        msg!("Title: {}", title);
        Ok(())
    }
}

#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + 4 + description.len()
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
    #[account(seeds = ["mint".as_bytes()], bump, mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct UpdateMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = 8 +32 + 1 + 4+ title.len() + 4 +description.len(),
        realloc::payer = initializer,
        realloc:: zero = true,
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        close = initializer,
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        seeds = ["mint".as_bytes()],
        bump,
        payer = user,
        mint::authority = mint,
        mint::decimals = 6
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[error_code]
enum MovieReviewError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
}
