import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  formatDateDDMMYYYY,
  formatINR,
  formatINRInWords,
  getPayrollStatusConfig,
  getPaymentStatusConfig,
  maskBankAccountNumber,
} from "@vsecure/shared";

interface MobileSalarySnapshot {
  month: number;
  year: number;
  monthName: string;
  basicSalaryINR: number;
  hraINR: number;
  conveyanceINR: number;
  specialAllowanceINR: number;
  grossEarningsINR: number;
  pfEmployeeINR: number;
  esiEmployeeINR: number;
  profTaxINR: number;
  lopDays: number;
  lopDeductionINR: number;
  totalDeductions: number;
  netPayableINR: number;
  workingDays: number;
  presentDays: number;
  status: "FINALIZED" | "APPROVED" | "PAID";
  isPaid: boolean;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
}

const EMPLOYEES = {
  KAVITA: {
    code: "VS-004",
    name: "Kavita Raman",
    designation: "Senior Cloud Engineer",
    department: "Engineering & Architecture",
    joiningDate: "01-06-2024",
    bankName: "Axis Bank",
    accountNumber: "918010045829103",
    ifsc: "UTIB0000123",
    history: [
      {
        month: 10,
        year: 2026,
        monthName: "October 2026",
        basicSalaryINR: 55000,
        hraINR: 27500,
        conveyanceINR: 5000,
        specialAllowanceINR: 22500,
        grossEarningsINR: 110000,
        pfEmployeeINR: 1800,
        esiEmployeeINR: 0,
        profTaxINR: 200,
        lopDays: 0,
        lopDeductionINR: 0,
        totalDeductions: 2000,
        netPayableINR: 108000,
        workingDays: 22,
        presentDays: 20, // 2 days approved casual leave
        status: "APPROVED" as const,
        isPaid: false,
        bankName: "Axis Bank",
        bankAccountNumber: "918010045829103",
        bankIFSC: "UTIB0000123",
      },
      {
        month: 9,
        year: 2026,
        monthName: "September 2026",
        basicSalaryINR: 55000,
        hraINR: 27500,
        conveyanceINR: 5000,
        specialAllowanceINR: 22500,
        grossEarningsINR: 110000,
        pfEmployeeINR: 1800,
        esiEmployeeINR: 0,
        profTaxINR: 200,
        lopDays: 0,
        lopDeductionINR: 0,
        totalDeductions: 2000,
        netPayableINR: 108000,
        workingDays: 22,
        presentDays: 22,
        status: "PAID" as const,
        isPaid: true,
        paidAt: "01-10-2026",
        paymentMethod: "NEFT",
        paymentReference: "CMS98471203948",
        bankName: "Axis Bank",
        bankAccountNumber: "918010045829103",
        bankIFSC: "UTIB0000123",
      },
    ],
  },
  VISHNU: {
    code: "VS-001",
    name: "Vishnu",
    designation: "Founder & Chief Architect",
    department: "Engineering & Architecture",
    joiningDate: "01-01-2024",
    bankName: "HDFC Bank",
    accountNumber: "50100987654321",
    ifsc: "HDFC0001234",
    history: [
      {
        month: 10,
        year: 2026,
        monthName: "October 2026",
        basicSalaryINR: 120000,
        hraINR: 60000,
        conveyanceINR: 10000,
        specialAllowanceINR: 60000,
        grossEarningsINR: 250000,
        pfEmployeeINR: 1800,
        esiEmployeeINR: 0,
        profTaxINR: 200,
        lopDays: 0,
        lopDeductionINR: 0,
        totalDeductions: 2000,
        netPayableINR: 248000,
        workingDays: 22,
        presentDays: 22,
        status: "APPROVED" as const,
        isPaid: false,
        bankName: "HDFC Bank",
        bankAccountNumber: "50100987654321",
        bankIFSC: "HDFC0001234",
      },
    ],
  },
  RAHUL: {
    code: "VS-005",
    name: "Rahul Verma",
    designation: "Cloud Operations Engineer",
    department: "Cloud & Operations",
    joiningDate: "15-07-2024",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "781290384721",
    ifsc: "KKBK0000987",
    history: [
      {
        month: 10,
        year: 2026,
        monthName: "October 2026",
        basicSalaryINR: 22000,
        hraINR: 11000,
        conveyanceINR: 3000,
        specialAllowanceINR: 9000,
        grossEarningsINR: 45000,
        pfEmployeeINR: 1800,
        esiEmployeeINR: 0,
        profTaxINR: 200,
        lopDays: 1, // 1 LOP Day = 45000/31 = ₹1,452 deduction
        lopDeductionINR: 1452,
        totalDeductions: 3452,
        netPayableINR: 41548,
        workingDays: 22,
        presentDays: 21,
        status: "APPROVED" as const,
        isPaid: false,
        bankName: "Kotak Mahindra Bank",
        bankAccountNumber: "781290384721",
        bankIFSC: "KKBK0000987",
      },
    ],
  },
};

export default function MobilePayrollScreen() {
  const router = useRouter();
  const [activePersona, setActivePersona] = useState<"KAVITA" | "VISHNU" | "RAHUL">("KAVITA");
  const [selectedPayslip, setSelectedPayslip] = useState<MobileSalarySnapshot | null>(null);

  const currentEmp = EMPLOYEES[activePersona];
  const currentMonthPay = currentEmp.history[0];

  const handleDownloadPayslip = (pay: MobileSalarySnapshot) => {
    Alert.alert(
      "Payslip PDF Saved",
      `Payslip for ${pay.monthName} has been generated and saved to your device downloads folder.`,
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Persona Switcher Banner */}
      <View style={styles.personaCard}>
        <View style={styles.personaHeader}>
          <Text style={styles.personaTitle}>ACTIVE MOBILE PROFILE</Text>
          <View style={styles.personaTag}>
            <Text style={styles.personaTagText}>Phase 5</Text>
          </View>
        </View>

        <View style={styles.personaButtons}>
          <TouchableOpacity
            style={[
              styles.personaBtn,
              activePersona === "KAVITA" && styles.personaBtnActive,
            ]}
            onPress={() => setActivePersona("KAVITA")}
          >
            <Text
              style={[
                styles.personaBtnText,
                activePersona === "KAVITA" && styles.personaBtnTextActive,
              ]}
            >
              Kavita (Engineer)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaBtn,
              activePersona === "RAHUL" && styles.personaBtnActive,
            ]}
            onPress={() => setActivePersona("RAHUL")}
          >
            <Text
              style={[
                styles.personaBtnText,
                activePersona === "RAHUL" && styles.personaBtnTextActive,
              ]}
            >
              Rahul (1 LOP Day)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaBtn,
              activePersona === "VISHNU" && styles.personaBtnActive,
            ]}
            onPress={() => setActivePersona("VISHNU")}
          >
            <Text
              style={[
                styles.personaBtnText,
                activePersona === "VISHNU" && styles.personaBtnTextActive,
              ]}
            >
              Vishnu (Admin)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Month Net Pay Highlight Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroSubtext}>NET SALARY PAYABLE</Text>
            <Text style={styles.heroAmount}>{formatINR(currentMonthPay.netPayableINR, false)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>● {currentMonthPay.status}</Text>
          </View>
        </View>

        <Text style={styles.heroWords}>
          {formatINRInWords(currentMonthPay.netPayableINR)}
        </Text>

        <View style={styles.heroDivider} />

        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.heroMetaLabel}>Period</Text>
            <Text style={styles.heroMetaValue}>{currentMonthPay.monthName}</Text>
          </View>
          <View>
            <Text style={styles.heroMetaLabel}>Attendance</Text>
            <Text style={styles.heroMetaValue}>
              {currentMonthPay.presentDays} / {currentMonthPay.workingDays} Days
            </Text>
          </View>
          <View>
            <Text style={styles.heroMetaLabel}>Loss of Pay</Text>
            <Text
              style={[
                styles.heroMetaValue,
                currentMonthPay.lopDays > 0 && { color: "#E11D48", fontWeight: "700" },
              ]}
            >
              {currentMonthPay.lopDays} {currentMonthPay.lopDays === 1 ? "Day" : "Days"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewPayslipBtn}
          onPress={() => setSelectedPayslip(currentMonthPay)}
        >
          <Text style={styles.viewPayslipBtnText}>View Full Digital Payslip</Text>
        </TouchableOpacity>
      </View>

      {/* Earnings & Deductions Breakdown Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>SALARY BREAKDOWN (OCT 2026)</Text>

        <View style={styles.breakdownGroup}>
          <Text style={styles.groupHeading}>Earnings (Gross: {formatINR(currentMonthPay.grossEarningsINR, false)})</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Basic Salary</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.basicSalaryINR, false)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>House Rent Allowance (HRA)</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.hraINR, false)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Conveyance Allowance</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.conveyanceINR, false)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Special Allowance</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.specialAllowanceINR, false)}</Text>
          </View>
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownGroup}>
          <Text style={styles.groupHeading}>Deductions (Total: {formatINR(currentMonthPay.totalDeductions, false)})</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Provident Fund (PF 12%)</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.pfEmployeeINR, false)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Professional Tax (PT)</Text>
            <Text style={styles.rowValue}>{formatINR(currentMonthPay.profTaxINR, false)}</Text>
          </View>
          {currentMonthPay.lopDeductionINR > 0 && (
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: "#E11D48", fontWeight: "600" }]}>
                Loss of Pay (LOP: {currentMonthPay.lopDays} Day)
              </Text>
              <Text style={[styles.rowValue, { color: "#E11D48", fontWeight: "700" }]}>
                -{formatINR(currentMonthPay.lopDeductionINR, false)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bank Account Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>DIRECT DEPOSIT BANK ACCOUNT</Text>
        <View style={styles.bankGrid}>
          <View style={styles.bankItem}>
            <Text style={styles.bankLabel}>Bank Name</Text>
            <Text style={styles.bankValue}>{currentEmp.bankName}</Text>
          </View>
          <View style={styles.bankItem}>
            <Text style={styles.bankLabel}>Account Number</Text>
            <Text style={styles.bankValue}>{maskBankAccountNumber(currentEmp.accountNumber)}</Text>
          </View>
          <View style={styles.bankItem}>
            <Text style={styles.bankLabel}>IFSC Code</Text>
            <Text style={styles.bankValue}>{currentEmp.ifsc}</Text>
          </View>
        </View>
      </View>

      {/* Salary History */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>PAST PAYSLIPS & SALARY HISTORY</Text>

        {currentEmp.history.map((h, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.historyItem}
            onPress={() => setSelectedPayslip(h)}
          >
            <View>
              <Text style={styles.historyMonth}>{h.monthName}</Text>
              <Text style={styles.historyMeta}>
                Gross: {formatINR(h.grossEarningsINR, false)} • Deduct: {formatINR(h.totalDeductions, false)}
              </Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyAmount}>{formatINR(h.netPayableINR, false)}</Text>
              <Text style={styles.historyStatus}>{h.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Digital Payslip Modal */}
      <Modal
        visible={!!selectedPayslip}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPayslip(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>DIGITAL PAYSLIP</Text>
              <TouchableOpacity onPress={() => setSelectedPayslip(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPayslip && (
              <ScrollView style={styles.modalBody}>
                {/* Letterhead */}
                <View style={styles.letterhead}>
                  <Text style={styles.companyName}>VSecure Technologies Pvt Ltd</Text>
                  <Text style={styles.companyAddress}>
                    Tech Park Campus, Outer Ring Road, Bengaluru 560103
                  </Text>
                  <Text style={styles.payslipPeriodTitle}>
                    PAYSLIP FOR {selectedPayslip.monthName.toUpperCase()}
                  </Text>
                </View>

                {/* Employee details */}
                <View style={styles.empBox}>
                  <Text style={styles.empText}>
                    <Text style={styles.bold}>Name:</Text> {currentEmp.name}
                  </Text>
                  <Text style={styles.empText}>
                    <Text style={styles.bold}>Employee ID:</Text> {currentEmp.code}
                  </Text>
                  <Text style={styles.empText}>
                    <Text style={styles.bold}>Designation:</Text> {currentEmp.designation}
                  </Text>
                  <Text style={styles.empText}>
                    <Text style={styles.bold}>Department:</Text> {currentEmp.department}
                  </Text>
                  <Text style={styles.empText}>
                    <Text style={styles.bold}>Bank Acct:</Text> {maskBankAccountNumber(selectedPayslip.bankAccountNumber)} ({selectedPayslip.bankIFSC})
                  </Text>
                </View>

                {/* Net Pay Highlight */}
                <View style={styles.modalNetBox}>
                  <Text style={styles.modalNetLabel}>NET SALARY PAYABLE</Text>
                  <Text style={styles.modalNetAmount}>
                    {formatINR(selectedPayslip.netPayableINR, true)}
                  </Text>
                  <Text style={styles.modalNetWords}>
                    {formatINRInWords(selectedPayslip.netPayableINR)}
                  </Text>
                </View>

                {/* Download PDF button */}
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => handleDownloadPayslip(selectedPayslip)}
                >
                  <Text style={styles.downloadBtnText}>Download PDF Payslip</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  personaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  personaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  personaTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  personaTag: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  personaTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  personaButtons: {
    flexDirection: "row",
    gap: 6,
  },
  personaBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  personaBtnActive: {
    backgroundColor: "#2563EB",
  },
  personaBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  personaBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroSubtext: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  heroWords: {
    fontSize: 11,
    color: "#475569",
    fontStyle: "italic",
    marginTop: 6,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  heroMetaLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  heroMetaValue: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "600",
    marginTop: 2,
  },
  viewPayslipBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  viewPayslipBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  breakdownGroup: {
    marginVertical: 4,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  rowLabel: {
    fontSize: 12,
    color: "#475569",
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
  bankGrid: {
    gap: 8,
  },
  bankItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  bankLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  bankValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    fontFamily: "monospace",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  historyMonth: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  historyMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  historyStatus: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  modalHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  modalCloseText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  modalBody: {
    padding: 16,
  },
  letterhead: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 12,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  companyAddress: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
  },
  payslipPeriodTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  empBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    gap: 3,
  },
  empText: {
    fontSize: 11,
    color: "#334155",
  },
  bold: {
    fontWeight: "700",
    color: "#0F172A",
  },
  modalNetBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  modalNetLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E40AF",
  },
  modalNetAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1D4ED8",
    marginTop: 4,
  },
  modalNetWords: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
  },
  downloadBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 14,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
