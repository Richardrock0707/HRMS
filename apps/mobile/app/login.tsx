import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { VSECURE_CONFIG } from "@vsecure/shared";

export default function MobileLoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("VS-001");
  const [password, setPassword] = useState("VSecure@2026");
  const [pin, setPin] = useState("1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Simulated hardware device parameters
  const currentDeviceId = "android_pixel9pro_vsecure_001";
  const currentDeviceModel = "Google Pixel 9 Pro";

  const handleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Authentication Successful",
        `Welcome ${VSECURE_CONFIG.administrator} (${identifier})!\n\nSingle-Device Hardware Bound: ${currentDeviceModel}`,
        [
          {
            text: "Continue to HRMS",
            onPress: () => router.replace("/"),
          },
        ]
      );
    }, 700);
  };

  const handleBiometricUnlock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Biometric Verified",
        "Fingerprint recognized by Android Keystore. Session unlocked.",
        [
          {
            text: "Proceed",
            onPress: () => router.replace("/"),
          },
        ]
      );
    }, 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandCard}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>VS</Text>
        </View>
        <Text style={styles.appName}>VSecure HRMS</Text>
        <Text style={styles.companyName}>VSecure Technologies</Text>

        <View style={styles.securityPill}>
          <View style={styles.greenDot} />
          <Text style={styles.securityPillText}>Android Keystore Hardware Bound</Text>
        </View>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Mobile Sign In</Text>
        <Text style={styles.subtitle}>
          Sign in via Corporate Email or Employee ID (e.g. VS-001).
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email or Employee Code</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="VS-001 or name@vsecuretechnologies.com"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Corporate Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        {/* Fallback 4-Digit PIN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quick-Unlock 4-Digit PIN (Fallback)</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="1234"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.pinInput]}
          />
        </View>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Quick-Unlock Button */}
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricUnlock}
          disabled={isSubmitting}
        >
          <Text style={styles.biometricButtonText}>
            👆 Unlock with Fingerprint / Face ID
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hardware Device Binding Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Device Hardware Binding</Text>
        <Text style={styles.sectionDesc}>
          Single-device hardware locking prevents attendance buddy-punching.
        </Text>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Detected Phone:</Text>
          <Text style={styles.deviceValue}>{currentDeviceModel}</Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Hardware ID:</Text>
          <Text style={[styles.deviceValue, styles.mono]}>
            {currentDeviceId.substring(0, 24)}...
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Binding Status:</Text>
          <Text style={styles.boundStatus}>✓ Verified & Authorized</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  brandCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  companyName: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  securityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginTop: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0F172A",
  },
  pinInput: {
    letterSpacing: 4,
    fontWeight: "700",
  },
  signInButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  biometricButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  biometricButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  deviceLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  deviceValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0F172A",
  },
  boundStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  mono: {
    fontFamily: "System",
  },
});
