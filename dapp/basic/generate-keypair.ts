import { Keypair } from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
const bs58 = require('bs58');
const fs = require('fs');

// let secretKey = bs58.decode("5ajB9acmLaKU39daFrv3TYpTU8F3i647dLvvrXHt8B8jGfY2src1iEEpna6Sr1r3X2CyfdZEhDH8n7Tc88XegMVW");
// console.log('The secret key is: ', secretKey);

const b = false;
if (b) {
    const keypair = Keypair.generate();
    console.log('✅ generated keypair!');
    console.log('The public key is: ', keypair.publicKey.toBase58());
    const secretKeyBase64 = Buffer.from(keypair.secretKey).toString('base64');
    fs.writeFileSync("phantom-secret.txt", secretKeyBase64, 'utf8');

    // console.log(secretKeyBase64);
    console.log(`✅ Finished!`);
} else {
    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    console.log('The public key is: ', keypair.publicKey.toBase58());
    console.log('The secret key is: ', keypair.secretKey);
    console.log(
        `✅ Finished! We've loaded our secret key securely, using an env file!`
    );
}

