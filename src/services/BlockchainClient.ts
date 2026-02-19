/**
 * BlockchainClient - Handles all interactions with Solana devnet
 * Manages connections, balance queries, and transaction submission
 */

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenBalance } from "../types";

export class BlockchainClient {
  private connection: Connection;
  private readonly DEVNET_URL = clusterApiUrl("devnet");
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.connection = new Connection(this.DEVNET_URL, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: this.REQUEST_TIMEOUT,
    });
  }

  /**
   * Get SOL balance for a wallet
   * @param publicKey - The wallet's public key as string
   * @returns Balance in SOL
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubKey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error("Network timeout while fetching balance");
      }
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get SPL token balances for a wallet
   * @param publicKey - The wallet's public key as string
   * @returns Array of token balances
   */
  async getTokenBalances(publicKey: string): Promise<TokenBalance[]> {
    try {
      const pubKey = new PublicKey(publicKey);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubKey,
        { programId: TOKEN_PROGRAM_ID },
      );

      return tokenAccounts.value.map((accountInfo) => {
        const parsedInfo = accountInfo.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          amount: parsedInfo.tokenAmount.uiAmount || 0,
          decimals: parsedInfo.tokenAmount.decimals,
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error("Network timeout while fetching token balances");
      }
      throw new Error(
        `Failed to get token balances: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Request airdrop from Solana devnet faucet
   * @param publicKey - The wallet's public key as string
   * @param amount - Amount of SOL to request (default 1 SOL)
   * @returns Transaction signature
   */
  async requestAirdrop(publicKey: string, amount: number = 1): Promise<string> {
    try {
      const pubKey = new PublicKey(publicKey);
      const lamports = amount * LAMPORTS_PER_SOL;

      const signature = await this.connection.requestAirdrop(pubKey, lamports);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, "confirmed");

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error("Airdrop request timed out. Please try again.");
        }
        if (error.message.includes("rate limit")) {
          throw new Error(
            "Airdrop rate limit exceeded. Please wait and try again.",
          );
        }
      }
      throw new Error(
        `Airdrop failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Submit a signed transaction to the blockchain
   * @param transaction - The signed transaction
   * @returns Transaction signature
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    try {
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        },
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, "confirmed");

      return signature;
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error("Transaction submission timed out");
      }
      throw new Error(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get the current connection
   * @returns The Solana connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Check if an account exists on the blockchain
   * @param publicKey - The account's public key as string
   * @returns True if account exists, false otherwise
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      const pubKey = new PublicKey(publicKey);
      const accountInfo = await this.connection.getAccountInfo(pubKey);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const blockchainClient = new BlockchainClient();
