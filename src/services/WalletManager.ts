/**
 * WalletManager - Manages wallet creation and keypair operations
 * Coordinates with KeyStore for secure key storage
 */

import { Keypair } from "@solana/web3.js";
import { keyStore } from "./KeyStore";
import { WalletInfo, TokenBalance } from "../types";

export class WalletManager {
  private wallets: Map<string, WalletInfo> = new Map();

  /**
   * Create a new wallet with a unique keypair
   * @returns WalletInfo containing the public key and initial state
   */
  async createWallet(): Promise<WalletInfo> {
    // Generate new Solana keypair
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();

    // Store private key securely
    await keyStore.storeKey(publicKey, keypair.secretKey);

    // Create wallet info with zero balance
    const walletInfo: WalletInfo = {
      publicKey,
      createdAt: new Date(),
      balance: 0,
      tokenBalances: [],
    };

    // Store in memory
    this.wallets.set(publicKey, walletInfo);

    return walletInfo;
  }

  /**
   * Get wallet information by public key
   * @param publicKey - The wallet's public key
   * @returns WalletInfo or null if not found
   */
  async getWallet(publicKey: string): Promise<WalletInfo | null> {
    return this.wallets.get(publicKey) || null;
  }

  /**
   * Get all wallets
   * @returns Array of all WalletInfo objects
   */
  async getAllWallets(): Promise<WalletInfo[]> {
    return Array.from(this.wallets.values());
  }

  /**
   * Update wallet balance
   * @param publicKey - The wallet's public key
   * @param balance - New balance in lamports
   */
  async updateBalance(publicKey: string, balance: number): Promise<void> {
    const wallet = this.wallets.get(publicKey);
    if (wallet) {
      wallet.balance = balance;
      this.wallets.set(publicKey, wallet);
    }
  }

  /**
   * Update wallet token balances
   * @param publicKey - The wallet's public key
   * @param tokenBalances - Array of token balances
   */
  async updateTokenBalances(
    publicKey: string,
    tokenBalances: TokenBalance[],
  ): Promise<void> {
    const wallet = this.wallets.get(publicKey);
    if (wallet) {
      wallet.tokenBalances = tokenBalances;
      this.wallets.set(publicKey, wallet);
    }
  }

  /**
   * Get the keypair for a wallet (retrieves from secure storage)
   * @param publicKey - The wallet's public key
   * @returns Keypair or null if not found
   */
  async getKeypair(publicKey: string): Promise<Keypair | null> {
    const privateKey = await keyStore.retrieveKey(publicKey);
    if (!privateKey) {
      return null;
    }

    return Keypair.fromSecretKey(privateKey);
  }

  /**
   * Delete a wallet and its keys
   * @param publicKey - The wallet's public key
   */
  async deleteWallet(publicKey: string): Promise<void> {
    await keyStore.deleteKey(publicKey);
    this.wallets.delete(publicKey);
  }
}

// Export singleton instance
export const walletManager = new WalletManager();
