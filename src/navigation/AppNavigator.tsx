/**
 * AppNavigator - Main navigation structure for the app
 * Sets up tab navigation and stack navigation
 */

import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WalletListScreen } from "../screens/WalletListScreen";
import { AgentListScreen } from "../screens/AgentListScreen";
import { AgentDetailScreen } from "../screens/AgentDetailScreen";

export type AgentStackParamList = {
  AgentList: undefined;
  AgentDetail: { agentId: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AgentStackParamList>();

// Agents stack navigator
function AgentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="AgentList"
        component={AgentListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentDetail"
        component={AgentDetailScreen}
        options={{ title: "Agent Details" }}
      />
    </Stack.Navigator>
  );
}

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name="Wallets"
        component={WalletListScreen}
        options={{
          tabBarLabel: "Wallets",
          tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} />,
        }}
      />
      <Tab.Screen
        name="Agents"
        component={AgentsStack}
        options={{
          tabBarLabel: "Agents",
          tabBarIcon: ({ color }) => <TabIcon name="robot" color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon component (using text as icons for simplicity)
function TabIcon({ name }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    wallet: "💰",
    robot: "🤖",
  };

  return <Text style={{ fontSize: 24 }}>{icons[name] || "•"}</Text>;
}

// Main app navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
