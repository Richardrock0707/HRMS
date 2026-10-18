import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  VSECURE_CONFIG,
  formatINR,
  DEFAULT_OFFICE_COORDINATES,
} from "@vsecure/shared";

export default function DigitalIdCardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"card" | "employment" | "security">("card");
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const employee = {
    code: VSECURE_CONFIG.superAdminCode,
    name: VSECURE_CONFIG.administrator,
    role: "Super Administrator",
    designation: "Founder & Chief Architect",
    department: "Engineering & Architecture",
    joiningDate: "01-01-2026",
    bloodGroup: "O+",
    emergencyPhone: "+91 98765 00001 (Brother)",
    email: VSECURE_CONFIG.superAdminEmail,
    grossSalaryINR: 250000,
    basicSalaryINR: 150000,
    hraINR: 60000,
    allowancesINR: 40000,
    boundDevice: "Google Pixel 9 Pro",
    boundDeviceId: "android_pixel9pro_vsecure_001",
    boundDate: "01-01-2026",
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from VSecure HRMS?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "card" && styles.tabButtonActive]}
          onPress={() => setActiveTab("card")}
        >
          <Text
            style={[styles.tabButtonText, activeTab === "card" && styles.tabButtonTextActive]}
          >
            Digital ID
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "employment" && styles.tabButtonActive]}
          onPress={() => setActiveTab("employment")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "employment" && styles.tabButtonTextActive,
            ]}
          >
            Employment (INR)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "security" && styles.tabButtonActive]}
          onPress={() => setActiveTab("security")}
        >
          <Text
            style={[styles.tabButtonText, activeTab === "security" && styles.tabButtonTextActive]}
          >
            Device Security
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: DIGITAL ID BADGE CARD */}
      {activeTab === "card" && (
        <View style={styles.badgeCard}>
          {/* Badge Header */}
          <View style={styles.badgeHeader}>
            <View>
              <Text style={styles.badgeCompany}>{VSECURE_CONFIG.companyName}</Text>
              <Text style={styles.badgeSub}>Enterprise Workforce Pass</Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>SUPER ADMIN</Text>
            </View>
          </View>

          {/* Photo & Identity Section */}
          <View style={styles.idBody}>
            <View style={styles.photoContainer}>
              <View style={styles.photo}>
                <Text style={styles.photoText}>{employee.name.charAt(0)}</Text>
              </View>
              <View style={styles.activeIndicator} />
            </View>

            <Text style={styles.idName}>{employee.name}</Text>
            <Text style={styles.idCode}>{employee.code}</Text>

            <Text style={styles.idDesignation}>{employee.designation}</Text>
            <Text style={styles.idDept}>{employee.department}</Text>
          </View>

          {/* Key Identifiers Grid */}
          <View style={styles.badgeGrid}>
            <View style={styles.badgeGridItem}>
              <Text style={styles.gridLabel}>Blood Group</Text>
              <Text style={[styles.gridValue, styles.bloodRed]}>{employee.bloodGroup}</Text>
            </View>
            <View style={styles.badgeGridItem}>
              <Text style={styles.gridLabel}>Emergency Contact</Text>
              <Text style={styles.gridValue}>{employee.emergencyPhone}</Text>
            </View>
            <View style={styles.badgeGridItem}>
              <Text style={styles.gridLabel}>Joining Date</Text>
              <Text style={styles.gridValue}>{employee.joiningDate}</Text>
            </View>
            <View style={styles.badgeGridItem}>
              <Text style={styles.gridLabel}>HQ Geofence</Text>
              <Text style={styles.gridValue}>Bengaluru (100m)</Text>
            </View>
          </View>

          {/* Scannable Barcode / QR Simulation */}
          <View style={styles.barcodeSection}>
            <View style={styles.barcodeLines}>
              <View style={[styles.bar, { width: 3 }]} />
              <View style={[styles.bar, { width: 6 }]} />
              <View style={[styles.bar, { width: 2 }]} />
              <View style={[styles.bar, { width: 8 }]} />
              <View style={[styles.bar, { width: 4 }]} />
              <View style={[styles.bar, { width: 10 }]} />
              <View style={[styles.bar, { width: 3 }]} />
              <View style={[styles.bar, { width: 5 }]} />
              <View style={[styles.bar, { width: 7 }]} />
              <View style={[styles.bar, { width: 2 }]} />
              <View style={[styles.bar, { width: 9 }]} />
              <View style={[styles.bar, { width: 4 }]} />
              <View style={[styles.bar, { width: 6 }]} />
              <View style={[styles.bar, { width: 2 }]} />
              <View style={[styles.bar, { width: 5 }]} />
              <View style={[styles.bar, { width: 8 }]} />
            </View>
            <Text style={styles.barcodeText}>* VS-001-2026-HQ *</Text>
          </View>
        </View>
      )}

      {/* TAB 2: EMPLOYMENT & INR SALARY SUMMARY */}
      {activeTab === "employment" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Compensation (INR ₹)</Text>
          <Text style={styles.sectionDesc}>
            Confidential employee salary breakdown (DD-MM-YYYY / Asia/Kolkata).
          </Text>

          <View style={styles.salaryHighlight}>
            <Text style={styles.salaryLabel}>Monthly Gross CTC</Text>
            <Text style={styles.salaryAmount}>{formatINR(employee.grossSalaryINR)}</Text>
            <Text style={styles.salaryAnnual}>
              Annual Equivalent: {formatINR(employee.grossSalaryINR * 12)}
            </Text>
          </View>

          <View style={styles.salaryBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Basic Salary (50%)</Text>
              <Text style={styles.breakdownValue}>{formatINR(employee.basicSalaryINR)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>HRA (20%)</Text>
              <Text style={styles.breakdownValue}>{formatINR(employee.hraINR)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Special Allowances</Text>
              <Text style={styles.breakdownValue}>{formatINR(employee.allowancesINR)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Provident Fund (PF)</Text>
              <Text style={[styles.breakdownValue, styles.deduction]}>- ₹1,800</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Professional Tax (PT)</Text>
              <Text style={[styles.breakdownValue, styles.deduction]}>- ₹200</Text>
            </View>
          </View>
        </View>
      )}

      {/* TAB 3: ANDROID DEVICE SECURITY SETTINGS */}
      {activeTab === "security" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Android Hardware Binding</Text>
          <Text style={styles.sectionDesc}>
            Your VSecure account is hardware-locked to this Android device.
          </Text>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Bound Handset</Text>
              <Text style={styles.settingSub}>{employee.boundDevice}</Text>
              <Text style={styles.monoSub}>ID: {employee.boundDeviceId}</Text>
            </View>
            <Text style={styles.boundBadge}>LOCKED</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Biometric Quick-Unlock</Text>
              <Text style={styles.settingSub}>Fingerprint / Face recognition for attendance</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert(
                "Request Device Change",
                "To prevent attendance buddy-punching, changing your physical device requires authorization from Administrator Vishnu."
              )
            }
          >
            <Text style={styles.actionButtonText}>Submit Handset Change Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out from Mobile Shell</Text>
          </TouchableOpacity>
        </View>
      )}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  badgeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  badgeCompany: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  badgeSub: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  roleTag: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },
  idBody: {
    alignItems: "center",
    paddingVertical: 18,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  photoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  idName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  idCode: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 2,
    fontFamily: "System",
  },
  idDesignation: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  idDept: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  badgeGrid: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  badgeGridItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  gridValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
  bloodRed: {
    color: "#DC2626",
  },
  barcodeSection: {
    marginTop: 18,
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  barcodeLines: {
    flexDirection: "row",
    height: 36,
    alignItems: "center",
    gap: 3,
  },
  bar: {
    height: 36,
    backgroundColor: "#0F172A",
    borderRadius: 1,
  },
  barcodeText: {
    fontSize: 10,
    fontFamily: "System",
    fontWeight: "700",
    color: "#64748B",
    marginTop: 6,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 14,
  },
  salaryHighlight: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  salaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  salaryAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  salaryAnnual: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  salaryBreakdown: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  deduction: {
    color: "#DC2626",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  settingSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  monoSub: {
    fontSize: 10,
    fontFamily: "System",
    color: "#94A3B8",
    marginTop: 1,
  },
  boundBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  actionButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  actionButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  signOutButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  signOutButtonText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
});
