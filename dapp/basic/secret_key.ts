const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

// Function to load keypair from JSON file
function loadKeypairFromFile(filePath) {
    const secretKeyString = fs.readFileSync(filePath, 'utf8');
    const secretKeyArray = JSON.parse(secretKeyString);
    return Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
}

// Path to the JSON file
const filePath = './keypair1.json';

// Load keypair
const keypair = loadKeypairFromFile(filePath);

// Extract and print the secret key
console.log('Public Key:', keypair.publicKey);

// Convert the secret key to a string format (hexadecimal)
const secretKeyHex = Buffer.from(keypair.secretKey).toString('hex');

// Alternatively, convert the secret key to a base64 string
const secretKeyBase64 = Buffer.from(keypair.secretKey).toString('base64');

// Print the secret key in the desired string format
console.log('Secret Key (Hex):', secretKeyHex);
console.log('Secret Key (Base64):', secretKeyBase64);
