/**
 * PrivateKeyModal - Securely displays private key with confirmation
 * Logs access attempts and requires explicit user confirmation
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
} from "react-native";
import { keyStore } from "../services/KeyStore";

interface PrivateKeyModalProps {
  visible: boolean;
  publicKey: string;
  onClose: () => void;
}

export function PrivateKeyModal({
  visible,
  publicKey,
  onClose,
}: PrivateKeyModalProps) {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      // Log access attempt
      console.warn("[Security] Private key access requested for:", publicKey);

      // Retrieve private key
      const keyBytes = await keyStore.retrieveKey(publicKey);
      if (!keyBytes) {
        Alert.alert("Error", "Private key not found");
        return;
      }

      // Convert to base58 for display
      const keyHex = Array.from(keyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setPrivateKey(keyHex);
      setConfirmed(true);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve private key");
    }
  };

  const handleCopy = () => {
    if (privateKey) {
      Clipboard.setString(privateKey);
      Alert.alert("Copied", "Private key copied to clipboard");
    }
  };

  const handleClose = () => {
    setPrivateKey(null);
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>⚠️ Private Key</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!confirmed ? (
              <>
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>Security Warning</Text>
                  <Text style={styles.warningText}>
                    • Never share your private key with anyone
                  </Text>
                  <Text style={styles.warningText}>
                    • Anyone with this key has full control of the wallet
                  </Text>
                  <Text style={styles.warningText}>
                    • This action will be logged for security
                  </Text>
                </View>

                <Text style={styles.publicKeyLabel}>Public Key:</Text>
                <Text
                  style={styles.publicKey}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {publicKey}
                </Text>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    I Understand, Show Private Key
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.keyLabel}>Private Key (Hex):</Text>
                <View style={styles.keyContainer}>
                  <Text style={styles.privateKeyText} selectable>
                    {privateKey}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopy}
                >
                  <Text style={styles.copyButtonText}>
                    📋 Copy to Clipboard
                  </Text>
                </TouchableOpacity>

                <View style={styles.reminderBox}>
                  <Text style={styles.reminderText}>
                    Keep this key secure and never share it!
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFooterButton}
              onPress={handleClose}
            >
              <Text style={styles.closeFooterButtonText}>Close</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
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
    color: "#f44336",
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
  },
  content: {
    padding: 20,
  },
  warningBox: {
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e65100",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#e65100",
    marginBottom: 4,
  },
  publicKeyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  publicKey: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#f44336",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  keyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  keyContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  privateKeyText: {
    fontSize: 11,
    color: "#333",
    fontFamily: "monospace",
  },
  copyButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  reminderBox: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 12,
    color: "#c62828",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  closeFooterButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeFooterButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
