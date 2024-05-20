import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect, assert } from "chai";
import { AnchorCounter } from "../target/types/anchor_counter";
import { SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("anchor-counter", () => {
  // Configure the client to use the local cluster.

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorCounter as Program<AnchorCounter>;

  // Generate a keypair for the counter account
  const counter = anchor.web3.Keypair.generate();

  const provider = anchor.getProvider();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([counter])
      .rpc();

    // Fetch the account details to check the initialization
    const account = await program.account.counter.fetch(counter.publicKey);
    assert.ok(account.count.toNumber() === 0);
    console.log("Your transaction signature", tx);
  });

  it("Is increment!", async () => {
    // Add your test here.
    const tx = await program.methods.increment()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey
      })
      .rpc();
    // Fetch the account details to check the increment
    const account = await program.account.counter.fetch(counter.publicKey);
    assert.ok(account.count.toNumber() === 1);
    console.log("Your transaction signature", tx);
  });
});
