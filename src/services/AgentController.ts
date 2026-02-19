/**
 * AgentController - Manages autonomous AI agents
 * Handles agent lifecycle, decision-making loops, and activity logging
 */

import { Agent, AgentActivity, AgentStrategy } from "../types";
import { walletManager } from "./WalletManager";
import { blockchainClient } from "./BlockchainClient";
import { transactionSigner } from "./TransactionSigner";
import { defiClient } from "./DeFiClient";
import { IStrategy } from "../strategies/IStrategy";
import { SimpleTraderStrategy } from "../strategies/SimpleTraderStrategy";
import { marketDataGenerator } from "../strategies/MarketDataGenerator";

export class AgentController {
  private agents: Map<string, Agent> = new Map();
  private activeAgentIds: Set<string> = new Set();
  private decisionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly DECISION_INTERVAL_MS = 10000; // 10 seconds

  /**
   * Create a new agent with a strategy
   * @param strategy - The agent's trading strategy
   * @returns The created agent
   */
  async createAgent(strategy: AgentStrategy): Promise<Agent> {
    // Create a wallet for the agent
    const wallet = await walletManager.createWallet();

    // Generate unique agent ID
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create agent
    const agent: Agent = {
      id: agentId,
      walletPublicKey: wallet.publicKey,
      strategy,
      status: "stopped",
      activityLog: [],
    };

    // Store agent
    this.agents.set(agentId, agent);

    // Log creation
    this.logActivity(agentId, {
      timestamp: new Date(),
      action: "created",
      decision: `Agent created with ${strategy.type} strategy`,
      result: "success",
    });

    return agent;
  }

  /**
   * Start an agent's decision-making loop
   * @param agentId - The agent's ID
   */
  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status === "active") {
      return; // Already active
    }

    // Update status
    agent.status = "active";
    this.activeAgentIds.add(agentId);
    this.agents.set(agentId, agent);

    // Log start
    this.logActivity(agentId, {
      timestamp: new Date(),
      action: "started",
      decision: "Agent activated and beginning autonomous operations",
      result: "success",
    });

    // Start decision loop
    this.startDecisionLoop(agentId);
  }

  /**
   * Stop an agent's decision-making loop
   * @param agentId - The agent's ID
   */
  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Clear decision interval
    const interval = this.decisionIntervals.get(agentId);
    if (interval) {
      clearInterval(interval);
      this.decisionIntervals.delete(agentId);
    }

    // Update status
    agent.status = "stopped";
    this.activeAgentIds.delete(agentId);
    this.agents.set(agentId, agent);

    // Log stop
    this.logActivity(agentId, {
      timestamp: new Date(),
      action: "stopped",
      decision: "Agent deactivated",
      result: "success",
    });
  }

  /**
   * Stop all active agents
   */
  async stopAllAgents(): Promise<void> {
    const activeIds = Array.from(this.activeAgentIds);
    for (const agentId of activeIds) {
      await this.stopAgent(agentId);
    }
  }

  /**
   * Get an agent by ID
   * @param agentId - The agent's ID
   * @returns The agent or null if not found
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents
   * @returns Array of all agents
   */
  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Start the decision-making loop for an agent
   */
  private startDecisionLoop(agentId: string): void {
    const interval = setInterval(async () => {
      await this.executeDecisionCycle(agentId);
    }, this.DECISION_INTERVAL_MS);

    this.decisionIntervals.set(agentId, interval);

    // Execute first cycle immediately
    this.executeDecisionCycle(agentId);
  }

  /**
   * Execute one decision cycle for an agent
   */
  private async executeDecisionCycle(agentId: string): Promise<void> {
    try {
      const agent = this.agents.get(agentId);
      if (!agent || agent.status !== "active") {
        return;
      }

      // Get wallet balance
      const wallet = await walletManager.getWallet(agent.walletPublicKey);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Generate market conditions
      const marketConditions = marketDataGenerator.generateNext();

      // Create strategy instance
      const strategy = this.createStrategyInstance(agent.strategy);

      // Evaluate and get action
      const action = strategy.evaluate(marketConditions, wallet.balance);

      // Execute action if it's a trade
      if (
        action.type === "trade" &&
        action.details.action &&
        (action.details.action === "buy" || action.details.action === "sell")
      ) {
        try {
          // Execute the trade
          const signature = await this.executeTrade(
            agent.walletPublicKey,
            action.details.action,
            action.details.amount || 0.1,
          );

          // Log successful trade
          this.logActivity(agentId, {
            timestamp: new Date(),
            action: action.type,
            decision: action.details.reason,
            transactionSignature: signature,
            result: "success",
          });

          // Update wallet balance after trade
          await this.updateWalletBalance(agent.walletPublicKey);
        } catch (error) {
          // Log failed trade
          this.logActivity(agentId, {
            timestamp: new Date(),
            action: action.type,
            decision: `Trade failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            result: "failure",
          });
        }
      } else {
        // Log the decision to wait
        this.logActivity(agentId, {
          timestamp: new Date(),
          action: action.type,
          decision: action.details.reason,
          result: "success",
        });
      }
    } catch (error) {
      console.error(
        `[AgentController] Error in decision cycle for ${agentId}:`,
        error,
      );
      this.logActivity(agentId, {
        timestamp: new Date(),
        action: "error",
        decision: `Decision cycle failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        result: "failure",
      });
    }
  }

  /**
   * Execute a trade for an agent
   */
  private async executeTrade(
    walletPublicKey: string,
    action: "buy" | "sell",
    amount: number,
  ): Promise<string> {
    // For demonstration, use the DeFi client to execute a mock swap
    const signature = await defiClient.executeSwap(
      {
        fromToken: action === "buy" ? "SOL" : "TOKEN",
        toToken: action === "buy" ? "TOKEN" : "SOL",
        amount,
        slippage: 1,
      },
      walletPublicKey,
    );

    return signature;
  }

  /**
   * Update wallet balance from blockchain
   */
  private async updateWalletBalance(walletPublicKey: string): Promise<void> {
    try {
      const balance = await blockchainClient.getBalance(walletPublicKey);
      const tokenBalances =
        await blockchainClient.getTokenBalances(walletPublicKey);
      await walletManager.updateBalance(walletPublicKey, balance);
      await walletManager.updateTokenBalances(walletPublicKey, tokenBalances);
    } catch (error) {
      console.error(
        "[AgentController] Failed to update wallet balance:",
        error,
      );
    }
  }

  /**
   * Create a strategy instance from configuration
   */
  private createStrategyInstance(strategyConfig: AgentStrategy): IStrategy {
    switch (strategyConfig.type) {
      case "simple-trader":
        return new SimpleTraderStrategy(strategyConfig.parameters);
      case "liquidity-provider":
        // TODO: Implement liquidity provider strategy
        return new SimpleTraderStrategy(strategyConfig.parameters);
      case "arbitrage":
        // TODO: Implement arbitrage strategy
        return new SimpleTraderStrategy(strategyConfig.parameters);
      default:
        return new SimpleTraderStrategy();
    }
  }

  /**
   * Log an activity for an agent
   */
  private logActivity(agentId: string, activity: AgentActivity): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.activityLog.push(activity);

      // Keep only last 100 activities
      if (agent.activityLog.length > 100) {
        agent.activityLog = agent.activityLog.slice(-100);
      }

      this.agents.set(agentId, agent);
    }
  }

  /**
   * Delete an agent
   * @param agentId - The agent's ID
   */
  async deleteAgent(agentId: string): Promise<void> {
    // Stop agent if active
    if (this.activeAgentIds.has(agentId)) {
      await this.stopAgent(agentId);
    }

    // Remove agent
    this.agents.delete(agentId);
  }
}

// Export singleton instance
export const agentController = new AgentController();
