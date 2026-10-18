import {
  AttendanceRecordItem,
  AttendanceDashboardStats,
  AttendancePolicyInput,
  ClientSiteInput,
  DEFAULT_ATTENDANCE_POLICY,
  DEFAULT_CLIENT_SITES,
  DEFAULT_OFFICE_COORDINATES,
  formatDateDDMMYYYY,
} from "@vsecure/shared";

/**
 * In-memory fallback attendance policy
 */
export let LIVE_ATTENDANCE_POLICY: AttendancePolicyInput = {
  ...DEFAULT_ATTENDANCE_POLICY,
};

export function updateLiveAttendancePolicy(policy: Partial<AttendancePolicyInput>) {
  LIVE_ATTENDANCE_POLICY = {
    ...LIVE_ATTENDANCE_POLICY,
    ...policy,
  };
  return LIVE_ATTENDANCE_POLICY;
}

/**
 * In-memory fallback client sites for field engineer duty
 */
export let LIVE_CLIENT_SITES: Array<ClientSiteInput & { id: string }> = [
  ...DEFAULT_CLIENT_SITES.map((site) => ({ ...site })),
];

export function addLiveClientSite(site: ClientSiteInput & { id: string }) {
  LIVE_CLIENT_SITES.unshift(site);
  return site;
}

/**
 * Initial Simulated Real-World Attendance Records
 */
const todayFormatted = formatDateDDMMYYYY(new Date());

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecordItem[] = [
  {
    id: "att_log_001",
    employeeId: "emp_vsecure_001",
    employeeCode: "VS-001",
    employeeName: "Vishnu",
    departmentId: "dept_eng",
    departmentName: "Engineering & Architecture",
    designation: "Founder & Chief Architect",
    attendanceDate: todayFormatted,
    checkInTime: "09:24 AM",
    checkOutTime: null,
    totalDuration: "In Progress",
    status: "PRESENT",
    attendanceType: "OFFICE",
    checkInLat: 12.93524,
    checkInLng: 77.69465,
    checkOutLat: null,
    checkOutLng: null,
    gpsAccuracyMeters: 8.5,
    distanceFromOfficeMeters: 8,
    isWithinGeofence: true,
    isMockLocation: false,
    reviewStatus: "AUTO_VERIFIED",
    rejectionReason: null,
    geofenceRadius: 100,
    locationName: "VSecure Technologies HQ",
    selfieUrl: null,
    fieldVisitsCount: 0,
  },
  {
    id: "att_log_002",
    employeeId: "emp_vsecure_002",
    employeeCode: "VS-002",
    employeeName: "Priya Sharma",
    departmentId: "dept_hr",
    departmentName: "People & HR",
    designation: "Lead HR Business Partner",
    attendanceDate: todayFormatted,
    checkInTime: "09:15 AM",
    checkOutTime: null,
    totalDuration: "In Progress",
    status: "PRESENT",
    attendanceType: "OFFICE",
    checkInLat: 12.93530,
    checkInLng: 77.69472,
    checkOutLat: null,
    checkOutLng: null,
    gpsAccuracyMeters: 12.0,
    distanceFromOfficeMeters: 18,
    isWithinGeofence: true,
    isMockLocation: false,
    reviewStatus: "AUTO_VERIFIED",
    rejectionReason: null,
    geofenceRadius: 100,
    locationName: "VSecure Technologies HQ",
    selfieUrl: null,
    fieldVisitsCount: 0,
  },
  {
    id: "att_log_003",
    employeeId: "emp_vsecure_003",
    employeeCode: "VS-003",
    employeeName: "Arjun Mehta",
    departmentId: "dept_eng",
    departmentName: "Engineering & Architecture",
    designation: "Senior Cloud Architect",
    attendanceDate: todayFormatted,
    checkInTime: "09:52 AM",
    checkOutTime: null,
    totalDuration: "In Progress",
    status: "LATE",
    attendanceType: "OFFICE",
    checkInLat: 12.93542,
    checkInLng: 77.69480,
    checkOutLat: null,
    checkOutLng: null,
    gpsAccuracyMeters: 14.2,
    distanceFromOfficeMeters: 32,
    isWithinGeofence: true,
    isMockLocation: false,
    reviewStatus: "AUTO_VERIFIED",
    rejectionReason: "Arrived 22 mins after shift start (09:30 AM + 15m grace).",
    geofenceRadius: 100,
    locationName: "VSecure Technologies HQ",
    selfieUrl: null,
    fieldVisitsCount: 0,
  },
  {
    id: "att_log_004",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    departmentId: "dept_ops",
    departmentName: "Cloud & Operations",
    designation: "Site Reliability Engineer",
    attendanceDate: todayFormatted,
    checkInTime: "09:30 AM",
    checkOutTime: null,
    totalDuration: "In Progress (Field Duty)",
    status: "FIELD_DUTY",
    attendanceType: "FIELD_DUTY",
    checkInLat: 12.84524,
    checkInLng: 77.66025,
    checkOutLat: null,
    checkOutLng: null,
    gpsAccuracyMeters: 11.0,
    distanceFromOfficeMeters: 14200,
    isWithinGeofence: true,
    isMockLocation: false,
    reviewStatus: "AUTO_VERIFIED",
    rejectionReason: null,
    geofenceRadius: 150,
    locationName: "Infosys Electronics City Campus",
    selfieUrl: null,
    fieldVisitsCount: 1,
  },
];

/**
 * Attendance Corrections Dataset
 */
export interface AttendanceCorrectionItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  attendanceDate: string;
  requestType: string;
  originalCheckInTime: string | null;
  originalCheckOutTime: string | null;
  requestedCheckInTime: string;
  requestedCheckOutTime: string | null;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  actionedBy: string | null;
  actionedAt: string | null;
  reviewerNotes: string | null;
  createdAt: string;
}

export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionItem[] = [
  {
    id: "corr_req_001",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    departmentName: "Cloud & Operations",
    attendanceDate: "17-10-2026",
    requestType: "GPS_FAILURE",
    originalCheckInTime: null,
    originalCheckOutTime: null,
    requestedCheckInTime: "09:30 AM",
    requestedCheckOutTime: "06:30 PM",
    reason:
      "Basement parking location GPS satellite lock failed. Switched to client WiFi after entering datacenter.",
    status: "PENDING",
    actionedBy: null,
    actionedAt: null,
    reviewerNotes: null,
    createdAt: "17-10-2026 07:15 PM",
  },
];

/**
 * Field Visits Dataset
 */
export interface FieldVisitItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  clientSiteId: string;
  clientName: string;
  workOrderNumber: string;
  checkInTime: string;
  checkOutTime: string | null;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  visitNotes: string;
  status: string;
}

export const INITIAL_FIELD_VISITS: FieldVisitItem[] = [
  {
    id: "visit_kavita_001",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    clientSiteId: "site_client_001",
    clientName: "Infosys Limited",
    workOrderNumber: "WO-INF-2026-09",
    checkInTime: "09:45 AM",
    checkOutTime: "12:30 PM",
    latitude: 12.84525,
    longitude: 77.66022,
    gpsAccuracyMeters: 9.8,
    visitNotes:
      "Server rack health audit and router firmware upgrade completed at Building 3 Data Room.",
    status: "COMPLETED",
  },
];
