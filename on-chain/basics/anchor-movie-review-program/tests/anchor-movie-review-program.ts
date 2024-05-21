import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program";
import { expect } from "chai";
import { PublicKey, SystemProgram } from "@solana/web3.js";


describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>;

  const provider = anchor.getProvider();

  const wallet = provider.wallet;
  const initializer = wallet.publicKey;

  const movie = {
    title: "Just a test movie",
    description: "Wow what a good movie it was real great",
    rating: 5,
  }

  const [moviePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), wallet.publicKey.toBuffer()],
    program.programId
  )

  it("Movie review is added!", async () => {
    // Add your test here.
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        movieReview: moviePda,
        initializer,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(account.title).to.equal(movie.title)
    expect(account.rating).to.equal(movie.rating)
    expect(account.description).to.equal(movie.description)
    expect(account.reviewer.toBase58()).to.equal(provider.wallet.publicKey.toBase58())
  });

  it("Movie review is updated!", async () => {
    // Add your test here.
    const newDescription = "Wow this is new"
    const newRating = 4

    const tx = await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .accounts({
        movieReview: moviePda,
        initializer,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(account.title).to.equal(movie.title)
    expect(account.rating).to.equal(newRating)
    expect(account.description).to.equal(newDescription)
    expect(account.reviewer.toBase58()).to.equal(wallet.publicKey.toBase58())
  });

  it("Deletes a movie review!", async () => {
    // Add your test here.
    const tx = await program.methods
      .deleteMovieReview(movie.title)
      .accounts({
        movieReview: moviePda,
        initializer,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
