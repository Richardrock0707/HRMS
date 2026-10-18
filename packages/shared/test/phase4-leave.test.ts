import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateLeaveDuration,
  detectLeaveConflicts,
  parseDateDDMMYYYY,
  formatToDDMMYYYY,
  isWeekendDay,
  hasPermission,
  canApproveLeave,
  canViewLeave,
  canAdjustLeaveBalance,
  canManageLeavePolicy,
  getLeaveTypeBadge,
  getLeaveApprovalBadge,
  DEFAULT_2026_HOLIDAYS,
  DEFAULT_LEAVE_TYPES,
  DEFAULT_LEAVE_POLICY,
} from "../src/index.ts";

describe("Phase 4 Centralized Leave Duration & Working Days Engine", () => {
  it("Scenario 1: Calculates exact working days excluding weekend (Mon 19-10-2026 to Fri 23-10-2026)", () => {
    const res = calculateLeaveDuration({
      startDate: "19-10-2026", // Monday
      endDate: "23-10-2026",   // Friday
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.totalDays, 5.0);
    assert.strictEqual(res.eligibleWorkingDays, 5);
    assert.strictEqual(res.weekendDays, 0);
    assert.strictEqual(res.holidayDays, 0);
  });

  it("Scenario 2: Correctly excludes Saturday and Sunday over a 9-day period (Mon to next Tue)", () => {
    // 12-10-2026 (Mon) to 20-10-2026 (Tue) = 9 calendar days, with 1 Sat (17th) and 1 Sun (18th)
    const res = calculateLeaveDuration({
      startDate: "12-10-2026",
      endDate: "20-10-2026",
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.weekendDays, 2);
    assert.strictEqual(res.totalDays, 7.0);
    assert.strictEqual(res.eligibleWorkingDays, 7);
  });

  it("Scenario 3: Returns 0 deductible days if period consists exclusively of weekends", () => {
    // 17-10-2026 (Sat) to 18-10-2026 (Sun)
    const res = calculateLeaveDuration({
      startDate: "17-10-2026",
      endDate: "18-10-2026",
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.weekendDays, 2);
    assert.strictEqual(res.totalDays, 0.0);
  });

  it("Scenario 4: Correctly excludes recognized Public Holiday (Republic Day: 26-01-2026)", () => {
    // 26-01-2026 (Mon Republic Day) to 27-01-2026 (Tue)
    const res = calculateLeaveDuration({
      startDate: "26-01-2026",
      endDate: "27-01-2026",
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.holidayDays, 1);
    assert.strictEqual(res.eligibleWorkingDays, 1);
    assert.strictEqual(res.totalDays, 1.0);
  });

  it("Scenario 5: Handles Half-Day request on single calendar day (0.5 day)", () => {
    const res = calculateLeaveDuration({
      startDate: "21-10-2026", // Wednesday
      endDate: "21-10-2026",
      isHalfDay: true,
      halfDaySession: "FIRST_HALF",
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.totalDays, 0.5);
  });

  it("Scenario 6: Disallows multi-day half-day requests", () => {
    const res = calculateLeaveDuration({
      startDate: "21-10-2026",
      endDate: "22-10-2026",
      isHalfDay: true,
    });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.errorMessage?.includes("Half-day leave requests can only be applied for a single calendar day"));
  });

  it("Scenario 7: Rejects invalid date ordering where start date is after end date", () => {
    const res = calculateLeaveDuration({
      startDate: "25-10-2026",
      endDate: "20-10-2026",
    });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.errorMessage?.includes("Start date cannot be after end date"));
  });

  it("Scenario 8: Correctly validates date strings across month boundaries (30-10-2026 to 03-11-2026)", () => {
    // 30 Oct (Fri), 31 Oct (Sat), 01 Nov (Sun - Kannada Rajyotsava), 02 Nov (Mon), 03 Nov (Tue)
    const res = calculateLeaveDuration({
      startDate: "30-10-2026",
      endDate: "03-11-2026",
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.weekendDays, 2); // 31-Oct and 01-Nov (weekend takes precedence)
    assert.strictEqual(res.totalDays, 3.0);  // 30-Oct, 02-Nov, 03-Nov
  });
});

describe("Phase 4 Leave Conflict & Overlap Detection", () => {
  const existingLeaves = [
    {
      id: "req_001",
      referenceId: "LV-2026-001",
      startDate: "12-10-2026",
      endDate: "15-10-2026",
      status: "APPROVED",
      isHalfDay: false,
    },
    {
      id: "req_002",
      referenceId: "LV-2026-002",
      startDate: "25-10-2026",
      endDate: "28-10-2026",
      status: "PENDING",
      isHalfDay: false,
    },
    {
      id: "req_003",
      referenceId: "LV-2026-003",
      startDate: "05-11-2026",
      endDate: "05-11-2026",
      status: "APPROVED",
      isHalfDay: true,
      halfDaySession: "FIRST_HALF",
    },
  ];

  it("Scenario 9: Flags overlap when new request intersects existing approved leave", () => {
    // 14-10-2026 to 16-10-2026 overlaps with LV-2026-001 (12th to 15th)
    const conflict = detectLeaveConflicts(existingLeaves, "14-10-2026", "16-10-2026");
    assert.strictEqual(conflict.hasConflict, true);
    assert.ok(conflict.reason?.includes("LV-2026-001"));
  });

  it("Scenario 10: Flags overlap when new request intersects pending leave", () => {
    // 27-10-2026 to 30-10-2026 overlaps with LV-2026-002 (25th to 28th)
    const conflict = detectLeaveConflicts(existingLeaves, "27-10-2026", "30-10-2026");
    assert.strictEqual(conflict.hasConflict, true);
    assert.ok(conflict.reason?.includes("LV-2026-002"));
  });

  it("Scenario 11: Allows non-overlapping dates to proceed cleanly", () => {
    // 18-10-2026 to 22-10-2026 (falls between the existing leaves)
    const conflict = detectLeaveConflicts(existingLeaves, "18-10-2026", "22-10-2026");
    assert.strictEqual(conflict.hasConflict, false);
  });

  it("Scenario 12: Permits opposite half-day on same calendar day (Second Half vs First Half)", () => {
    // 05-11-2026 has approved First Half leave. Applying for Second Half should NOT conflict!
    const conflict = detectLeaveConflicts(
      existingLeaves,
      "05-11-2026",
      "05-11-2026",
      true,
      "SECOND_HALF"
    );
    assert.strictEqual(conflict.hasConflict, false);
  });

  it("Scenario 13: Flags conflicting half-day if both request the same session (First Half)", () => {
    const conflict = detectLeaveConflicts(
      existingLeaves,
      "05-11-2026",
      "05-11-2026",
      true,
      "FIRST_HALF"
    );
    assert.strictEqual(conflict.hasConflict, true);
  });
});

describe("Phase 4 RBAC & Anti-Self-Approval Perimeter", () => {
  const superAdmin = { id: "emp_vsecure_001", role: "SUPER_ADMIN" as const, departmentId: "dept_eng" };
  const hrAdmin = { id: "emp_vsecure_002", role: "HR_ADMIN" as const, departmentId: "dept_hr" };
  const engManager = { id: "emp_vsecure_003", role: "MANAGER" as const, departmentId: "dept_eng" };
  const sreEmployee = { id: "emp_vsecure_004", role: "EMPLOYEE" as const, departmentId: "dept_ops" };

  it("Scenario 14: Enforces strict Anti-Self-Approval (Manager cannot approve their own leave)", () => {
    const ownRequest = {
      employeeId: "emp_vsecure_003", // Arjun Mehta
      departmentId: "dept_eng",
      status: "PENDING",
    };

    const canApprove = canApproveLeave(engManager, ownRequest);
    assert.strictEqual(canApprove, false, "Manager must NEVER be permitted to approve their own request!");
  });

  it("Scenario 15: Manager can approve requests for members within their assigned department", () => {
    const teamMemberRequest = {
      employeeId: "emp_vsecure_005",
      departmentId: "dept_eng",
      status: "PENDING",
    };

    const canApprove = canApproveLeave(engManager, teamMemberRequest);
    assert.strictEqual(canApprove, true);
  });

  it("Scenario 16: Manager cannot approve requests for employees outside their department", () => {
    const otherDeptRequest = {
      employeeId: "emp_vsecure_004", // Kavita in dept_ops
      departmentId: "dept_ops",
      status: "PENDING",
    };

    const canApprove = canApproveLeave(engManager, otherDeptRequest);
    assert.strictEqual(canApprove, false);
  });

  it("Scenario 17: Super Admin Vishnu can approve requests across all departments", () => {
    const request = {
      employeeId: "emp_vsecure_004",
      departmentId: "dept_ops",
      status: "PENDING",
    };

    assert.strictEqual(canApproveLeave(superAdmin, request), true);
  });

  it("Scenario 18: Ordinary employee cannot approve any leave requests", () => {
    const request = {
      employeeId: "emp_vsecure_002",
      departmentId: "dept_hr",
      status: "PENDING",
    };

    assert.strictEqual(canApproveLeave(sreEmployee, request), false);
  });

  it("Scenario 19: Ordinary employee cannot view another employee's private leave records", () => {
    const otherEmployee = { id: "emp_vsecure_003", departmentId: "dept_eng" };
    assert.strictEqual(canViewLeave(sreEmployee, otherEmployee), false);
  });

  it("Scenario 20: Employee can view their own leave records", () => {
    const self = { id: "emp_vsecure_004", departmentId: "dept_ops" };
    assert.strictEqual(canViewLeave(sreEmployee, self), true);
  });

  it("Scenario 21: Only HR Admin and Super Admin can adjust leave quotas", () => {
    assert.strictEqual(canAdjustLeaveBalance(superAdmin), true);
    assert.strictEqual(canAdjustLeaveBalance(hrAdmin), true);
    assert.strictEqual(canAdjustLeaveBalance(engManager), false);
    assert.strictEqual(canAdjustLeaveBalance(sreEmployee), false);
  });
});

describe("Phase 4 Visual Badges & Design System Compatibility", () => {
  it("Scenario 22: Generates correct badge metadata for Casual, Sick, Earned, and LOP leaves", () => {
    const cl = getLeaveTypeBadge("CASUAL");
    assert.strictEqual(cl.code, "CL");
    assert.strictEqual(cl.isPaid, true);

    const sl = getLeaveTypeBadge("SICK");
    assert.strictEqual(sl.code, "SL");
    assert.strictEqual(sl.isPaid, true);

    const el = getLeaveTypeBadge("EARNED");
    assert.strictEqual(el.code, "EL");
    assert.strictEqual(el.isPaid, true);

    const lop = getLeaveTypeBadge("UNPAID_LOP");
    assert.strictEqual(lop.code, "LOP");
    assert.strictEqual(lop.isPaid, false);
  });

  it("Scenario 23: Generates distinct approval badges for Approved, Pending, Rejected, and Cancelled", () => {
    const app = getLeaveApprovalBadge("APPROVED");
    assert.strictEqual(app.label, "Approved");
    assert.ok(app.badgeClass.includes("emerald"));

    const pend = getLeaveApprovalBadge("PENDING");
    assert.strictEqual(pend.label, "Pending Approval");
    assert.ok(pend.badgeClass.includes("amber"));

    const rej = getLeaveApprovalBadge("REJECTED");
    assert.strictEqual(rej.label, "Rejected");
    assert.ok(rej.badgeClass.includes("rose"));

    const canc = getLeaveApprovalBadge("CANCELLED");
    assert.strictEqual(canc.label, "Cancelled");
  });
});
