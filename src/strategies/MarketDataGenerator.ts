/**
 * MarketDataGenerator - Generates simulated market data for testing
 * Creates realistic price movements and trends
 */

import { MarketConditions } from "./IStrategy";

export class MarketDataGenerator {
  private basePrice: number = 100;
  private currentPrice: number = 100;
  private volatility: number = 0.05; // 5% volatility
  private trendStrength: number = 0.02; // 2% trend
  private currentTrend: "up" | "down" | "sideways" = "sideways";
  private trendDuration: number = 0;
  private maxTrendDuration: number = 10;

  /**
   * Generate next market conditions
   * @returns Simulated market conditions
   */
  generateNext(): MarketConditions {
    // Update trend periodically
    this.trendDuration++;
    if (this.trendDuration >= this.maxTrendDuration) {
      this.updateTrend();
      this.trendDuration = 0;
    }

    // Calculate price change based on trend and volatility
    let priceChange = 0;

    switch (this.currentTrend) {
      case "up":
        priceChange = this.trendStrength + Math.random() * this.volatility;
        break;
      case "down":
        priceChange = -this.trendStrength - Math.random() * this.volatility;
        break;
      case "sideways":
        priceChange = (Math.random() - 0.5) * this.volatility * 2;
        break;
    }

    // Update price
    this.currentPrice = this.currentPrice * (1 + priceChange);

    // Keep price within reasonable bounds
    this.currentPrice = Math.max(50, Math.min(150, this.currentPrice));

    // Generate volume (random between 1000 and 10000)
    const volume = Math.floor(Math.random() * 9000) + 1000;

    return {
      timestamp: new Date(),
      price: Math.round(this.currentPrice * 100) / 100,
      volume,
      trend: this.currentTrend,
    };
  }

  /**
   * Update the market trend randomly
   */
  private updateTrend(): void {
    const rand = Math.random();
    if (rand < 0.33) {
      this.currentTrend = "up";
    } else if (rand < 0.66) {
      this.currentTrend = "down";
    } else {
      this.currentTrend = "sideways";
    }

    // Randomize trend duration
    this.maxTrendDuration = Math.floor(Math.random() * 10) + 5;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentPrice = this.basePrice;
    this.currentTrend = "sideways";
    this.trendDuration = 0;
  }

  /**
   * Get current price
   */
  getCurrentPrice(): number {
    return this.currentPrice;
  }

  /**
   * Set volatility (0-1)
   */
  setVolatility(volatility: number): void {
    this.volatility = Math.max(0, Math.min(1, volatility));
  }
}

// Export singleton instance
export const marketDataGenerator = new MarketDataGenerator();
