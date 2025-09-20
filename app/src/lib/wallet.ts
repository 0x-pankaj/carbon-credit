import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Connection, clusterApiUrl } from "@solana/web3.js";

// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
const network = WalletAdapterNetwork.Devnet;

// You can also provide a custom RPC endpoint
export const endpoint = clusterApiUrl(network);

export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  new TorusWalletAdapter(),
];

export const connection = new Connection(endpoint);
