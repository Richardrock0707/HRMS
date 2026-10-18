import { Role, EmploymentStatus } from "./types";

export type Permission =
  | "SETTINGS:MANAGE"
  | "GEOFENCE:MANAGE"
  | "GEOFENCE:VIEW"
  | "ROLE:ASSIGN"
  | "ADMIN:CREATE"
  | "EMPLOYEE:CREATE"
  | "EMPLOYEE:VIEW_ALL"
  | "EMPLOYEE:VIEW_DEPT"
  | "EMPLOYEE:VIEW_SELF"
  | "EMPLOYEE:EDIT_ALL"
  | "EMPLOYEE:EDIT_DEPT"
  | "SALARY:VIEW_ALL"
  | "SALARY:EDIT_ALL"
  | "SALARY:VIEW_SELF"
  | "DEVICE:RESET"
  | "DEVICE:VIEW_ALL"
  | "DEVICE:REQUEST_CHANGE"
  | "DOCUMENTS:VERIFY"
  | "DOCUMENTS:DELETE"
  | "DOCUMENTS:VIEW_ALL"
  | "DOCUMENTS:VIEW_SELF"
  | "DOCUMENTS:UPLOAD_SELF"
  | "STATUS:MANAGE"
  | "ATTENDANCE:VIEW_ALL"
  | "ATTENDANCE:VIEW_DEPT"
  | "ATTENDANCE:VIEW_SELF"
  | "ATTENDANCE:CHECK_IN"
  | "ATTENDANCE:CHECK_OUT"
  | "ATTENDANCE:CORRECTION_REQUEST"
  | "ATTENDANCE:CORRECTION_APPROVE"
  | "ATTENDANCE:POLICY_MANAGE"
  | "FIELD_DUTY:LOG"
  | "FIELD_DUTY:VIEW_ALL"
  | "LEAVE:APPLY"
  | "LEAVE:VIEW_ALL"
  | "LEAVE:VIEW_DEPT"
  | "LEAVE:VIEW_SELF"
  | "LEAVE:APPROVE_DEPT"
  | "LEAVE:APPROVE_HR"
  | "LEAVE:POLICY_MANAGE"
  | "LEAVE:BALANCE_ADJUST"
  | "PAYROLL:VIEW_ALL"
  | "PAYROLL:VIEW_SELF"
  | "PAYROLL:CALCULATE"
  | "PAYROLL:SUBMIT_APPROVAL"
  | "PAYROLL:APPROVE"
  | "PAYROLL:FINALIZE"
  | "PAYROLL:REOPEN"
  | "PAYROLL:PAYMENT_RECORD"
  | "PAYROLL:BANK_EXPORT"
  | "PAYROLL:REPORTS"
  | "PAYSLIP:VIEW_SELF"
  | "PAYSLIP:VIEW_ALL";

/**
 * 4-Tier RBAC Permission Matrix for VSecure HRMS
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: [
    "SETTINGS:MANAGE",
    "GEOFENCE:MANAGE",
    "GEOFENCE:VIEW",
    "ROLE:ASSIGN",
    "ADMIN:CREATE",
    "EMPLOYEE:CREATE",
    "EMPLOYEE:VIEW_ALL",
    "EMPLOYEE:VIEW_DEPT",
    "EMPLOYEE:VIEW_SELF",
    "EMPLOYEE:EDIT_ALL",
    "EMPLOYEE:EDIT_DEPT",
    "SALARY:VIEW_ALL",
    "SALARY:EDIT_ALL",
    "SALARY:VIEW_SELF",
    "DEVICE:RESET",
    "DEVICE:VIEW_ALL",
    "DEVICE:REQUEST_CHANGE",
    "DOCUMENTS:VERIFY",
    "DOCUMENTS:DELETE",
    "DOCUMENTS:VIEW_ALL",
    "DOCUMENTS:VIEW_SELF",
    "DOCUMENTS:UPLOAD_SELF",
    "STATUS:MANAGE",
    "ATTENDANCE:VIEW_ALL",
    "ATTENDANCE:VIEW_DEPT",
    "ATTENDANCE:VIEW_SELF",
    "ATTENDANCE:CHECK_IN",
    "ATTENDANCE:CHECK_OUT",
    "ATTENDANCE:CORRECTION_REQUEST",
    "ATTENDANCE:CORRECTION_APPROVE",
    "ATTENDANCE:POLICY_MANAGE",
    "FIELD_DUTY:LOG",
    "FIELD_DUTY:VIEW_ALL",
    "LEAVE:APPLY",
    "LEAVE:VIEW_ALL",
    "LEAVE:VIEW_DEPT",
    "LEAVE:VIEW_SELF",
    "LEAVE:APPROVE_DEPT",
    "LEAVE:APPROVE_HR",
    "LEAVE:POLICY_MANAGE",
    "LEAVE:BALANCE_ADJUST",
    "PAYROLL:VIEW_ALL",
    "PAYROLL:VIEW_SELF",
    "PAYROLL:CALCULATE",
    "PAYROLL:SUBMIT_APPROVAL",
    "PAYROLL:APPROVE",
    "PAYROLL:FINALIZE",
    "PAYROLL:REOPEN",
    "PAYROLL:PAYMENT_RECORD",
    "PAYROLL:BANK_EXPORT",
    "PAYROLL:REPORTS",
    "PAYSLIP:VIEW_SELF",
    "PAYSLIP:VIEW_ALL",
  ],
  HR_ADMIN: [
    "GEOFENCE:VIEW",
    "ROLE:ASSIGN", // Can assign Manager & Employee
    "EMPLOYEE:CREATE",
    "EMPLOYEE:VIEW_ALL",
    "EMPLOYEE:VIEW_DEPT",
    "EMPLOYEE:VIEW_SELF",
    "EMPLOYEE:EDIT_ALL",
    "EMPLOYEE:EDIT_DEPT",
    "SALARY:VIEW_ALL",
    "SALARY:EDIT_ALL",
    "SALARY:VIEW_SELF",
    "DEVICE:RESET",
    "DEVICE:VIEW_ALL",
    "DEVICE:REQUEST_CHANGE",
    "DOCUMENTS:VERIFY",
    "DOCUMENTS:VIEW_ALL",
    "DOCUMENTS:VIEW_SELF",
    "DOCUMENTS:UPLOAD_SELF",
    "STATUS:MANAGE",
    "ATTENDANCE:VIEW_ALL",
    "ATTENDANCE:VIEW_DEPT",
    "ATTENDANCE:VIEW_SELF",
    "ATTENDANCE:CHECK_IN",
    "ATTENDANCE:CHECK_OUT",
    "ATTENDANCE:CORRECTION_REQUEST",
    "ATTENDANCE:CORRECTION_APPROVE",
    "ATTENDANCE:POLICY_MANAGE",
    "FIELD_DUTY:LOG",
    "FIELD_DUTY:VIEW_ALL",
    "LEAVE:APPLY",
    "LEAVE:VIEW_ALL",
    "LEAVE:VIEW_DEPT",
    "LEAVE:VIEW_SELF",
    "LEAVE:APPROVE_DEPT",
    "LEAVE:APPROVE_HR",
    "LEAVE:POLICY_MANAGE",
    "LEAVE:BALANCE_ADJUST",
    "PAYROLL:VIEW_ALL",
    "PAYROLL:VIEW_SELF",
    "PAYROLL:CALCULATE",
    "PAYROLL:SUBMIT_APPROVAL",
    "PAYROLL:PAYMENT_RECORD",
    "PAYROLL:BANK_EXPORT",
    "PAYROLL:REPORTS",
    "PAYSLIP:VIEW_SELF",
    "PAYSLIP:VIEW_ALL",
  ],
  MANAGER: [
    "GEOFENCE:VIEW",
    "EMPLOYEE:VIEW_DEPT",
    "EMPLOYEE:VIEW_SELF",
    "SALARY:VIEW_SELF",
    "DEVICE:REQUEST_CHANGE",
    "DOCUMENTS:VIEW_SELF",
    "DOCUMENTS:UPLOAD_SELF",
    "ATTENDANCE:VIEW_DEPT",
    "ATTENDANCE:VIEW_SELF",
    "ATTENDANCE:CHECK_IN",
    "ATTENDANCE:CHECK_OUT",
    "ATTENDANCE:CORRECTION_REQUEST",
    "FIELD_DUTY:LOG",
    "LEAVE:APPLY",
    "LEAVE:VIEW_DEPT",
    "LEAVE:VIEW_SELF",
    "LEAVE:APPROVE_DEPT",
    "PAYROLL:VIEW_SELF",
    "PAYSLIP:VIEW_SELF",
  ],
  EMPLOYEE: [
    "GEOFENCE:VIEW",
    "EMPLOYEE:VIEW_SELF",
    "SALARY:VIEW_SELF",
    "DEVICE:REQUEST_CHANGE",
    "DOCUMENTS:VIEW_SELF",
    "DOCUMENTS:UPLOAD_SELF",
    "ATTENDANCE:VIEW_SELF",
    "ATTENDANCE:CHECK_IN",
    "ATTENDANCE:CHECK_OUT",
    "ATTENDANCE:CORRECTION_REQUEST",
    "FIELD_DUTY:LOG",
    "LEAVE:APPLY",
    "LEAVE:VIEW_SELF",
    "PAYROLL:VIEW_SELF",
    "PAYSLIP:VIEW_SELF",
  ],
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
}

export interface UserContext {
  id: string;
  role: Role;
  departmentId?: string;
  employeeCode?: string;
  email?: string;
  status?: string;
}

/**
 * Data access level check for employee records
 */
export function canAccessEmployee(
  currentUser: UserContext,
  targetEmployee: { id: string; departmentId?: string }
): boolean {
  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }
  if (currentUser.role === "MANAGER") {
    return (
      currentUser.id === targetEmployee.id ||
      (!!currentUser.departmentId && currentUser.departmentId === targetEmployee.departmentId)
    );
  }
  return currentUser.id === targetEmployee.id;
}

/**
 * Check if the user is authorized to view confidential INR salary figures
 */
export function canViewSalary(currentUser: UserContext, targetEmployeeId: string): boolean {
  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }
  return currentUser.id === targetEmployeeId;
}

/**
 * Check if the user can approve device binding resets
 */
export function canResetDevice(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Visual badge metadata for RBAC roles
 */
export function getRoleBadge(role: Role): { label: string; badgeClass: string; desc: string } {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        label: "Super Admin",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200",
        desc: "Full Root Authority",
      };
    case "HR_ADMIN":
      return {
        label: "HR Admin",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        desc: "Workforce & Salary Management",
      };
    case "MANAGER":
      return {
        label: "Dept Manager",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Department Scope",
      };
    case "EMPLOYEE":
      return {
        label: "Employee",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        desc: "Self-Service Only",
      };
  }
}

/**
 * Visual badge metadata for employment status
 */
export function getEmploymentStatusBadge(status: EmploymentStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "ON_NOTICE":
      return {
        label: "On Notice",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "INACTIVE":
      return {
        label: "Inactive",
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      };
    case "TERMINATED":
      return {
        label: "Terminated",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
  }
}

/**
 * Check if the user is authorized to view attendance records
 */
export function canViewAttendance(
  currentUser: UserContext,
  targetEmployee: { id: string; departmentId?: string }
): boolean {
  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }
  if (currentUser.role === "MANAGER") {
    return (
      currentUser.id === targetEmployee.id ||
      (!!currentUser.departmentId && currentUser.departmentId === targetEmployee.departmentId)
    );
  }
  return currentUser.id === targetEmployee.id;
}

/**
 * Check if the user can approve attendance corrections
 */
export function canApproveCorrection(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Check if the user can manage attendance policies or geofence settings
 */
export function canManageAttendancePolicy(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Visual badge metadata for Attendance Status
 */
export function getAttendanceStatusBadge(status: string): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "PRESENT":
      return {
        label: "Present",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "LATE":
      return {
        label: "Late Arrival",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "HALF_DAY":
      return {
        label: "Half Day",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    case "FIELD_DUTY":
      return {
        label: "Field Duty",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "ON_LEAVE":
      return {
        label: "On Leave",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "ABSENT":
    default:
      return {
        label: "Absent",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
  }
}

/**
 * Visual badge metadata for Attendance Verification / Review Status
 */
export function getReviewStatusBadge(status: string): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "AUTO_VERIFIED":
      return {
        label: "Verified Inside Geofence",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "PENDING_REVIEW":
      return {
        label: "Pending Review",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "FLAGGED_SUSPICIOUS":
      return {
        label: "Flagged (Mock GPS)",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "REJECTED":
      return {
        label: "Rejected Outside Perimeter",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

/**
 * Check if the user is authorized to approve a given leave request.
 * Enforces anti-self-approval rule: Employees and Managers cannot approve their own requests!
 */
export function canApproveLeave(
  currentUser: UserContext,
  leaveRequest: { employeeId: string; departmentId?: string; status: string }
): boolean {
  // Anti-self-approval: No one can approve their own leave request
  if (currentUser.id === leaveRequest.employeeId) {
    return false;
  }

  // Cannot action already finalized requests
  if (leaveRequest.status !== "PENDING") {
    return false;
  }

  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }

  if (currentUser.role === "MANAGER") {
    return (
      !!currentUser.departmentId &&
      !!leaveRequest.departmentId &&
      currentUser.departmentId === leaveRequest.departmentId
    );
  }

  return false;
}

/**
 * Check if the user is authorized to view a specific employee's leave records
 */
export function canViewLeave(
  currentUser: UserContext,
  targetEmployee: { id: string; departmentId?: string }
): boolean {
  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }
  if (currentUser.role === "MANAGER") {
    return (
      currentUser.id === targetEmployee.id ||
      (!!currentUser.departmentId && currentUser.departmentId === targetEmployee.departmentId)
    );
  }
  return currentUser.id === targetEmployee.id;
}

/**
 * Check if the user can perform leave balance adjustments or manual credits
 */
export function canAdjustLeaveBalance(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Check if the user can manage company-wide leave policies and quotas
 */
export function canManageLeavePolicy(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Check if the user is authorized to view a specific employee's payslip
 */
export function canViewPayslip(
  currentUser: UserContext,
  targetEmployeeId: string
): boolean {
  if (currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN") {
    return true;
  }
  return currentUser.id === targetEmployeeId;
}

/**
 * Check if the user can approve or reject payroll
 */
export function canApprovePayroll(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN";
}

/**
 * Check if the user can finalize payroll
 */
export function canFinalizePayroll(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN";
}

/**
 * Check if the user can reopen finalized payroll
 */
export function canReopenPayroll(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN";
}

/**
 * Check if user can calculate and review payroll
 */
export function canManagePayroll(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Check if user can export bank transfer file
 */
export function canExportBankTransfer(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

/**
 * Check if user can record salary payment details
 */
export function canRecordSalaryPayment(currentUser: UserContext): boolean {
  return currentUser.role === "SUPER_ADMIN" || currentUser.role === "HR_ADMIN";
}

