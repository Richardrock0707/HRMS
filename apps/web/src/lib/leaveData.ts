/**
 * VSecure Technologies HRMS - Phase 4 Leave Management In-Memory Fallback State
 * Asia/Kolkata (IST), DD-MM-YYYY Date Formats, Role Scoped Data Sets
 */

import {
  LeaveBalanceItem,
  LeaveRecordItem,
  LeaveTransactionItem,
  LeaveTypeConfigInput,
  LeavePolicyConfigInput,
  PublicHolidayInput,
  DEFAULT_LEAVE_TYPES,
  DEFAULT_LEAVE_POLICY,
  DEFAULT_2026_HOLIDAYS,
  LeaveType,
  ApprovalStatus,
  formatDateDDMMYYYY,
} from "@vsecure/shared";

/**
 * In-memory fallback leave policy configuration
 */
export let LIVE_LEAVE_POLICY: LeavePolicyConfigInput = {
  ...DEFAULT_LEAVE_POLICY,
};

export function updateLiveLeavePolicy(policy: Partial<LeavePolicyConfigInput>) {
  LIVE_LEAVE_POLICY = {
    ...LIVE_LEAVE_POLICY,
    ...policy,
  };
  return LIVE_LEAVE_POLICY;
}

/**
 * In-memory fallback leave type configurations
 */
export let LIVE_LEAVE_TYPES: LeaveTypeConfigInput[] = [
  ...DEFAULT_LEAVE_TYPES.map((t) => ({ ...t })),
];

/**
 * In-memory fallback public holidays (2026)
 */
export let LIVE_PUBLIC_HOLIDAYS: PublicHolidayInput[] = [
  ...DEFAULT_2026_HOLIDAYS.map((h, idx) => ({ id: `hol_${idx + 1}`, ...h })),
];

/**
 * Initial Simulated Employee Leave Balances for 2026
 */
export const INITIAL_LEAVE_BALANCES: LeaveBalanceItem[] = [
  // VS-001: Vishnu (Super Admin)
  {
    employeeId: "emp_vsecure_001",
    year: 2026,
    leaveType: "CASUAL",
    code: "CL",
    name: "Casual Leave",
    isPaid: true,
    allocated: 12,
    accrued: 10,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 12,
  },
  {
    employeeId: "emp_vsecure_001",
    year: 2026,
    leaveType: "SICK",
    code: "SL",
    name: "Sick Leave",
    isPaid: true,
    allocated: 10,
    accrued: 8.3,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 10,
  },
  {
    employeeId: "emp_vsecure_001",
    year: 2026,
    leaveType: "EARNED",
    code: "EL",
    name: "Earned Leave",
    isPaid: true,
    allocated: 15,
    accrued: 12.5,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 15,
  },
  {
    employeeId: "emp_vsecure_001",
    year: 2026,
    leaveType: "UNPAID_LOP",
    code: "LOP",
    name: "Loss of Pay",
    isPaid: false,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },
  {
    employeeId: "emp_vsecure_001",
    year: 2026,
    leaveType: "COMP_OFF",
    code: "COMP",
    name: "Compensatory Off",
    isPaid: true,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },

  // VS-002: Priya Sharma (HR Admin)
  {
    employeeId: "emp_vsecure_002",
    year: 2026,
    leaveType: "CASUAL",
    code: "CL",
    name: "Casual Leave",
    isPaid: true,
    allocated: 12,
    accrued: 10,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 12,
  },
  {
    employeeId: "emp_vsecure_002",
    year: 2026,
    leaveType: "SICK",
    code: "SL",
    name: "Sick Leave",
    isPaid: true,
    allocated: 10,
    accrued: 8.3,
    carriedForward: 0,
    used: 0,
    pending: 0.5,
    remaining: 9.5,
  },
  {
    employeeId: "emp_vsecure_002",
    year: 2026,
    leaveType: "EARNED",
    code: "EL",
    name: "Earned Leave",
    isPaid: true,
    allocated: 15,
    accrued: 12.5,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 15,
  },
  {
    employeeId: "emp_vsecure_002",
    year: 2026,
    leaveType: "UNPAID_LOP",
    code: "LOP",
    name: "Loss of Pay",
    isPaid: false,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },
  {
    employeeId: "emp_vsecure_002",
    year: 2026,
    leaveType: "COMP_OFF",
    code: "COMP",
    name: "Compensatory Off",
    isPaid: true,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },

  // VS-003: Arjun Mehta (Dept Manager)
  {
    employeeId: "emp_vsecure_003",
    year: 2026,
    leaveType: "CASUAL",
    code: "CL",
    name: "Casual Leave",
    isPaid: true,
    allocated: 12,
    accrued: 10,
    carriedForward: 0,
    used: 1,
    pending: 0,
    remaining: 11,
  },
  {
    employeeId: "emp_vsecure_003",
    year: 2026,
    leaveType: "SICK",
    code: "SL",
    name: "Sick Leave",
    isPaid: true,
    allocated: 10,
    accrued: 8.3,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 10,
  },
  {
    employeeId: "emp_vsecure_003",
    year: 2026,
    leaveType: "EARNED",
    code: "EL",
    name: "Earned Leave",
    isPaid: true,
    allocated: 15,
    accrued: 12.5,
    carriedForward: 0,
    used: 0,
    pending: 3,
    remaining: 12,
  },
  {
    employeeId: "emp_vsecure_003",
    year: 2026,
    leaveType: "UNPAID_LOP",
    code: "LOP",
    name: "Loss of Pay",
    isPaid: false,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },
  {
    employeeId: "emp_vsecure_003",
    year: 2026,
    leaveType: "COMP_OFF",
    code: "COMP",
    name: "Compensatory Off",
    isPaid: true,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },

  // VS-004: Kavita Nair (Employee - SRE)
  {
    employeeId: "emp_vsecure_004",
    year: 2026,
    leaveType: "CASUAL",
    code: "CL",
    name: "Casual Leave",
    isPaid: true,
    allocated: 12,
    accrued: 10,
    carriedForward: 0,
    used: 2,
    pending: 0,
    remaining: 10,
  },
  {
    employeeId: "emp_vsecure_004",
    year: 2026,
    leaveType: "SICK",
    code: "SL",
    name: "Sick Leave",
    isPaid: true,
    allocated: 10,
    accrued: 8.3,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 10,
  },
  {
    employeeId: "emp_vsecure_004",
    year: 2026,
    leaveType: "EARNED",
    code: "EL",
    name: "Earned Leave",
    isPaid: true,
    allocated: 15,
    accrued: 12.5,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 15,
  },
  {
    employeeId: "emp_vsecure_004",
    year: 2026,
    leaveType: "UNPAID_LOP",
    code: "LOP",
    name: "Loss of Pay",
    isPaid: false,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },
  {
    employeeId: "emp_vsecure_004",
    year: 2026,
    leaveType: "COMP_OFF",
    code: "COMP",
    name: "Compensatory Off",
    isPaid: true,
    allocated: 0,
    accrued: 0,
    carriedForward: 0,
    used: 0,
    pending: 0,
    remaining: 0,
  },
];

export let LIVE_LEAVE_BALANCES: LeaveBalanceItem[] = [...INITIAL_LEAVE_BALANCES];

/**
 * Initial Simulated Leave Requests
 */
export const INITIAL_LEAVE_REQUESTS: LeaveRecordItem[] = [
  // LV-2026-001: Approved Casual Leave for Kavita Nair
  {
    id: "leave_req_001",
    referenceId: "LV-2026-001",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    departmentId: "dept_ops",
    departmentName: "Cloud & Operations",
    designation: "Site Reliability Engineer",
    reportingManagerName: "Arjun Mehta",
    leaveType: "CASUAL",
    leaveTypeName: "Casual Leave",
    isPaid: true,
    startDate: "12-10-2026",
    endDate: "13-10-2026",
    isHalfDay: false,
    halfDaySession: null,
    totalDays: 2.0,
    reason: "Family wedding in hometown (Thrissur, Kerala)",
    supportingDocumentUrl: null,
    status: "APPROVED",
    approvedBy: "Arjun Mehta (Engineering Manager)",
    actionedAt: "08-10-2026, 11:30 AM IST",
    rejectionReason: null,
    cancellationReason: null,
    isCancelled: false,
    createdAt: "07-10-2026, 04:15 PM IST",
  },
  // LV-2026-002: Pending Earned Leave for Arjun Mehta (Needs Vishnu's Approval)
  {
    id: "leave_req_002",
    referenceId: "LV-2026-002",
    employeeId: "emp_vsecure_003",
    employeeCode: "VS-003",
    employeeName: "Arjun Mehta",
    departmentId: "dept_eng",
    departmentName: "Engineering & Architecture",
    designation: "Senior Cloud Architect",
    reportingManagerName: "Vishnu",
    leaveType: "EARNED",
    leaveTypeName: "Earned Leave",
    isPaid: true,
    startDate: "28-10-2026",
    endDate: "30-10-2026",
    isHalfDay: false,
    halfDaySession: null,
    totalDays: 3.0,
    reason: "Attending Cloud Architecture Summit in Hyderabad",
    supportingDocumentUrl: null,
    status: "PENDING",
    approvedBy: null,
    actionedAt: null,
    rejectionReason: null,
    cancellationReason: null,
    isCancelled: false,
    createdAt: "16-10-2026, 10:20 AM IST",
  },
  // LV-2026-003: Pending Half-Day Sick Leave for Priya Sharma
  {
    id: "leave_req_003",
    referenceId: "LV-2026-003",
    employeeId: "emp_vsecure_002",
    employeeCode: "VS-002",
    employeeName: "Priya Sharma",
    departmentId: "dept_hr",
    departmentName: "People & HR",
    designation: "Lead HR Business Partner",
    reportingManagerName: "Vishnu",
    leaveType: "SICK",
    leaveTypeName: "Sick Leave",
    isPaid: true,
    startDate: "22-10-2026",
    endDate: "22-10-2026",
    isHalfDay: true,
    halfDaySession: "FIRST_HALF",
    totalDays: 0.5,
    reason: "Routine dental consultation at dental clinic",
    supportingDocumentUrl: null,
    status: "PENDING",
    approvedBy: null,
    actionedAt: null,
    rejectionReason: null,
    cancellationReason: null,
    isCancelled: false,
    createdAt: "17-10-2026, 02:40 PM IST",
  },
];

export let LIVE_LEAVE_REQUESTS: LeaveRecordItem[] = [...INITIAL_LEAVE_REQUESTS];

/**
 * Initial Simulated Leave Transaction Ledger
 */
export const INITIAL_LEAVE_TRANSACTIONS: LeaveTransactionItem[] = [
  {
    id: "txn_init_001",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    year: 2026,
    leaveType: "CASUAL",
    transactionType: "ALLOCATION",
    days: 12.0,
    balanceAfter: 12.0,
    leaveRequestId: null,
    remarks: "Annual Casual Leave Quota credit for 2026",
    actionedBy: "System Policy Engine",
    createdAt: "01-01-2026, 00:00 AM IST",
  },
  {
    id: "txn_kavita_debit_001",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    year: 2026,
    leaveType: "CASUAL",
    transactionType: "DEBIT",
    days: -2.0,
    balanceAfter: 10.0,
    leaveRequestId: "leave_req_001",
    remarks: "Approved Casual Leave debited (LV-2026-001: 12-10-2026 to 13-10-2026)",
    actionedBy: "Arjun Mehta (VS-003)",
    createdAt: "08-10-2026, 11:30 AM IST",
  },
];

export let LIVE_LEAVE_TRANSACTIONS: LeaveTransactionItem[] = [...INITIAL_LEAVE_TRANSACTIONS];

// State manipulation helpers
export function addLiveLeaveRequest(request: LeaveRecordItem) {
  LIVE_LEAVE_REQUESTS.unshift(request);
  return request;
}

export function updateLiveLeaveRequest(
  id: string,
  updates: Partial<LeaveRecordItem>
): LeaveRecordItem | null {
  const index = LIVE_LEAVE_REQUESTS.findIndex((r) => r.id === id || r.referenceId === id);
  if (index === -1) return null;
  LIVE_LEAVE_REQUESTS[index] = {
    ...LIVE_LEAVE_REQUESTS[index],
    ...updates,
  };
  return LIVE_LEAVE_REQUESTS[index];
}

export function addLiveLeaveTransaction(txn: LeaveTransactionItem) {
  LIVE_LEAVE_TRANSACTIONS.unshift(txn);
  return txn;
}
