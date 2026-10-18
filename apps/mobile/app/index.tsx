import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  VSECURE_CONFIG,
  DEFAULT_OFFICE_COORDINATES,
  DEFAULT_CLIENT_SITES,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  formatINR,
  calculateDistanceMeters,
  evaluateGpsAccuracy,
  evaluateLocationRisk,
  evaluatePunctuality,
  calculateWorkingHours,
} from "@vsecure/shared";

export default function MobileHomeScreen() {
  const router = useRouter();

  // Clock state (Strict 12-Hour IST & DD-MM-YYYY)
  const [currentDate, setCurrentDate] = useState(formatDateDDMMYYYY(new Date()));
  const [currentTime, setCurrentTime] = useState(formatTime12HourIST(new Date()));

  // Active User Profile (Supports switching between Vishnu VS-001 and Field Engineer Kavita VS-004)
  const [currentEmployee, setCurrentEmployee] = useState({
    code: "VS-001",
    name: "Vishnu",
    role: "Super Administrator • Founder",
    department: "Engineering & Architecture",
    initial: "V",
    isFieldEngineer: false,
  });

  // Mode: "OFFICE" or "FIELD_DUTY"
  const [attendanceMode, setAttendanceMode] = useState<"OFFICE" | "FIELD_DUTY">("OFFICE");
  const [selectedClientSiteIndex, setSelectedClientSiteIndex] = useState(0);

  // GPS & Geofence State
  const [gpsPermission, setGpsPermission] = useState<"granted" | "denied" | "pending">("pending");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.93524, // 8 meters from HQ center
    lng: 77.69465,
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(8.5); // meters
  const [isMockLocation, setIsMockLocation] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Attendance State Machine
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);
  const [checkInTimeStr, setCheckInTimeStr] = useState<string>("09:24 AM");
  const [checkInDateObj, setCheckInDateObj] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 24, 0, 0);
    return d;
  });
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const [checkOutTimeStr, setCheckOutTimeStr] = useState<string | null>(null);
  const [workingDurationStr, setWorkingDurationStr] = useState<string>("In Progress");
  const [attendanceStatus, setAttendanceStatus] = useState<"PRESENT" | "LATE" | "FIELD_DUTY">("PRESENT");

  // Loading & Feedback
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Punctual arrival inside 100m HQ geofence (±8.5m accuracy)."
  );

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);
  const [isFieldVisitModalOpen, setIsFieldVisitModalOpen] = useState<boolean>(false);
  const [fieldVisitNotes, setFieldVisitNotes] = useState<string>("");
  const [fieldWorkOrder, setFieldWorkOrder] = useState<string>("WO-INF-2026-09");
  const [completedVisits, setCompletedVisits] = useState<
    Array<{ clientName: string; time: string; notes: string }>
  >([]);

  // Correction Request Form
  const [correctionReason, setCorrectionReason] = useState<string>("");
  const [correctionReqTime, setCorrectionReqTime] = useState<string>("09:30 AM");

  // Determine current target location (HQ or Client Site)
  const office = DEFAULT_OFFICE_COORDINATES;
  const clientSites = DEFAULT_CLIENT_SITES;
  const activeClientSite = clientSites[selectedClientSiteIndex] || clientSites[0];

  const targetLat = attendanceMode === "OFFICE" ? office.latitude : activeClientSite.latitude;
  const targetLng = attendanceMode === "OFFICE" ? office.longitude : activeClientSite.longitude;
  const targetRadius = attendanceMode === "OFFICE" ? office.radiusMeters : activeClientSite.radiusMeters;
  const targetName = attendanceMode === "OFFICE" ? office.name : activeClientSite.name;

  // Calculate distance via Haversine
  const distance = calculateDistanceMeters(currentCoords.lat, currentCoords.lng, targetLat, targetLng);
  const isWithinGeofence = distance <= targetRadius;

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(formatDateDDMMYYYY(now));
      setCurrentTime(formatTime12HourIST(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request GPS Location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setGpsPermission("granted");
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (loc?.coords) {
            setCurrentCoords({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
            setGpsAccuracy(loc.coords.accuracy || 12.0);
            setIsMockLocation(!!(loc as any).mocked);
          }
        } else {
          setGpsPermission("denied");
        }
      } catch (e) {
        // Fallback to high-precision simulation inside HQ perimeter
        setGpsPermission("granted");
      }
    })();
  }, []);

  // Refresh fresh GPS coordinates
  const handleRefreshLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (loc?.coords) {
        setCurrentCoords({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
        setGpsAccuracy(loc.coords.accuracy || 8.0);
        setIsMockLocation(!!(loc as any).mocked);
      }
    } catch (e) {
      // simulated refresh
    } finally {
      setIsLocating(false);
    }
  };

  // Switch between Office Attendance & Field Engineer Duty
  const handleToggleMode = (mode: "OFFICE" | "FIELD_DUTY") => {
    setAttendanceMode(mode);
    if (mode === "FIELD_DUTY") {
      // Simulate client site coordinates
      setCurrentCoords({
        lat: activeClientSite.latitude + 0.00004,
        lng: activeClientSite.longitude + 0.00003,
      });
      setGpsAccuracy(9.5);
    } else {
      // Reset to HQ coordinates
      setCurrentCoords({
        lat: 12.93524,
        lng: 77.69465,
      });
      setGpsAccuracy(8.5);
    }
  };

  // Switch employee persona (Vishnu vs Kavita SRE Field Engineer)
  const handleTogglePersona = () => {
    if (currentEmployee.code === "VS-001") {
      setCurrentEmployee({
        code: "VS-004",
        name: "Kavita Nair",
        role: "Field Site Reliability Engineer",
        department: "Cloud & Operations",
        initial: "K",
        isFieldEngineer: true,
      });
      handleToggleMode("FIELD_DUTY");
    } else {
      setCurrentEmployee({
        code: "VS-001",
        name: "Vishnu",
        role: "Super Administrator • Founder",
        department: "Engineering & Architecture",
        initial: "V",
        isFieldEngineer: false,
      });
      handleToggleMode("OFFICE");
    }
  };

  // Punch In Action
  const handlePunchIn = () => {
    if (isCheckedIn && !isCheckedOut) {
      Alert.alert("Already Checked In", "You have already marked attendance for today.");
      return;
    }

    if (isMockLocation) {
      Alert.alert(
        "Security Alert",
        "Mock GPS provider detected. Please disable location spoofing tools in Android Developer Options."
      );
      return;
    }

    if (!isWithinGeofence) {
      Alert.alert(
        "Geofence Violation",
        `You are ${distance}m from ${targetName}. Authorized allowable radius is ${targetRadius}m.`
      );
      return;
    }

    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      const now = new Date();
      const inTime = formatTime12HourIST(now);
      const punctuality = evaluatePunctuality(now, "09:30", 15);

      setIsCheckedIn(true);
      setIsCheckedOut(false);
      setCheckInTimeStr(inTime);
      setCheckInDateObj(now);
      setCheckOutTimeStr(null);
      setWorkingDurationStr("In Progress");

      const finalStatus = attendanceMode === "FIELD_DUTY" ? "FIELD_DUTY" : punctuality.status;
      setAttendanceStatus(finalStatus as any);
      setStatusMessage(
        attendanceMode === "FIELD_DUTY"
          ? `Punch In verified at ${activeClientSite.clientName} site (${distance}m from center).`
          : `${punctuality.message} Inside ${targetRadius}m HQ geofence.`
      );
    }, 700);
  };

  // Punch Out Action
  const handlePunchOut = () => {
    if (!isCheckedIn) {
      Alert.alert("Punch Out Error", "No active check-in record found for today.");
      return;
    }
    if (isCheckedOut) {
      Alert.alert("Already Checked Out", `You have already clocked out at ${checkOutTimeStr}.`);
      return;
    }

    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      const now = new Date();
      const outTime = formatTime12HourIST(now);

      const hoursCalc = calculateWorkingHours(checkInDateObj, now, 8.0, 4.5);

      setIsCheckedOut(true);
      setCheckOutTimeStr(outTime);
      setWorkingDurationStr(hoursCalc.displayHours);
      setStatusMessage(
        `Punch Out recorded at ${outTime}. Total working duration: ${hoursCalc.displayHours}.`
      );
    }, 700);
  };

  // Record Field Visit
  const handleConfirmFieldVisit = () => {
    if (!fieldVisitNotes.trim()) {
      Alert.alert("Notes Required", "Please describe tasks performed at client site.");
      return;
    }

    setCompletedVisits([
      ...completedVisits,
      {
        clientName: activeClientSite.clientName,
        time: formatTime12HourIST(new Date()),
        notes: fieldVisitNotes,
      },
    ]);
    setFieldVisitNotes("");
    setIsFieldVisitModalOpen(false);
    Alert.alert(
      "Field Visit Recorded",
      `Visit at ${activeClientSite.clientName} successfully attached to daily attendance.`
    );
  };

  // Submit Correction Request
  const handleSubmitCorrection = () => {
    if (!correctionReason.trim()) {
      Alert.alert("Reason Required", "Please provide detailed justification for attendance correction.");
      return;
    }

    setIsCorrectionOpen(false);
    setCorrectionReason("");
    Alert.alert(
      "Request Submitted",
      "Attendance correction request submitted to Administrator Vishnu and HR Admin Priya for review."
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Bar with Regional IST Badge */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.activePill}>
            <View style={styles.greenDot} />
            <Text style={styles.activePillText}>
              {attendanceMode === "OFFICE" ? "HQ Geofence Active (100m)" : "Client Site Geofence"}
            </Text>
          </View>
          <Text style={styles.timezoneText}>{VSECURE_CONFIG.timezone}</Text>
        </View>

        <Text style={styles.companyName}>{VSECURE_CONFIG.companyName}</Text>

        {/* Live IST Clock */}
        <View style={styles.clockBox}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.dateText}>{currentDate} • IST (12-Hour Asia/Kolkata)</Text>
        </View>
      </View>

      {/* 2. Employee Profile & Persona Switcher */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentEmployee.initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{currentEmployee.name}</Text>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{currentEmployee.code}</Text>
              </View>
            </View>
            <Text style={styles.profileRole}>{currentEmployee.role}</Text>
            <Text style={styles.profileDept}>{currentEmployee.department}</Text>
          </View>

          <TouchableOpacity style={styles.switchButton} onPress={handleTogglePersona}>
            <Text style={styles.switchButtonText}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Navigation to Leave Management (Phase 4) */}
      <TouchableOpacity
        style={styles.leaveNavBanner}
        onPress={() => router.push("/leave")}
      >
        <View style={styles.leaveNavLeft}>
          <View style={styles.leaveNavIcon}>
            <Text style={styles.leaveNavIconText}>📅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.leaveNavTitle}>Leave Management</Text>
              <View style={styles.phase4Pill}>
                <Text style={styles.phase4PillText}>Phase 4</Text>
              </View>
            </View>
            <Text style={styles.leaveNavSub}>Apply for leave, check balances & approval status</Text>
          </View>
        </View>
        <Text style={styles.leaveNavArrow}>➔</Text>
      </TouchableOpacity>

      {/* Quick Navigation to Payroll & Salary Management (Phase 5) */}
      <TouchableOpacity
        style={[styles.leaveNavBanner, { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF", marginTop: -6 }]}
        onPress={() => router.push("/payroll")}
      >
        <View style={styles.leaveNavLeft}>
          <View style={[styles.leaveNavIcon, { backgroundColor: "#DBEAFE" }]}>
            <Text style={styles.leaveNavIconText}>💰</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.leaveNavTitle}>Payroll & Payslips</Text>
              <View style={[styles.phase4Pill, { backgroundColor: "#2563EB" }]}>
                <Text style={[styles.phase4PillText, { color: "#FFFFFF" }]}>Phase 5</Text>
              </View>
            </View>
            <Text style={styles.leaveNavSub}>Monthly salary summary, deductions & digital payslips</Text>
          </View>
        </View>
        <Text style={[styles.leaveNavArrow, { color: "#2563EB" }]}>➔</Text>
      </TouchableOpacity>

      {/* 3. Office vs Field Engineer Mode Tabs */}
      <View style={styles.modeTabBar}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            attendanceMode === "OFFICE" ? styles.modeTabActive : styles.modeTabInactive,
          ]}
          onPress={() => handleToggleMode("OFFICE")}
        >
          <Text
            style={[
              styles.modeTabText,
              attendanceMode === "OFFICE" ? styles.modeTabTextActive : styles.modeTabTextInactive,
            ]}
          >
            🏢 Office Geofence (100m)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            attendanceMode === "FIELD_DUTY" ? styles.modeTabActive : styles.modeTabInactive,
          ]}
          onPress={() => handleToggleMode("FIELD_DUTY")}
        >
          <Text
            style={[
              styles.modeTabText,
              attendanceMode === "FIELD_DUTY" ? styles.modeTabTextActive : styles.modeTabTextInactive,
            ]}
          >
            🛠️ Field Duty ({clientSites.length} Sites)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Client Site Selector (Visible in Field Duty Mode) */}
      {attendanceMode === "FIELD_DUTY" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Client Location</Text>
          <View style={styles.clientSiteList}>
            {clientSites.map((site, idx) => (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.clientSiteItem,
                  selectedClientSiteIndex === idx && styles.clientSiteItemActive,
                ]}
                onPress={() => setSelectedClientSiteIndex(idx)}
              >
                <View style={styles.clientSiteHeader}>
                  <Text style={styles.clientSiteName}>{site.name}</Text>
                  <Text style={styles.clientSiteBadge}>{site.radiusMeters}m Geofence</Text>
                </View>
                <Text style={styles.clientSiteSub}>{site.clientName} • {site.address}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.fieldVisitButton}
            onPress={() => setIsFieldVisitModalOpen(true)}
          >
            <Text style={styles.fieldVisitButtonText}>+ Record Client Visit / Tasks</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. GPS Geofence & Punch Verification Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Satellite GPS Attendance</Text>
          <TouchableOpacity onPress={handleRefreshLocation} disabled={isLocating}>
            <Text style={styles.refreshLink}>
              {isLocating ? "Acquiring..." : "↻ Refresh GPS"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDesc}>
          Verified against {targetName} ({targetRadius}m allowable radius).
        </Text>

        {/* GPS Metrics Grid */}
        <View style={styles.gpsMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>{distance} meters</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>GPS Accuracy</Text>
            <Text style={styles.metricValue}>&plusmn;{Math.round(gpsAccuracy)}m</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Geofence</Text>
            <Text
              style={[
                styles.metricStatus,
                isWithinGeofence ? styles.statusPresent : styles.statusAbsent,
              ]}
            >
              {isWithinGeofence ? "Inside Ring" : "Outside"}
            </Text>
          </View>
        </View>

        {/* Punch State Details */}
        <View style={styles.punchDetailsBox}>
          <View style={styles.punchDetailRow}>
            <Text style={styles.punchDetailLabel}>Today Status:</Text>
            <View
              style={[
                styles.statusBadge,
                attendanceStatus === "PRESENT"
                  ? styles.badgePresent
                  : attendanceStatus === "LATE"
                  ? styles.badgeLate
                  : styles.badgeField,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  attendanceStatus === "PRESENT"
                    ? styles.textPresent
                    : attendanceStatus === "LATE"
                    ? styles.textLate
                    : styles.textField,
                ]}
              >
                {attendanceStatus}
              </Text>
            </View>
          </View>

          <View style={styles.punchDetailRow}>
            <Text style={styles.punchDetailLabel}>Check-In Time:</Text>
            <Text style={styles.punchDetailVal}>
              {isCheckedIn ? checkInTimeStr : "Not Punched"}
            </Text>
          </View>

          <View style={styles.punchDetailRow}>
            <Text style={styles.punchDetailLabel}>Check-Out Time:</Text>
            <Text style={styles.punchDetailVal}>
              {isCheckedOut ? checkOutTimeStr : "Pending Punch-Out"}
            </Text>
          </View>

          <View style={styles.punchDetailRow}>
            <Text style={styles.punchDetailLabel}>Working Duration:</Text>
            <Text style={styles.punchDetailVal}>{workingDurationStr}</Text>
          </View>
        </View>

        {/* Status Message */}
        <Text style={styles.statusFeedback}>{statusMessage}</Text>

        {/* Primary Punch Action Buttons */}
        <View style={styles.punchButtonsRow}>
          <TouchableOpacity
            style={[
              styles.punchButton,
              isCheckedIn && !isCheckedOut ? styles.punchButtonDisabled : styles.punchInButton,
            ]}
            onPress={handlePunchIn}
            disabled={isActionLoading || (isCheckedIn && !isCheckedOut)}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.punchButtonText}>
                {isCheckedIn && !isCheckedOut ? "✓ Clocked In" : "Punch In (Check-In)"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.punchButton,
              !isCheckedIn || isCheckedOut ? styles.punchButtonDisabled : styles.punchOutButton,
            ]}
            onPress={handlePunchOut}
            disabled={isActionLoading || !isCheckedIn || isCheckedOut}
          >
            <Text style={styles.punchButtonText}>
              {isCheckedOut ? "✓ Clocked Out" : "Punch Out (Check-Out)"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Completed Client Visits in this Shift */}
      {completedVisits.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Completed Field Visits Today</Text>
          {completedVisits.map((v, i) => (
            <View key={i} style={styles.visitSummaryCard}>
              <View style={styles.visitSummaryHead}>
                <Text style={styles.visitSummaryClient}>{v.clientName}</Text>
                <Text style={styles.visitSummaryTime}>{v.time}</Text>
              </View>
              <Text style={styles.visitSummaryNotes}>&ldquo;{v.notes}&rdquo;</Text>
            </View>
          ))}
        </View>
      )}

      {/* 6. Quick Action Navigation Cards */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navCardButton}
          onPress={() => setIsHistoryOpen(true)}
        >
          <Text style={styles.navCardIcon}>📋</Text>
          <Text style={styles.navCardTitle}>Attendance History</Text>
          <Text style={styles.navCardSub}>Monthly logs & DD-MM-YYYY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCardButton}
          onPress={() => setIsCorrectionOpen(true)}
        >
          <Text style={styles.navCardIcon}>📝</Text>
          <Text style={styles.navCardTitle}>Request Correction</Text>
          <Text style={styles.navCardSub}>Missed punch / GPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navCardButton}
          onPress={() => router.push("/id-card" as any)}
        >
          <Text style={styles.navCardIcon}>🪪</Text>
          <Text style={styles.navCardTitle}>Digital ID Badge</Text>
          <Text style={styles.navCardSub}>Photo & Emergency Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCardButton}
          onPress={() => router.push("/login" as any)}
        >
          <Text style={styles.navCardIcon}>🔐</Text>
          <Text style={styles.navCardTitle}>Device Binding</Text>
          <Text style={styles.navCardSub}>Hardware Keystore Lock</Text>
        </TouchableOpacity>
      </View>

      {/* Modal 1: Attendance History */}
      <Modal visible={isHistoryOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Employee Attendance History</Text>
              <TouchableOpacity onPress={() => setIsHistoryOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {[
                {
                  date: "18-10-2026",
                  in: "09:24 AM",
                  out: "In Progress",
                  status: "PRESENT",
                  distance: "8m",
                },
                {
                  date: "17-10-2026",
                  in: "09:18 AM",
                  out: "06:34 PM",
                  status: "PRESENT",
                  distance: "14m",
                },
                {
                  date: "16-10-2026",
                  in: "09:51 AM",
                  out: "06:45 PM",
                  status: "LATE",
                  distance: "22m",
                },
                {
                  date: "15-10-2026",
                  in: "09:30 AM",
                  out: "06:30 PM",
                  status: "FIELD_DUTY",
                  distance: "Infosys Campus",
                },
              ].map((h, i) => (
                <View key={i} style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyDate}>{h.date}</Text>
                    <Text style={styles.historyTime}>
                      {h.in} &rarr; {h.out}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text
                      style={[
                        styles.historyBadge,
                        h.status === "PRESENT"
                          ? styles.statusPresent
                          : h.status === "LATE"
                          ? styles.statusLate
                          : styles.statusField,
                      ]}
                    >
                      {h.status}
                    </Text>
                    <Text style={styles.historyDist}>{h.distance}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => setIsHistoryOpen(false)}
            >
              <Text style={styles.modalActionButtonText}>Close History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Correction Request Form */}
      <Modal visible={isCorrectionOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Attendance Correction</Text>
              <TouchableOpacity onPress={() => setIsCorrectionOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Submit missed check-in or GPS failure for Administrator review
            </Text>

            <Text style={styles.inputLabel}>Requested Punch-In Time</Text>
            <TextInput
              style={styles.textInput}
              value={correctionReqTime}
              onChangeText={setCorrectionReqTime}
              placeholder="e.g. 09:30 AM"
            />

            <Text style={styles.inputLabel}>Reason / Justification</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={correctionReason}
              onChangeText={setCorrectionReason}
              placeholder="Explain why punch was missed (e.g. Datacenter basement GPS failure, client meeting outside perimeter)..."
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={handleSubmitCorrection}
            >
              <Text style={styles.modalActionButtonText}>Submit to HR Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Field Visit Task Form */}
      <Modal visible={isFieldVisitModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Client Site Visit</Text>
              <TouchableOpacity onPress={() => setIsFieldVisitModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Client: {activeClientSite.name} ({activeClientSite.clientName})
            </Text>

            <Text style={styles.inputLabel}>Work Order / Ticket #</Text>
            <TextInput
              style={styles.textInput}
              value={fieldWorkOrder}
              onChangeText={setFieldWorkOrder}
              placeholder="e.g. WO-INF-2026-09"
            />

            <Text style={styles.inputLabel}>Visit Summary / Tasks Performed</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={fieldVisitNotes}
              onChangeText={setFieldVisitNotes}
              placeholder="Describe tasks completed at client site..."
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.modalActionButton, { backgroundColor: "#4F46E5" }]}
              onPress={handleConfirmFieldVisit}
            >
              <Text style={styles.modalActionButtonText}>Save Client Visit</Text>
            </TouchableOpacity>
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
    gap: 14,
    paddingBottom: 40,
  },
  leaveNavBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leaveNavLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  leaveNavIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  leaveNavIconText: {
    fontSize: 16,
  },
  leaveNavTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  phase4Pill: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  phase4PillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2563EB",
  },
  leaveNavSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  leaveNavArrow: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "700",
    marginLeft: 8,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  timezoneText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  clockBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  timeText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2563EB",
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  codeBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },
  profileRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 2,
  },
  profileDept: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  switchButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  switchButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  modeTabBar: {
    flexDirection: "row",
    gap: 8,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modeTabActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  modeTabInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  modeTabTextInactive: {
    color: "#64748B",
  },
  clientSiteList: {
    gap: 8,
    marginTop: 8,
  },
  clientSiteItem: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  clientSiteItemActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  clientSiteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientSiteName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  clientSiteBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clientSiteSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  fieldVisitButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  fieldVisitButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
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
    marginBottom: 10,
  },
  gpsMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  metricStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  statusPresent: {
    color: "#16A34A",
  },
  statusAbsent: {
    color: "#DC2626",
  },
  statusLate: {
    color: "#D97706",
  },
  statusField: {
    color: "#4F46E5",
  },
  punchDetailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    gap: 6,
    marginBottom: 10,
  },
  punchDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  punchDetailLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  punchDetailVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePresent: {
    backgroundColor: "#DCFCE7",
  },
  badgeLate: {
    backgroundColor: "#FEF3C7",
  },
  badgeField: {
    backgroundColor: "#E0E7FF",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  textPresent: {
    color: "#16A34A",
  },
  textLate: {
    color: "#D97706",
  },
  textField: {
    color: "#4F46E5",
  },
  statusFeedback: {
    fontSize: 11,
    color: "#475569",
    fontStyle: "italic",
    marginBottom: 12,
  },
  punchButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  punchButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  punchInButton: {
    backgroundColor: "#2563EB",
  },
  punchOutButton: {
    backgroundColor: "#16A34A",
  },
  punchButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.6,
  },
  punchButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  visitSummaryCard: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  visitSummaryHead: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  visitSummaryClient: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  visitSummaryTime: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  visitSummaryNotes: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    fontStyle: "italic",
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navCardButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  navCardIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  navCardSub: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "700",
    padding: 4,
  },
  modalSub: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 260,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  historyDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  historyTime: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyBadge: {
    fontSize: 10,
    fontWeight: "800",
  },
  historyDist: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  modalActionButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  modalActionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
