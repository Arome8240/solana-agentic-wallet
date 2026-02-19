/**
 * AgentContext - Global state management for AI agents
 * Provides agent state and actions to all components
 */

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Agent, AgentStrategy, AgentActivity } from "../types";
import { agentController } from "../services/AgentController";

// State type
interface AgentState {
  agents: Agent[];
  activeAgentIds: string[];
  loading: boolean;
  error: string | null;
}

// Action types
type AgentAction =
  | { type: "SET_AGENTS"; payload: Agent[] }
  | { type: "ADD_AGENT"; payload: Agent }
  | { type: "UPDATE_AGENT"; payload: Agent }
  | { type: "REMOVE_AGENT"; payload: string }
  | { type: "SET_ACTIVE_AGENTS"; payload: string[] }
  | {
      type: "LOG_ACTIVITY";
      payload: { agentId: string; activity: AgentActivity };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: AgentState = {
  agents: [],
  activeAgentIds: [],
  loading: false,
  error: null,
};

// Reducer
function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case "SET_AGENTS":
      return { ...state, agents: action.payload };
    case "ADD_AGENT":
      return { ...state, agents: [...state.agents, action.payload] };
    case "UPDATE_AGENT":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };
    case "REMOVE_AGENT":
      return {
        ...state,
        agents: state.agents.filter((a) => a.id !== action.payload),
      };
    case "SET_ACTIVE_AGENTS":
      return { ...state, activeAgentIds: action.payload };
    case "LOG_ACTIVITY":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.payload.agentId
            ? { ...a, activityLog: [...a.activityLog, action.payload.activity] }
            : a,
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context type
interface AgentContextType {
  state: AgentState;
  createAgent: (strategy: AgentStrategy) => Promise<Agent>;
  startAgent: (agentId: string) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  stopAllAgents: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider component
export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  /**
   * Create a new agent
   */
  const createAgent = async (strategy: AgentStrategy): Promise<Agent> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const agent = await agentController.createAgent(strategy);
      dispatch({ type: "ADD_AGENT", payload: agent });

      return agent;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create agent";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Start an agent
   */
  const startAgent = async (agentId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      await agentController.startAgent(agentId);

      // Refresh agents to get updated status
      await refreshAgents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start agent";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Stop an agent
   */
  const stopAgent = async (agentId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      await agentController.stopAgent(agentId);

      // Refresh agents to get updated status
      await refreshAgents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to stop agent";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Stop all agents
   */
  const stopAllAgents = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      await agentController.stopAllAgents();

      // Refresh agents to get updated status
      await refreshAgents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to stop all agents";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Refresh all agents from agent controller
   */
  const refreshAgents = async () => {
    try {
      const agents = await agentController.getAllAgents();
      dispatch({ type: "SET_AGENTS", payload: agents });

      // Update active agent IDs
      const activeIds = agents
        .filter((a) => a.status === "active")
        .map((a) => a.id);
      dispatch({ type: "SET_ACTIVE_AGENTS", payload: activeIds });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh agents";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  /**
   * Delete an agent
   */
  const deleteAgent = async (agentId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      await agentController.deleteAgent(agentId);
      dispatch({ type: "REMOVE_AGENT", payload: agentId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete agent";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AgentContextType = {
    state,
    createAgent,
    startAgent,
    stopAgent,
    stopAllAgents,
    refreshAgents,
    deleteAgent,
    clearError,
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

// Custom hook to use agent context
export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
