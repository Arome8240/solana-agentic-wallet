/**
 * IStrategy - Interface for agent trading strategies
 * All strategies must implement this interface
 */

import { AgentStrategy } from "../types";

export interface StrategyAction {
  type: "trade" | "wait" | "liquidity";
  details: {
    action?: "buy" | "sell" | "add" | "remove";
    amount?: number;
    token?: string;
    reason: string;
  };
}

export interface MarketConditions {
  timestamp: Date;
  price: number;
  volume: number;
  trend: "up" | "down" | "sideways";
}

export interface IStrategy {
  /**
   * Evaluate market conditions and decide on an action
   * @param conditions - Current market conditions
   * @param walletBalance - Current wallet balance in SOL
   * @returns The action to take
   */
  evaluate(conditions: MarketConditions, walletBalance: number): StrategyAction;

  /**
   * Get the strategy configuration
   * @returns AgentStrategy configuration
   */
  getConfig(): AgentStrategy;
}
