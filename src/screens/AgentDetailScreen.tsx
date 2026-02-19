/**
 * AgentDetailScreen - Shows detailed information about a single agent
 * Displays strategy, wallet info, and activity log
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useAgent } from "../contexts/AgentContext";
import { AgentActivity } from "../types";

interface AgentDetailScreenProps {
  route: {
    params: {
      agentId: string;
    };
  };
}

export function AgentDetailScreen({ route }: AgentDetailScreenProps) {
  const { agentId } = route.params;
  const { state, refreshAgents } = useAgent();
  const flatListRef = useRef<FlatList>(null);

  const agent = state.agents.find((a) => a.id === agentId);

  useEffect(() => {
    // Refresh agent data every 3 seconds
    const interval = setInterval(refreshAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new activities are added
    if (agent && agent.activityLog.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [agent?.activityLog.length]);

  if (!agent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Agent not found</Text>
      </View>
    );
  }

  const getStatusColor = () => {
    switch (agent.status) {
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

  const formatTimestamp = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString();
  };

  const openExplorer = (signature: string) => {
    const url = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    Linking.openURL(url);
  };

  const renderActivityItem = ({
    item,
    index,
  }: {
    item: AgentActivity;
    index: number;
  }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTime}>
          {formatTimestamp(item.timestamp)}
        </Text>
        <View
          style={[
            styles.resultBadge,
            item.result === "success"
              ? styles.successBadge
              : styles.failureBadge,
          ]}
        >
          <Text style={styles.resultText}>{item.result}</Text>
        </View>
      </View>

      <Text style={styles.activityAction}>{item.action}</Text>
      <Text style={styles.activityDecision}>{item.decision}</Text>

      {item.transactionSignature && (
        <TouchableOpacity
          style={styles.txLink}
          onPress={() => openExplorer(item.transactionSignature!)}
        >
          <Text style={styles.txLinkText}>
            View Transaction: {item.transactionSignature.substring(0, 8)}...
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Agent Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
            />
            <Text style={styles.statusText}>{agent.status.toUpperCase()}</Text>
          </View>

          <Text style={styles.agentId}>Agent ID: {agent.id}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Strategy:</Text>
            <Text style={styles.infoValue}>{agent.strategy.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet:</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {agent.walletPublicKey}
            </Text>
          </View>

          {Object.keys(agent.strategy.parameters).length > 0 && (
            <View style={styles.parametersSection}>
              <Text style={styles.parametersTitle}>Strategy Parameters:</Text>
              {Object.entries(agent.strategy.parameters).map(([key, value]) => (
                <View key={key} style={styles.parameterRow}>
                  <Text style={styles.parameterKey}>{key}:</Text>
                  <Text style={styles.parameterValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Activity Log */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>
            Activity Log ({agent.activityLog.length})
          </Text>

          {agent.activityLog.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No activity yet</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={[...agent.activityLog].reverse()}
              renderItem={renderActivityItem}
              keyExtractor={(item, index) => `${item.timestamp}-${index}`}
              style={styles.activityList}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginTop: 40,
  },
  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  agentId: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  parametersSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  parametersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  parameterRow: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 12,
  },
  parameterKey: {
    fontSize: 12,
    color: "#999",
    width: 120,
  },
  parameterValue: {
    fontSize: 12,
    color: "#666",
  },
  activitySection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  activityList: {
    maxHeight: 600,
  },
  activityItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6200ee",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 11,
    color: "#999",
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  successBadge: {
    backgroundColor: "#e8f5e9",
  },
  failureBadge: {
    backgroundColor: "#ffebee",
  },
  resultText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  activityDecision: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  txLink: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  txLinkText: {
    fontSize: 11,
    color: "#6200ee",
    textDecorationLine: "underline",
  },
  emptyActivity: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyActivityText: {
    fontSize: 14,
    color: "#999",
  },
});
