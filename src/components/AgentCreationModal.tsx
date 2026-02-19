/**
 * AgentCreationModal - Modal for creating new AI agents
 * Allows selecting strategy and configuring parameters
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { AgentStrategy } from "../types";

interface AgentCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateAgent: (strategy: AgentStrategy) => Promise<void>;
}

export function AgentCreationModal({
  visible,
  onClose,
  onCreateAgent,
}: AgentCreationModalProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<
    "simple-trader" | "liquidity-provider" | "arbitrage"
  >("simple-trader");
  const [buyThreshold, setBuyThreshold] = useState("90");
  const [sellThreshold, setSellThreshold] = useState("110");
  const [minBalance, setMinBalance] = useState("0.1");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    // Validate inputs
    const buyThresholdNum = parseFloat(buyThreshold);
    const sellThresholdNum = parseFloat(sellThreshold);
    const minBalanceNum = parseFloat(minBalance);

    if (
      isNaN(buyThresholdNum) ||
      isNaN(sellThresholdNum) ||
      isNaN(minBalanceNum)
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter valid numbers for all parameters",
      );
      return;
    }

    if (buyThresholdNum >= sellThresholdNum) {
      Alert.alert(
        "Invalid Input",
        "Buy threshold must be less than sell threshold",
      );
      return;
    }

    if (minBalanceNum < 0) {
      Alert.alert("Invalid Input", "Minimum balance must be positive");
      return;
    }

    try {
      setCreating(true);

      const strategy: AgentStrategy = {
        type: selectedStrategy,
        parameters: {
          buyThreshold: buyThresholdNum,
          sellThreshold: sellThresholdNum,
          minBalance: minBalanceNum,
        },
      };

      await onCreateAgent(strategy);

      // Reset form
      setSelectedStrategy("simple-trader");
      setBuyThreshold("90");
      setSellThreshold("110");
      setMinBalance("0.1");

      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create AI Agent</Text>
            <TouchableOpacity onPress={onClose} disabled={creating}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Strategy Selection */}
            <Text style={styles.sectionTitle}>Strategy Type</Text>
            <View style={styles.strategyButtons}>
              <TouchableOpacity
                style={[
                  styles.strategyButton,
                  selectedStrategy === "simple-trader" &&
                    styles.strategyButtonActive,
                ]}
                onPress={() => setSelectedStrategy("simple-trader")}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    selectedStrategy === "simple-trader" &&
                      styles.strategyButtonTextActive,
                  ]}
                >
                  Simple Trader
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.strategyButton,
                  selectedStrategy === "liquidity-provider" &&
                    styles.strategyButtonActive,
                ]}
                onPress={() => setSelectedStrategy("liquidity-provider")}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    selectedStrategy === "liquidity-provider" &&
                      styles.strategyButtonTextActive,
                  ]}
                >
                  Liquidity Provider
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.strategyButton,
                  selectedStrategy === "arbitrage" &&
                    styles.strategyButtonActive,
                ]}
                onPress={() => setSelectedStrategy("arbitrage")}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    selectedStrategy === "arbitrage" &&
                      styles.strategyButtonTextActive,
                  ]}
                >
                  Arbitrage
                </Text>
              </TouchableOpacity>
            </View>

            {/* Strategy Parameters */}
            <Text style={styles.sectionTitle}>Parameters</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buy Threshold (Price)</Text>
              <TextInput
                style={styles.input}
                value={buyThreshold}
                onChangeText={setBuyThreshold}
                keyboardType="numeric"
                placeholder="90"
                editable={!creating}
              />
              <Text style={styles.inputHint}>
                Buy when price drops below this value
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sell Threshold (Price)</Text>
              <TextInput
                style={styles.input}
                value={sellThreshold}
                onChangeText={setSellThreshold}
                keyboardType="numeric"
                placeholder="110"
                editable={!creating}
              />
              <Text style={styles.inputHint}>
                Sell when price rises above this value
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Minimum Balance (SOL)</Text>
              <TextInput
                style={styles.input}
                value={minBalance}
                onChangeText={setMinBalance}
                keyboardType="numeric"
                placeholder="0.1"
                editable={!creating}
              />
              <Text style={styles.inputHint}>
                Minimum SOL to keep in wallet
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ A new wallet will be created automatically for this agent
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={creating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                creating && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? "Creating..." : "Create Agent"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  strategyButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  strategyButtonActive: {
    borderColor: "#6200ee",
    backgroundColor: "#f3e5f5",
  },
  strategyButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },
  strategyButtonTextActive: {
    color: "#6200ee",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  inputHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#1976d2",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#6200ee",
  },
  createButtonDisabled: {
    backgroundColor: "#b0b0b0",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
