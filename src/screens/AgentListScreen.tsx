/**
 * AgentListScreen - Displays all AI agents with their status
 * Allows creating, starting, and stopping agents
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAgent } from "../contexts/AgentContext";
import { Agent, AgentStrategy } from "../types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AgentStackParamList } from "../navigation/AppNavigator";
import { AgentCreationModal } from "../components/AgentCreationModal";

type NavigationProp = NativeStackNavigationProp<
  AgentStackParamList,
  "AgentList"
>;

export function AgentListScreen() {
  const {
    state,
    startAgent,
    stopAgent,
    stopAllAgents,
    refreshAgents,
    clearError,
    createAgent,
  } = useAgent();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    refreshAgents();

    // Refresh agents every 5 seconds to show updated activity
    const interval = setInterval(refreshAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.error) {
      Alert.alert("Error", state.error, [{ text: "OK", onPress: clearError }]);
    }
  }, [state.error]);

  const handleCreateAgent = async (strategy: AgentStrategy) => {
    try {
      const agent = await createAgent(strategy);
      Alert.alert("Success", "Agent created successfully!");
      // Navigate to agent detail
      navigation.navigate("AgentDetail", { agentId: agent.id });
    } catch (error) {
      // Error handled by context
    }
  };

  const handleToggleAgent = async (agent: Agent) => {
    try {
      if (agent.status === "active") {
        await stopAgent(agent.id);
      } else {
        await startAgent(agent.id);
      }
    } catch (error) {
      // Error handled by context
    }
  };

  const handleStopAll = () => {
    Alert.alert(
      "Stop All Agents",
      "Are you sure you want to stop all active agents?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop All",
          style: "destructive",
          onPress: async () => {
            try {
              await stopAllAgents();
              Alert.alert("Success", "All agents stopped");
            } catch (error) {
              // Error handled by context
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "paused":
        return "#ff9800";
      case "stopped":
        return "#f44336";
      default:
        return "#999";
    }
  };

  const renderAgentItem = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => navigation.navigate("AgentDetail", { agentId: item.id })}
    >
      <View style={styles.agentHeader}>
        <View style={styles.agentInfo}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text style={styles.agentId}>Agent {item.id.substring(6, 12)}</Text>
          </View>
          <Text style={styles.strategyType}>{item.strategy.type}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.status === "active" ? styles.stopButton : styles.startButton,
          ]}
          onPress={() => handleToggleAgent(item)}
        >
          <Text style={styles.toggleButtonText}>
            {item.status === "active" ? "Stop" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.walletKey} numberOfLines={1} ellipsizeMode="middle">
        Wallet: {item.walletPublicKey}
      </Text>

      <View style={styles.activityInfo}>
        <Text style={styles.activityCount}>
          {item.activityLog.length} activities
        </Text>
        {item.activityLog.length > 0 && (
          <Text style={styles.lastActivity}>
            Last: {item.activityLog[item.activityLog.length - 1].action}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No agents yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first AI agent to start autonomous trading
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Agents</Text>
        <View style={styles.headerButtons}>
          {state.activeAgentIds.length > 0 && (
            <TouchableOpacity
              style={styles.stopAllButton}
              onPress={handleStopAll}
            >
              <Text style={styles.stopAllButtonText}>Stop All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Create Agent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {state.activeAgentIds.length > 0 && (
        <View style={styles.activeBar}>
          <Text style={styles.activeBarText}>
            {state.activeAgentIds.length} agent
            {state.activeAgentIds.length !== 1 ? "s" : ""} active
          </Text>
        </View>
      )}

      <FlatList
        data={state.agents}
        renderItem={renderAgentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      <AgentCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAgent={handleCreateAgent}
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
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  stopAllButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopAllButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  activeBar: {
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeBarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  agentCard: {
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
  agentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  agentId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  strategyType: {
    fontSize: 12,
    color: "#666",
    marginLeft: 18,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: "#4caf50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  walletKey: {
    fontSize: 11,
    color: "#999",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  activityInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  activityCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  lastActivity: {
    fontSize: 11,
    color: "#999",
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
    textAlign: "center",
  },
});
