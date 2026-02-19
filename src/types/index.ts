/**
 * Core type definitions for the Solana Agentic Wallet application
 */

// Wallet related types
export interface WalletInfo {
  publicKey: string;
  createdAt: Date;
  balance: number;
  tokenBalances: TokenBalance[];
}

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

// Agent related types
export interface Agent {
  id: string;
  walletPublicKey: string;
  strategy: AgentStrategy;
  status: "active" | "paused" | "stopped";
  activityLog: AgentActivity[];
}

export interface AgentStrategy {
  type: "simple-trader" | "liquidity-provider" | "arbitrage";
  parameters: Record<string, any>;
}

export interface AgentActivity {
  timestamp: Date;
  action: string;
  decision: string;
  transactionSignature?: string;
  result: "success" | "failure";
}

// Transaction related types
export interface TransactionRecord {
  signature: string;
  timestamp: Date;
  from: string;
  to?: string;
  amount?: number;
  type: "transfer" | "swap" | "liquidity" | "other";
  status: "pending" | "confirmed" | "failed";
  agentId?: string;
}

// State types
export interface WalletState {
  wallets: Map<string, WalletInfo>;
  selectedWalletPublicKey: string | null;
}

export interface AgentState {
  agents: Map<string, Agent>;
  activeAgentIds: Set<string>;
}
