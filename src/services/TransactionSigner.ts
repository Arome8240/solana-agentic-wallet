/**
 * TransactionSigner - Signs and submits transactions on behalf of agents
 * Retrieves keys from KeyStore and coordinates with BlockchainClient
 */

import { Transaction } from "@solana/web3.js";
import { keyStore } from "./KeyStore";
import { blockchainClient } from "./BlockchainClient";
import { walletManager } from "./WalletManager";

export class TransactionSigner {
  /**
   * Sign a transaction with the wallet's private key
   * @param transaction - The transaction to sign
   * @param publicKey - The wallet's public key
   * @returns The signed transaction
   */
  async signTransaction(
    transaction: Transaction,
    publicKey: string,
  ): Promise<Transaction> {
    try {
      // Retrieve the keypair from secure storage
      const keypair = await walletManager.getKeypair(publicKey);

      if (!keypair) {
        const error = new Error(
          `Private key not found for wallet: ${publicKey}`,
        );
        console.error("[TransactionSigner] Key not found:", publicKey);
        throw error;
      }

      // Sign the transaction
      transaction.sign(keypair);

      return transaction;
    } catch (error) {
      const errorMessage = `Failed to sign transaction: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("[TransactionSigner]", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign and send a transaction to the blockchain
   * @param transaction - The transaction to sign and send
   * @param publicKey - The wallet's public key
   * @returns Transaction signature
   */
  async signAndSendTransaction(
    transaction: Transaction,
    publicKey: string,
  ): Promise<string> {
    try {
      // Sign the transaction
      const signedTransaction = await this.signTransaction(
        transaction,
        publicKey,
      );

      // Submit to blockchain
      const signature =
        await blockchainClient.sendTransaction(signedTransaction);

      console.log(
        "[TransactionSigner] Transaction sent successfully:",
        signature,
      );
      return signature;
    } catch (error) {
      const errorMessage = `Failed to sign and send transaction: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("[TransactionSigner]", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign multiple transactions with the same wallet
   * @param transactions - Array of transactions to sign
   * @param publicKey - The wallet's public key
   * @returns Array of signed transactions
   */
  async signTransactions(
    transactions: Transaction[],
    publicKey: string,
  ): Promise<Transaction[]> {
    try {
      const keypair = await walletManager.getKeypair(publicKey);

      if (!keypair) {
        throw new Error(`Private key not found for wallet: ${publicKey}`);
      }

      // Sign all transactions
      const signedTransactions = transactions.map((tx) => {
        tx.sign(keypair);
        return tx;
      });

      return signedTransactions;
    } catch (error) {
      const errorMessage = `Failed to sign transactions: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("[TransactionSigner]", errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export const transactionSigner = new TransactionSigner();
