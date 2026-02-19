/**
 * SimpleTraderStrategy - Basic trading strategy for demonstration
 * Buys when price is low, sells when price is high
 */

import { IStrategy, StrategyAction, MarketConditions } from "./IStrategy";
import { AgentStrategy } from "../types";

export class SimpleTraderStrategy implements IStrategy {
  private readonly buyThreshold: number;
  private readonly sellThreshold: number;
  private readonly minBalance: number;
  private lastAction: "buy" | "sell" | "wait" = "wait";

  constructor(
    parameters: {
      buyThreshold?: number;
      sellThreshold?: number;
      minBalance?: number;
    } = {},
  ) {
    this.buyThreshold = parameters.buyThreshold || 90; // Buy when price drops below 90
    this.sellThreshold = parameters.sellThreshold || 110; // Sell when price rises above 110
    this.minBalance = parameters.minBalance || 0.1; // Minimum balance to keep
  }

  /**
   * Evaluate market conditions and make trading decision
   */
  evaluate(
    conditions: MarketConditions,
    walletBalance: number,
  ): StrategyAction {
    // Don't trade if balance is too low
    if (walletBalance < this.minBalance) {
      return {
        type: "wait",
        details: {
          reason: `Insufficient balance (${walletBalance.toFixed(4)} SOL). Minimum required: ${this.minBalance} SOL`,
        },
      };
    }

    // Simple strategy: buy low, sell high
    if (conditions.price < this.buyThreshold && this.lastAction !== "buy") {
      this.lastAction = "buy";
      const amount = Math.min(walletBalance * 0.1, 0.5); // Buy 10% of balance, max 0.5 SOL

      return {
        type: "trade",
        details: {
          action: "buy",
          amount,
          reason: `Price (${conditions.price}) below buy threshold (${this.buyThreshold}). Buying ${amount.toFixed(4)} SOL worth of tokens.`,
        },
      };
    }

    if (conditions.price > this.sellThreshold && this.lastAction !== "sell") {
      this.lastAction = "sell";
      const amount = 0.1; // Sell a fixed amount

      return {
        type: "trade",
        details: {
          action: "sell",
          amount,
          reason: `Price (${conditions.price}) above sell threshold (${this.sellThreshold}). Selling ${amount.toFixed(4)} SOL worth of tokens.`,
        },
      };
    }

    // Wait if conditions aren't met
    return {
      type: "wait",
      details: {
        reason: `Price (${conditions.price}) within normal range (${this.buyThreshold}-${this.sellThreshold}). Waiting for better opportunity.`,
      },
    };
  }

  /**
   * Get strategy configuration
   */
  getConfig(): AgentStrategy {
    return {
      type: "simple-trader",
      parameters: {
        buyThreshold: this.buyThreshold,
        sellThreshold: this.sellThreshold,
        minBalance: this.minBalance,
      },
    };
  }
}
