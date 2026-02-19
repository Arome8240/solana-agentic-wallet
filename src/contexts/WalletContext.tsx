/**
 * WalletContext - Global state management for wallets
 * Provides wallet state and actions to all components
 */

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { WalletInfo } from "../types";
import { walletManager } from "../services/WalletManager";
import { blockchainClient } from "../services/BlockchainClient";

// State type
interface WalletState {
  wallets: WalletInfo[];
  selectedWalletPublicKey: string | null;
  loading: boolean;
  error: string | null;
}

// Action types
type WalletAction =
  | { type: "SET_WALLETS"; payload: WalletInfo[] }
  | { type: "ADD_WALLET"; payload: WalletInfo }
  | { type: "UPDATE_WALLET"; payload: WalletInfo }
  | { type: "SELECT_WALLET"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: WalletState = {
  wallets: [],
  selectedWalletPublicKey: null,
  loading: false,
  error: null,
};

// Reducer
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "SET_WALLETS":
      return { ...state, wallets: action.payload };
    case "ADD_WALLET":
      return { ...state, wallets: [...state.wallets, action.payload] };
    case "UPDATE_WALLET":
      return {
        ...state,
        wallets: state.wallets.map((w) =>
          w.publicKey === action.payload.publicKey ? action.payload : w,
        ),
      };
    case "SELECT_WALLET":
      return { ...state, selectedWalletPublicKey: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context type
interface WalletContextType {
  state: WalletState;
  createWallet: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  refreshBalance: (publicKey: string) => Promise<void>;
  selectWallet: (publicKey: string | null) => void;
  fundWallet: (publicKey: string, amount?: number) => Promise<void>;
  clearError: () => void;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  /**
   * Create a new wallet
   */
  const createWallet = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const wallet = await walletManager.createWallet();
      dispatch({ type: "ADD_WALLET", payload: wallet });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create wallet";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Refresh all wallets from wallet manager
   */
  const refreshWallets = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const wallets = await walletManager.getAllWallets();

      // Refresh balances for all wallets
      const walletsWithBalances = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const balance = await blockchainClient.getBalance(wallet.publicKey);
            const tokenBalances = await blockchainClient.getTokenBalances(
              wallet.publicKey,
            );
            return { ...wallet, balance, tokenBalances };
          } catch (error) {
            console.error(
              `Failed to refresh balance for ${wallet.publicKey}:`,
              error,
            );
            return wallet;
          }
        }),
      );

      dispatch({ type: "SET_WALLETS", payload: walletsWithBalances });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh wallets";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Refresh balance for a specific wallet
   */
  const refreshBalance = async (publicKey: string) => {
    try {
      const balance = await blockchainClient.getBalance(publicKey);
      const tokenBalances = await blockchainClient.getTokenBalances(publicKey);

      const wallet = state.wallets.find((w) => w.publicKey === publicKey);
      if (wallet) {
        const updatedWallet = { ...wallet, balance, tokenBalances };
        dispatch({ type: "UPDATE_WALLET", payload: updatedWallet });
        await walletManager.updateBalance(publicKey, balance);
        await walletManager.updateTokenBalances(publicKey, tokenBalances);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh balance";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  /**
   * Select a wallet
   */
  const selectWallet = (publicKey: string | null) => {
    dispatch({ type: "SELECT_WALLET", payload: publicKey });
  };

  /**
   * Fund a wallet from devnet faucet
   */
  const fundWallet = async (publicKey: string, amount: number = 1) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      await blockchainClient.requestAirdrop(publicKey, amount);

      // Wait a bit for the transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh balance
      await refreshBalance(publicKey);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fund wallet";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: WalletContextType = {
    state,
    createWallet,
    refreshWallets,
    refreshBalance,
    selectWallet,
    fundWallet,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
