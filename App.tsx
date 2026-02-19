/**
 * App - Main application entry point
 * Sets up context providers and navigation
 */

// Polyfills for React Native
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletProvider } from "./src/contexts/WalletContext";
import { AgentProvider } from "./src/contexts/AgentContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <WalletProvider>
          <AgentProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </AgentProvider>
        </WalletProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
