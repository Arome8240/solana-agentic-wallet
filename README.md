# Solana Agentic Wallet

A mobile application built with Expo that enables AI agents to autonomously manage Solana wallets, sign transactions, and interact with DeFi protocols on Solana devnet.

## Features

- 🤖 **Autonomous AI Agents**: Create and manage multiple AI agents with different trading strategies
- 💰 **Wallet Management**: Programmatically create and manage Solana wallets
- 🔐 **Secure Key Storage**: Private keys encrypted using device-secure storage
- 📊 **Real-time Monitoring**: Watch agents make decisions and execute trades in real-time
- 🔄 **Automated Trading**: Agents autonomously execute trades based on market conditions
- 📱 **Mobile-First**: Built with React Native and Expo for iOS and Android

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your mobile device (optional)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd solana-agentic-wallet
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

4. Run on your device:
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
solana-agentic-wallet/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── services/         # Core business logic
│   ├── strategies/       # Agent trading strategies
│   └── types/            # TypeScript type definitions
├── App.tsx              # Application entry point
└── package.json         # Dependencies and scripts
```

## Usage

### Creating a Wallet

1. Navigate to the "Wallets" tab
2. Tap "Create Wallet"
3. A new wallet will be generated with a unique keypair
4. Tap "Fund Wallet" to request SOL from the devnet faucet

### Creating an AI Agent

1. Navigate to the "Agents" tab
2. Tap "Create Agent"
3. Select a strategy type:
   - **Simple Trader**: Buys low, sells high based on price thresholds
   - **Liquidity Provider**: Provides liquidity to pools (coming soon)
   - **Arbitrage**: Exploits price differences (coming soon)
4. Configure strategy parameters
5. Tap "Create Agent" - a wallet will be created automatically

### Managing Agents

- **Start/Stop**: Toggle agents on/off with the start/stop button
- **View Details**: Tap an agent to see its activity log and transaction history
- **Stop All**: Use the "Stop All" button to halt all active agents
- **Monitor Activity**: Watch real-time decision-making and trade execution

## Architecture

### Core Services

- **KeyStore**: Secure storage for private keys using expo-secure-store
- **WalletManager**: Manages wallet creation and keypair operations
- **BlockchainClient**: Handles all Solana devnet interactions
- **TransactionSigner**: Signs transactions on behalf of agents
- **AgentController**: Manages agent lifecycle and decision loops
- **DeFiClient**: Constructs and executes DeFi protocol interactions

### Agent Strategies

Agents use pluggable strategies to make trading decisions:

- **SimpleTraderStrategy**: Basic buy/sell logic based on price thresholds
- Strategies evaluate market conditions every 10 seconds
- Each agent operates independently with its own wallet

## Security

- Private keys are encrypted using device-secure storage (iOS Keychain / Android Keystore)
- Keys never leave the device
- All operations are on Solana devnet (no real funds at risk)
- Private key access requires explicit user confirmation
- All key access attempts are logged

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Troubleshooting

### Expo Go Connection Issues

- Ensure your device and computer are on the same network
- Try restarting the Expo development server
- Clear Expo cache: `npx expo start -c`

### Devnet Faucet Rate Limits

- The Solana devnet faucet has rate limits
- Wait a few minutes between airdrop requests
- Each request provides 1 SOL

### Build Errors

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Metro bundler cache: `npx expo start -c`
- Ensure all dependencies are installed

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Disclaimer

This is a prototype application for demonstration purposes. It operates on Solana devnet only. Never use this with mainnet or real funds without proper security audits and additional safeguards.
