# solana-program
SPL Token, account, swap
## dapp
### generate-keypair
@solana/web3.js, typescript
#### create&build
mkdir generate-keypair
cd generate-keypair
npm init -y
npm install typescript @solana/web3.js esrun @solana-developers/helpers

make generate-keypair.ts

npx esrun generate-keypair.ts

# from scratch to expert
Solana program is composed of 2 fields: on-chain program and client-side program.
On-chain program is created using Rust, C, C++, Python. But I recommend Rust.
Specially importance is Anchor. This is the framework that use Rust.
Client-side program is created using various language you prefer.
