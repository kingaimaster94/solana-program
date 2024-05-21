import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getMint, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { assert } from "chai";

// Load the IDL
const idl = require('../target/idl/anchor_movie_review_program.json');

// Define the program ID from the declare_id macro
const programID = new anchor.web3.PublicKey('8GV99fB3sYy2rNaQSACYHcgkcUFh3egcFtdkDrW49mL2');

// Configure the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.getProvider();
const connection = provider.connection;

// Load the program
const program = new Program(idl, programID, provider);

// Function to find program-derived addresses (PDAs)
async function findPDA(seed: Buffer) {
  return await web3.PublicKey.findProgramAddress([seed], programID);
}

describe("anchor_movie_review_program", () => {
  const wallet = provider.wallet as anchor.Wallet;
  let mintKey: anchor.web3.PublicKey;
  let tokenAccount: anchor.web3.PublicKey;

  it("Initializes the token mint", async () => {
    const [mintPDA, mintBump] = await findPDA(Buffer.from("mint"));
    mintKey = mintPDA;

    await program.rpc.initializeTokenMint({
      accounts: {
        mint: mintPDA,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [],
    });

    const mintInfo = await getMint(connection, mintKey);
    assert.ok(mintInfo.supply.toString() == 0);
    assert.ok(mintInfo.decimals === 6);
  });

  it("Adds a movie review", async () => {
    const title = "Inception";
    const description = "Great Movie!";
    const rating = 5;

    const [reviewPDA, reviewBump] = await web3.PublicKey.findProgramAddress([Buffer.from(title), wallet.publicKey.toBuffer()], programID);

    // const [tokenAccountPDA, tokenAccountBump] = await findPDA(Buffer.from(wallet.publicKey.toString()));
    tokenAccount = await getAssociatedTokenAddress(
      mintKey,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    await program.rpc.addMovieReview(title, description, rating, {
      accounts: {
        movieReview: reviewPDA,
        initializer: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: mintKey,
        tokenAccount: tokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    });

    const movieReviewAccount = await program.account.movieAccountState.fetch(reviewPDA);
    assert.equal(movieReviewAccount.title, title);
    assert.equal(movieReviewAccount.description, description);
    assert.equal(movieReviewAccount.rating, rating);
  });

  it("Updates a movie review", async () => {
    const title = "Inception";
    const newDescription = "Mind-bending Movie!";
    const newRating = 4;

    const [reviewPDA, reviewBump] = await web3.PublicKey.findProgramAddress([Buffer.from(title), wallet.publicKey.toBuffer()], programID);

    await program.rpc.updateMovieReview(title, newDescription, newRating, {
      accounts: {
        movieReview: reviewPDA,
        initializer: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [],
    });

    const movieReviewAccount = await program.account.movieAccountState.fetch(reviewPDA);
    assert.equal(movieReviewAccount.title, title);
    assert.equal(movieReviewAccount.description, newDescription);
    assert.equal(movieReviewAccount.rating, newRating);
  });

  it("Deletes a movie review", async () => {
    const title = "Inception";

    const [reviewPDA, reviewBump] = await web3.PublicKey.findProgramAddress([Buffer.from(title), wallet.publicKey.toBuffer()], programID);

    await program.rpc.deleteMovieReview(title, {
      accounts: {
        movieReview: reviewPDA,
        initializer: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [],
    });

    try {
      await program.account.movieAccountState.fetch(reviewPDA);
      assert.fail("Account should be closed");
    } catch (err) {
      assert.equal(err.message, "Account does not exist " + reviewPDA.toString());
    }
  });
});