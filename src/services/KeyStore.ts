/**
 * KeyStore - Secure storage for wallet private keys
 * Uses expo-secure-store to encrypt and persist keys on device
 */

import * as SecureStore from "expo-secure-store";

export class KeyStore {
  private readonly KEY_PREFIX = "wallet_key_";

  /**
   * Store a private key securely
   * @param publicKey - The wallet's public key (used as identifier)
   * @param privateKey - The private key bytes to store
   */
  async storeKey(publicKey: string, privateKey: Uint8Array): Promise<void> {
    try {
      const key = this.getStorageKey(publicKey);
      const privateKeyBase64 = this.uint8ArrayToBase64(privateKey);
      await SecureStore.setItemAsync(key, privateKeyBase64);
    } catch (error) {
      if (error instanceof Error && error.message.includes("quota")) {
        throw new Error("Storage quota exceeded. Cannot store more keys.");
      }
      throw new Error(
        `Failed to store key: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Retrieve a private key from secure storage
   * @param publicKey - The wallet's public key
   * @returns The private key bytes, or null if not found
   */
  async retrieveKey(publicKey: string): Promise<Uint8Array | null> {
    try {
      const key = this.getStorageKey(publicKey);
      const privateKeyBase64 = await SecureStore.getItemAsync(key);

      if (!privateKeyBase64) {
        return null;
      }

      return this.base64ToUint8Array(privateKeyBase64);
    } catch (error) {
      throw new Error(
        `Failed to retrieve key: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a private key from secure storage
   * @param publicKey - The wallet's public key
   */
  async deleteKey(publicKey: string): Promise<void> {
    try {
      const key = this.getStorageKey(publicKey);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(
        `Failed to delete key: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if a key exists in secure storage
   * @param publicKey - The wallet's public key
   * @returns True if the key exists, false otherwise
   */
  async hasKey(publicKey: string): Promise<boolean> {
    try {
      const key = this.getStorageKey(publicKey);
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate the storage key for a given public key
   */
  private getStorageKey(publicKey: string): string {
    return `${this.KEY_PREFIX}${publicKey}`;
  }

  /**
   * Convert Uint8Array to base64 string for storage
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }

  /**
   * Convert base64 string back to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// Export singleton instance
export const keyStore = new KeyStore();
