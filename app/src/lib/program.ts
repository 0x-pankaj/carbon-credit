import { type AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { type Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

// Your deployed program ID
export const PROGRAM_ID = new PublicKey(
  "CJaPicvVzxBFrXccJQ7EtTNKPy8azXdtciXCfzPsK5aj"
);

// Program IDL based on your contract
export const IDL = {
  address: "CJaPicvVzxBFrXccJQ7EtTNKPy8azXdtciXCfzPsK5aj",
  metadata: {
    name: "carbon_credit",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "initialize_mint",
      discriminator: [209, 42, 195, 4, 129, 85, 209, 44],
      accounts: [
        { name: "mint", writable: true, signer: true },
        { name: "payer", writable: true, signer: true },
        { name: "authority", signer: true },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111",
        },
      ],
      args: [],
    },
    {
      name: "issue_tokens",
      discriminator: [40, 207, 145, 106, 249, 54, 23, 179],
      accounts: [
        { name: "mint", writable: true },
        { name: "recipient_token_account", writable: true },
        { name: "authority", writable: true, signer: true },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "transfer_tokens",
      discriminator: [54, 180, 238, 175, 74, 85, 126, 188],
      accounts: [
        { name: "from_token_account", writable: true },
        { name: "to_token_account", writable: true },
        { name: "owner", signer: true },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAmount",
      msg: "Invalid amount: must be greater than 0",
    },
  ],
};

export interface CarbonCreditProgram {
  initializeMint(): Promise<{ mint: PublicKey; signature: string }>;
  issueTokens(
    mint: PublicKey,
    recipient: PublicKey,
    amount: number
  ): Promise<string>;
  transferTokens(
    mint: PublicKey,
    from: PublicKey,
    to: PublicKey,
    amount: number
  ): Promise<string>;
}

export class CarbonCreditService implements CarbonCreditProgram {
  constructor(
    private connection: Connection,
    private wallet: any,
    private provider: AnchorProvider
  ) {}

  async initializeMint(): Promise<{ mint: PublicKey; signature: string }> {
    const mintKeypair = web3.Keypair.generate();

    const tx = new web3.Transaction();

    // Add create mint account instruction
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      82
    );

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    const signature = await this.provider.sendAndConfirm(tx, [mintKeypair]);

    return {
      mint: mintKeypair.publicKey,
      signature,
    };
  }

  async issueTokens(
    mint: PublicKey,
    recipient: PublicKey,
    amount: number
  ): Promise<string> {
    // Get or create associated token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mint,
      recipient
    );

    const tx = new web3.Transaction();

    // Check if token account exists, if not create it
    try {
      await this.connection.getAccountInfo(recipientTokenAccount);
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey,
          recipientTokenAccount,
          recipient,
          mint
        )
      );
    }

    // Convert amount to proper decimals (6 decimals as per your contract)
    const amountBN = new BN(amount * Math.pow(10, 6));

    // This would be replaced with actual program instruction
    // For now, we'll simulate the transaction
    const signature = await this.provider.sendAndConfirm(tx);

    return signature;
  }

  async transferTokens(
    mint: PublicKey,
    from: PublicKey,
    to: PublicKey,
    amount: number
  ): Promise<string> {
    const fromTokenAccount = await getAssociatedTokenAddress(mint, from);
    const toTokenAccount = await getAssociatedTokenAddress(mint, to);

    const tx = new web3.Transaction();

    // Check if destination token account exists, if not create it
    try {
      await this.connection.getAccountInfo(toTokenAccount);
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey,
          toTokenAccount,
          to,
          mint
        )
      );
    }

    const amountBN = new BN(amount * Math.pow(10, 6));

    // This would be replaced with actual program instruction
    const signature = await this.provider.sendAndConfirm(tx);

    return signature;
  }
}
