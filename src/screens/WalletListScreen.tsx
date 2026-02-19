/**
 * WalletListScreen - Displays all wallets with balances
 * Allows creating new wallets and funding existing ones
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useWallet } from "../contexts/WalletContext";
import { WalletInfo } from "../types";

export function WalletListScreen() {
  const { state, createWallet, refreshWallets, fundWallet, clearError } =
    useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [fundingWallet, setFundingWallet] = useState<string | null>(null);

  useEffect(() => {
    refreshWallets();
  }, []);

  useEffect(() => {
    if (state.error) {
      Alert.alert("Error", state.error, [{ text: "OK", onPress: clearError }]);
    }
  }, [state.error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWallets();
    setRefreshing(false);
  };

  const handleCreateWallet = async () => {
    try {
      await createWallet();
      Alert.alert("Success", "Wallet created successfully!");
    } catch (error) {
      // Error handled by context
    }
  };

  const handleFundWallet = async (publicKey: string) => {
    try {
      setFundingWallet(publicKey);
      await fundWallet(publicKey, 1);
      Alert.alert("Success", "Wallet funded with 1 SOL from devnet faucet!");
    } catch (error) {
      // Error handled by context
    } finally {
      setFundingWallet(null);
    }
  };

  const renderWalletItem = ({ item }: { item: WalletInfo }) => (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletLabel}>Wallet</Text>
        <Text style={styles.balanceLabel}>{item.balance.toFixed(4)} SOL</Text>
      </View>

      <Text style={styles.publicKey} numberOfLines={1} ellipsizeMode="middle">
        {item.publicKey}
      </Text>

      {item.tokenBalances.length > 0 && (
        <View style={styles.tokensSection}>
          <Text style={styles.tokensLabel}>Tokens:</Text>
          {item.tokenBalances.map((token, index) => (
            <Text key={index} style={styles.tokenItem}>
              {token.amount.toFixed(2)} ({token.mint.substring(0, 8)}...)
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.fundButton,
          fundingWallet === item.publicKey && styles.fundButtonDisabled,
        ]}
        onPress={() => handleFundWallet(item.publicKey)}
        disabled={fundingWallet === item.publicKey}
      >
        {fundingWallet === item.publicKey ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.fundButtonText}>Fund Wallet (1 SOL)</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No wallets yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first wallet to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallets</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateWallet}
          disabled={state.loading}
        >
          {state.loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>+ Create Wallet</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.wallets}
        renderItem={renderWalletItem}
        keyExtractor={(item) => item.publicKey}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  walletCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200ee",
  },
  publicKey: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
    marginBottom: 12,
  },
  tokensSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  tokensLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  tokenItem: {
    fontSize: 11,
    color: "#999",
    marginLeft: 8,
  },
  fundButton: {
    backgroundColor: "#03dac6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  fundButtonDisabled: {
    backgroundColor: "#b0b0b0",
  },
  fundButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bbb",
  },
});
