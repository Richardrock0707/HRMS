import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  formatDateDDMMYYYY,
  formatTime12HourIST,
  calculateLeaveDuration,
  detectLeaveConflicts,
  DEFAULT_LEAVE_TYPES,
  DEFAULT_2026_HOLIDAYS,
  LeaveType,
} from "@vsecure/shared";

interface MobileLeaveRecord {
  id: string;
  referenceId: string;
  employeeCode: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDaySession?: string;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function MobileLeaveScreen() {
  const router = useRouter();

  // Active persona for mobile
  const [activePersona, setActivePersona] = useState<"VISHNU" | "KAVITA">("KAVITA");

  const currentEmployee = activePersona === "KAVITA"
    ? {
        code: "VS-004",
        name: "Kavita Nair",
        role: "Site Reliability Engineer",
        dept: "Cloud & Operations",
        isManager: false,
      }
    : {
        code: "VS-001",
        name: "Vishnu",
        role: "Super Administrator • Founder",
        dept: "Engineering & Architecture",
        isManager: true,
      };

  // Balances
  const [balances, setBalances] = useState({
    CASUAL: activePersona === "KAVITA" ? 10.0 : 12.0,
    SICK: 10.0,
    EARNED: 15.0,
    UNPAID_LOP: 0.0,
  });

  // Requests state
  const [requests, setRequests] = useState<MobileLeaveRecord[]>([
    {
      id: "leave_001",
      referenceId: "LV-2026-001",
      employeeCode: "VS-004",
      employeeName: "Kavita Nair",
      leaveType: "CASUAL",
      startDate: "12-10-2026",
      endDate: "13-10-2026",
      totalDays: 2.0,
      isHalfDay: false,
      reason: "Family wedding in hometown (Thrissur, Kerala)",
      status: "APPROVED",
      approvedBy: "Arjun Mehta (Engineering Manager)",
      createdAt: "08-10-2026",
    },
    {
      id: "leave_002",
      referenceId: "LV-2026-002",
      employeeCode: "VS-003",
      employeeName: "Arjun Mehta",
      leaveType: "EARNED",
      startDate: "28-10-2026",
      endDate: "30-10-2026",
      totalDays: 3.0,
      isHalfDay: false,
      reason: "Attending Cloud Architecture Summit in Hyderabad",
      status: "PENDING",
      createdAt: "16-10-2026",
    },
    {
      id: "leave_003",
      referenceId: "LV-2026-003",
      employeeCode: "VS-002",
      employeeName: "Priya Sharma",
      leaveType: "SICK",
      startDate: "22-10-2026",
      endDate: "22-10-2026",
      totalDays: 0.5,
      isHalfDay: true,
      halfDaySession: "Morning Half",
      reason: "Dental appointment consultation",
      status: "PENDING",
      createdAt: "17-10-2026",
    },
  ]);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedReviewReq, setSelectedReviewReq] = useState<MobileLeaveRecord | null>(null);
  const [rejectionRemark, setRejectionRemark] = useState("");

  // Form State
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType>("CASUAL");
  const [startDateStr, setStartDateStr] = useState(formatDateDDMMYYYY(new Date()));
  const [endDateStr, setEndDateStr] = useState(formatDateDDMMYYYY(new Date()));
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"FIRST_HALF" | "SECOND_HALF">("FIRST_HALF");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Duration Math
  const durationCalc = calculateLeaveDuration({
    startDate: startDateStr,
    endDate: isHalfDay ? startDateStr : endDateStr,
    isHalfDay,
    excludeWeekends: true,
    excludeHolidays: true,
    holidays: DEFAULT_2026_HOLIDAYS,
  });

  // Handle Apply Submission
  const handleApplyLeave = () => {
    if (!leaveReason || leaveReason.trim().length < 5) {
      Alert.alert("Validation Error", "Please provide a valid leave reason (minimum 5 characters).");
      return;
    }

    if (!durationCalc.isValid || durationCalc.totalDays <= 0) {
      Alert.alert(
        "Invalid Dates",
        durationCalc.errorMessage || "Selected period contains only weekends or recognized holidays."
      );
      return;
    }

    // Check balance
    const available = (balances as any)[selectedLeaveType] ?? 0;
    if (selectedLeaveType !== "UNPAID_LOP" && durationCalc.totalDays > available) {
      Alert.alert(
        "Insufficient Balance",
        `You have ${available} days available for ${selectedLeaveType}, but requested ${durationCalc.totalDays} day(s).`
      );
      return;
    }

    // Conflict check
    const conflict = detectLeaveConflicts(
      requests.filter((r) => r.employeeCode === currentEmployee.code),
      startDateStr,
      isHalfDay ? startDateStr : endDateStr,
      isHalfDay,
      halfDaySession
    );

    if (conflict.hasConflict) {
      Alert.alert("Leave Conflict Detected", conflict.reason || "Conflicting leave dates.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const refId = `LV-2026-${String(requests.length + 1).padStart(3, "0")}`;
      const newReq: MobileLeaveRecord = {
        id: `leave_${Date.now()}`,
        referenceId: refId,
        employeeCode: currentEmployee.code,
        employeeName: currentEmployee.name,
        leaveType: selectedLeaveType,
        startDate: startDateStr,
        endDate: isHalfDay ? startDateStr : endDateStr,
        totalDays: durationCalc.totalDays,
        isHalfDay,
        halfDaySession: isHalfDay
          ? halfDaySession === "FIRST_HALF"
            ? "Morning Half"
            : "Afternoon Half"
          : undefined,
        reason: leaveReason.trim(),
        status: "PENDING",
        createdAt: formatDateDDMMYYYY(new Date()),
      };

      setRequests([newReq, ...requests]);
      setIsSubmitting(false);
      setIsApplyModalOpen(false);
      setLeaveReason("");

      Alert.alert(
        "Application Submitted!",
        `Leave application ${refId} for ${durationCalc.totalDays} day(s) sent to manager for approval.`
      );
    }, 600);
  };

  // Review Decision
  const handleDecision = (decision: "APPROVE" | "REJECT") => {
    if (!selectedReviewReq) return;

    if (decision === "REJECT" && (!rejectionRemark || rejectionRemark.trim().length < 3)) {
      Alert.alert("Remark Required", "Please provide a mandatory reason for rejecting this leave request.");
      return;
    }

    // Anti-self-approval check
    if (selectedReviewReq.employeeCode === currentEmployee.code) {
      Alert.alert("Anti-Self-Approval", "You cannot approve your own leave application.");
      return;
    }

    const updated = requests.map((r) => {
      if (r.id === selectedReviewReq.id) {
        return {
          ...r,
          status: (decision === "APPROVE" ? "APPROVED" : "REJECTED") as any,
          approvedBy: decision === "APPROVE" ? `${currentEmployee.name} (${currentEmployee.role})` : undefined,
          rejectionReason: decision === "REJECT" ? rejectionRemark : undefined,
        };
      }
      return r;
    });

    setRequests(updated);
    setSelectedReviewReq(null);
    setRejectionRemark("");

    Alert.alert(
      decision === "APPROVE" ? "Leave Approved" : "Leave Rejected",
      `Request ${selectedReviewReq.referenceId} has been ${decision.toLowerCase()}d.`
    );
  };

  // Cancel Request
  const handleCancelRequest = (req: MobileLeaveRecord) => {
    Alert.alert(
      "Cancel Leave Request",
      `Are you sure you want to cancel ${req.referenceId}? Deducted days will be refunded back to balance.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            const updated = requests.map((r) => {
              if (r.id === req.id) {
                return { ...r, status: "CANCELLED" as any };
              }
              return r;
            });
            setRequests(updated);

            // Refund balance if approved
            if (req.status === "APPROVED") {
              setBalances((prev: any) => ({
                ...prev,
                [req.leaveType]: (prev[req.leaveType] || 0) + req.totalDays,
              }));
            }

            Alert.alert("Request Cancelled", `${req.referenceId} has been cancelled successfully.`);
          },
        },
      ]
    );
  };

  // Filter requests
  const myRequests = requests.filter((r) => r.employeeCode === currentEmployee.code);
  const pendingQueue = requests.filter((r) => r.status === "PENDING" && r.employeeCode !== currentEmployee.code);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSubtitle}>VSecure Technologies</Text>
            <Text style={styles.headerTitle}>Leave Management</Text>
          </View>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>Phase 4</Text>
          </View>
        </View>

        {/* Persona Switcher */}
        <View style={styles.personaRow}>
          <Text style={styles.personaLabel}>Active Role:</Text>
          <TouchableOpacity
            style={[
              styles.personaButton,
              activePersona === "KAVITA" && styles.personaButtonActive,
            ]}
            onPress={() => setActivePersona("KAVITA")}
          >
            <Text
              style={[
                styles.personaButtonText,
                activePersona === "KAVITA" && styles.personaButtonTextActive,
              ]}
            >
              Kavita (VS-004)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.personaButton,
              activePersona === "VISHNU" && styles.personaButtonActive,
            ]}
            onPress={() => setActivePersona("VISHNU")}
          >
            <Text
              style={[
                styles.personaButtonText,
                activePersona === "VISHNU" && styles.personaButtonTextActive,
              ]}
            >
              Vishnu (VS-001)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Quotas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Leave Balances (CY 2026)</Text>
        <Text style={styles.sectionMeta}>{currentEmployee.code}</Text>
      </View>

      <View style={styles.balanceGrid}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.typeBadge, styles.badgeTeal]}>CL</Text>
            <Text style={styles.balanceSub}>Casual</Text>
          </View>
          <Text style={styles.balanceNumber}>{balances.CASUAL}</Text>
          <Text style={styles.balanceQuota}>/ 12 days quota</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.typeBadge, styles.badgeAmber]}>SL</Text>
            <Text style={styles.balanceSub}>Sick</Text>
          </View>
          <Text style={styles.balanceNumber}>{balances.SICK}</Text>
          <Text style={styles.balanceQuota}>/ 10 days quota</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.typeBadge, styles.badgeBlue]}>EL</Text>
            <Text style={styles.balanceSub}>Earned</Text>
          </View>
          <Text style={styles.balanceNumber}>{balances.EARNED}</Text>
          <Text style={styles.balanceQuota}>/ 15 days quota</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.typeBadge, styles.badgeRose]}>LOP</Text>
            <Text style={styles.balanceSub}>Unpaid</Text>
          </View>
          <Text style={styles.balanceNumber}>{balances.UNPAID_LOP}</Text>
          <Text style={styles.balanceQuota}>Loss of Pay</Text>
        </View>
      </View>

      {/* Primary Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setIsApplyModalOpen(true)}
        >
          <Text style={styles.primaryBtnText}>+ Apply for Leave</Text>
        </TouchableOpacity>

        {currentEmployee.isManager && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setIsApprovalModalOpen(true)}
          >
            <Text style={styles.secondaryBtnText}>
              Approval Queue ({pendingQueue.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Leave History */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Leave Requests</Text>
        <Text style={styles.sectionMeta}>{myRequests.length} requests</Text>
      </View>

      {myRequests.map((req) => {
        const isApproved = req.status === "APPROVED";
        const isPending = req.status === "PENDING";
        const isRejected = req.status === "REJECTED";

        return (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.requestCardHeader}>
              <View>
                <Text style={styles.requestRef}>{req.referenceId}</Text>
                <Text style={styles.requestDates}>
                  {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isApproved && styles.statusBadgeApproved,
                  isPending && styles.statusBadgePending,
                  isRejected && styles.statusBadgeRejected,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isApproved && styles.statusTextApproved,
                    isPending && styles.statusTextPending,
                    isRejected && styles.statusTextRejected,
                  ]}
                >
                  {req.status}
                </Text>
              </View>
            </View>

            <View style={styles.requestMetaRow}>
              <Text style={styles.requestCategory}>
                {req.leaveType} • {req.totalDays} day(s) {req.isHalfDay && `(${req.halfDaySession || "Half Day"})`}
              </Text>
              {req.status !== "CANCELLED" && (
                <TouchableOpacity
                  onPress={() => handleCancelRequest(req)}
                  style={styles.cancelLink}
                >
                  <Text style={styles.cancelLinkText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.requestReason} numberOfLines={2}>
              {req.reason}
            </Text>

            {req.approvedBy && (
              <Text style={styles.requestRemark}>Actioned by: {req.approvedBy}</Text>
            )}
            {req.rejectionReason && (
              <Text style={styles.requestRejection}>Reason: {req.rejectionReason}</Text>
            )}
          </View>
        );
      })}

      {/* Return to Home GPS button */}
      <TouchableOpacity
        style={styles.backHomeBtn}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.backHomeBtnText}>← Return to GPS Attendance</Text>
      </TouchableOpacity>

      {/* =========================================================================
          APPLY LEAVE MODAL
         ========================================================================= */}
      <Modal visible={isApplyModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Leave</Text>
              <TouchableOpacity onPress={() => setIsApplyModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category */}
              <Text style={styles.inputLabel}>Leave Category:</Text>
              <View style={styles.typePillRow}>
                {(["CASUAL", "SICK", "EARNED", "UNPAID_LOP"] as LeaveType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typePill,
                      selectedLeaveType === type && styles.typePillActive,
                    ]}
                    onPress={() => setSelectedLeaveType(type)}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        selectedLeaveType === type && styles.typePillTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Start Date */}
              <Text style={styles.inputLabel}>Start Date (DD-MM-YYYY):</Text>
              <TextInput
                style={styles.textInput}
                value={startDateStr}
                onChangeText={(t) => {
                  setStartDateStr(t);
                  if (isHalfDay) setEndDateStr(t);
                }}
                placeholder="DD-MM-YYYY"
              />

              {/* End Date */}
              <Text style={styles.inputLabel}>End Date (DD-MM-YYYY):</Text>
              <TextInput
                style={[styles.textInput, isHalfDay && styles.textInputDisabled]}
                editable={!isHalfDay}
                value={isHalfDay ? startDateStr : endDateStr}
                onChangeText={setEndDateStr}
                placeholder="DD-MM-YYYY"
              />

              {/* Half-Day Toggle */}
              <View style={styles.halfDayToggleRow}>
                <TouchableOpacity
                  style={[styles.checkbox, isHalfDay && styles.checkboxActive]}
                  onPress={() => {
                    setIsHalfDay(!isHalfDay);
                    if (!isHalfDay) setEndDateStr(startDateStr);
                  }}
                >
                  {isHalfDay && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.halfDayLabel}>Request Half-Day (0.5 day)</Text>
              </View>

              {/* Calculated Breakdown */}
              <View style={styles.durationCard}>
                <Text style={styles.durationText}>
                  Calculated Working Days:{" "}
                  <Text style={styles.durationBold}>{durationCalc.totalDays} day(s)</Text>
                </Text>
                <Text style={styles.durationSub}>
                  Excludes Saturdays, Sundays, and 2026 Public Holidays
                </Text>
              </View>

              {/* Reason */}
              <Text style={styles.inputLabel}>Reason for Leave:</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={3}
                value={leaveReason}
                onChangeText={setLeaveReason}
                placeholder="Enter personal errand, medical recovery, or vacation purpose..."
              />

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleApplyLeave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Leave Application</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MANAGER APPROVAL QUEUE MODAL
         ========================================================================= */}
      <Modal visible={isApprovalModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manager Approval Queue</Text>
              <TouchableOpacity onPress={() => setIsApprovalModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {pendingQueue.length === 0 ? (
                <Text style={styles.emptyQueueText}>No pending requests to review.</Text>
              ) : (
                pendingQueue.map((req) => (
                  <View key={req.id} style={styles.approvalItemCard}>
                    <View style={styles.approvalHeader}>
                      <Text style={styles.approvalName}>{req.employeeName}</Text>
                      <Text style={styles.approvalRef}>{req.referenceId}</Text>
                    </View>
                    <Text style={styles.approvalDates}>
                      {req.leaveType} • {req.totalDays} day(s) ({req.startDate} to {req.endDate})
                    </Text>
                    <Text style={styles.approvalReason}>{req.reason}</Text>

                    {selectedReviewReq?.id === req.id && (
                      <TextInput
                        style={[styles.textInput, { marginTop: 8 }]}
                        placeholder="Rejection remark (mandatory if rejecting)..."
                        value={rejectionRemark}
                        onChangeText={setRejectionRemark}
                      />
                    )}

                    <View style={styles.approvalBtnRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => {
                          setSelectedReviewReq(req);
                          handleDecision("REJECT");
                        }}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => {
                          setSelectedReviewReq(req);
                          handleDecision("APPROVE");
                        }}
                      >
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  phaseBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: "auto",
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  personaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  personaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  personaButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  personaButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  personaButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  personaButtonTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  balanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeTeal: {
    backgroundColor: "#F0FDFA",
    color: "#0D9488",
  },
  badgeAmber: {
    backgroundColor: "#FFFBEB",
    color: "#D97706",
  },
  badgeBlue: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
  },
  badgeRose: {
    backgroundColor: "#FFF1F2",
    color: "#E11D48",
  },
  balanceSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  balanceNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  balanceQuota: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  requestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  requestRef: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  requestDates: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeApproved: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  statusBadgePending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  statusBadgeRejected: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusTextApproved: {
    color: "#059669",
  },
  statusTextPending: {
    color: "#D97706",
  },
  statusTextRejected: {
    color: "#E11D48",
  },
  requestMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  requestCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  cancelLink: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cancelLinkText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E11D48",
  },
  requestReason: {
    fontSize: 11,
    color: "#475569",
    marginTop: 6,
    lineHeight: 16,
  },
  requestRemark: {
    fontSize: 10,
    color: "#059669",
    marginTop: 4,
    fontWeight: "600",
  },
  requestRejection: {
    fontSize: 10,
    color: "#E11D48",
    marginTop: 4,
    fontWeight: "600",
  },
  backHomeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  backHomeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#94A3B8",
    padding: 4,
  },
  modalBody: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 6,
  },
  typePillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  typePillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  typePillTextActive: {
    color: "#FFFFFF",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: "#0F172A",
    marginBottom: 4,
  },
  textInputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#94A3B8",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  halfDayToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  halfDayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  durationCard: {
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginVertical: 6,
  },
  durationText: {
    fontSize: 11,
    color: "#1E40AF",
  },
  durationBold: {
    fontWeight: "800",
  },
  durationSub: {
    fontSize: 10,
    color: "#3B82F6",
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyQueueText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    paddingVertical: 24,
  },
  approvalItemCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  approvalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  approvalName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  approvalRef: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  approvalDates: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 2,
  },
  approvalReason: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
  },
  approvalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  rejectBtn: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rejectBtnText: {
    color: "#E11D48",
    fontSize: 11,
    fontWeight: "700",
  },
  approveBtn: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
