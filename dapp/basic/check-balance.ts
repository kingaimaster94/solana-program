import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const publickey = new PublicKey("HGTGTnvisMt4pvcP3h3Z6LP732PewGqqgKY6UkLxB5qW");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const balanceInLamports = await connection.getBalance(publickey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
    `💰 Finished! The balance for the wallet at address ${publickey} is ${balanceInSOL}!`
);