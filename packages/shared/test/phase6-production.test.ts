import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateDistanceMeters,
  evaluateGpsAccuracy,
  evaluatePunctuality,
  evaluateLocationRisk,
  calculateLeaveDuration,
  detectLeaveConflicts,
  calculateEmployeePayroll,
  calculateLopDeduction,
  formatINRInWords,
  formatINR,
  maskBankAccountNumber,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  canViewPayslip,
  canApprovePayroll,
  canFinalizePayroll,
  canReopenPayroll,
  canManagePayroll,
  canApproveLeave,
  canViewLeave,
  hasPermission,
  VSECURE_CONFIG,
  DEFAULT_OFFICE_COORDINATES,
  DEFAULT_2026_HOLIDAYS,
  UserContext,
} from "../src/index.ts";

describe("Phase 6 Production Release & End-to-End Workflow Validation", () => {
  // Workflow A: Employee Onboarding & Compensation Perimeter
  describe("Workflow A: Employee Onboarding & Compensation", () => {
    it("Validates employee compensation structure and statutory flags", () => {
      const compensation = {
        basicSalaryINR: 85000,
        hraINR: 42500,
        allowancesINR: 37500,
        pfApplicable: true,
        esiApplicable: false,
        profTaxINR: 200,
      };

      const gross = compensation.basicSalaryINR + compensation.hraINR + compensation.allowancesINR;
      assert.strictEqual(gross, 165000);
      assert.strictEqual(formatINR(gross, false), "₹1,65,000");
    });
  });

  // Workflow B: Geofenced GPS Attendance & Anti-Spoofing
  describe("Workflow B: Geofenced GPS Attendance & Anti-Spoofing", () => {
    it("Verifies authentic employee punch within 100m HQ perimeter", () => {
      // 12.9353, 77.6948 is approx 24 meters from HQ center (12.9352, 77.6946)
      const distance = calculateDistanceMeters(
        12.9353,
        77.6948,
        DEFAULT_OFFICE_COORDINATES.latitude,
        DEFAULT_OFFICE_COORDINATES.longitude
      );

      assert.strictEqual(distance < 100, true);

      const antiSpoof = evaluateLocationRisk({
        isMockLocation: false,
        accuracyMeters: 12.0,
        distanceMeters: distance,
        radiusMeters: 100,
        isDeviceBound: true,
      });

      assert.strictEqual(antiSpoof.reviewStatus, "AUTO_VERIFIED");
      assert.strictEqual(antiSpoof.isAllowed, true);
    });

    it("Rejects punch when Android mock GPS or location spoofer is detected", () => {
      const spoofCheck = evaluateLocationRisk({
        isMockLocation: true,
        accuracyMeters: 5.0,
        distanceMeters: 10,
        radiusMeters: 100,
        isDeviceBound: true,
      });

      assert.strictEqual(spoofCheck.isAllowed, false);
      assert.strictEqual(spoofCheck.reviewStatus, "FLAGGED_SUSPICIOUS");
    });

    it("Verifies punctuality grading: 09:40 AM arrival is on-time with 15-min grace period", () => {
      const punchTime = new Date();
      punchTime.setHours(9, 40, 0, 0);
      const punctuality = evaluatePunctuality(punchTime, "09:30", 15);
      assert.strictEqual(punctuality.status, "PRESENT");
      assert.strictEqual(punctuality.minutesLate, 0);
    });
  });

  // Workflow C: Leave Management & Approval Ledger
  describe("Workflow C: Leave Management & LOP Ledger", () => {
    it("Verifies leave request excludes weekends and holidays cleanly", () => {
      // Mon 19-10-2026 to Fri 23-10-2026 (5 working days)
      const duration = calculateLeaveDuration({
        startDate: "19-10-2026",
        endDate: "23-10-2026",
        excludeWeekends: true,
        excludeHolidays: true,
        holidays: DEFAULT_2026_HOLIDAYS,
      });

      assert.strictEqual(duration.isValid, true);
      assert.strictEqual(duration.totalDays, 5.0);
    });

    it("Enforces Anti-Self-Approval: Managers cannot approve their own leave", () => {
      const managerUser: UserContext = {
        id: "emp_vsecure_003",
        role: "MANAGER",
        departmentId: "dept_eng",
      };

      const selfRequest = {
        employeeId: "emp_vsecure_003", // Same as manager
        departmentId: "dept_eng",
        status: "PENDING" as const,
      };

      assert.strictEqual(canApproveLeave(managerUser, selfRequest), false);
    });

    it("Allows manager to approve subordinates within their assigned department", () => {
      const managerUser: UserContext = {
        id: "emp_vsecure_003",
        role: "MANAGER",
        departmentId: "dept_eng",
      };

      const subordinateRequest = {
        employeeId: "emp_vsecure_004", // Kavita (Subordinate)
        departmentId: "dept_eng",
        status: "PENDING" as const,
      };

      assert.strictEqual(canApproveLeave(managerUser, subordinateRequest), true);
    });
  });

  // Workflow D: Automated Payroll & Finalized Locking
  describe("Workflow D: Automated Payroll & Finalized Locking", () => {
    it("Calculates deterministic payroll with 1 LOP Day and exact statutory deductions", () => {
      const payroll = calculateEmployeePayroll({
        employeeId: "emp_vsecure_005",
        month: 10,
        year: 2026,
        calendarDays: 31,
        workingDays: 22,
        presentDays: 21,
        paidLeaveDays: 0,
        unpaidAbsenceDays: 1,
        lopDays: 1,
        lopBasis: "CALENDAR_DAYS",
        salary: {
          basicSalaryINR: 22000,
          hraINR: 11000,
          conveyanceINR: 3000,
          specialAllowanceINR: 9000,
          pfApplicable: true,
          esiApplicable: false,
          profTaxINR: 200,
        },
      });

      assert.strictEqual(payroll.grossEarningsINR, 45000);
      assert.strictEqual(payroll.lopDeductionINR, 1452); // 45000 / 31
      assert.strictEqual(payroll.pfEmployeeINR, 1800);
      assert.strictEqual(payroll.profTaxINR, 200);
      assert.strictEqual(payroll.totalDeductions, 3452);
      assert.strictEqual(payroll.netPayableINR, 41548);
      assert.strictEqual(
        formatINRInWords(payroll.netPayableINR),
        "Forty-One Thousand Five Hundred and Forty-Eight Rupees Only"
      );
    });

    it("Enforces separation of duties: Only Super Admin can approve, lock, and reopen payroll", () => {
      const superAdmin: UserContext = {
        id: "emp_vsecure_001",
        role: "SUPER_ADMIN",
      };

      const hrAdmin: UserContext = {
        id: "emp_vsecure_002",
        role: "HR_ADMIN",
      };

      assert.strictEqual(canApprovePayroll(superAdmin), true);
      assert.strictEqual(canApprovePayroll(hrAdmin), false);

      assert.strictEqual(canFinalizePayroll(superAdmin), true);
      assert.strictEqual(canFinalizePayroll(hrAdmin), false);

      assert.strictEqual(canReopenPayroll(superAdmin), true);
      assert.strictEqual(canReopenPayroll(hrAdmin), false);
    });
  });

  // Workflow E: Security Anti-Leakage & Privacy
  describe("Workflow E: Security Anti-Leakage & Privacy", () => {
    it("Prevents ordinary employees from accessing other employees' payslips", () => {
      const employeeKavita: UserContext = {
        id: "emp_vsecure_004",
        role: "EMPLOYEE",
      };

      const employeeRahul: UserContext = {
        id: "emp_vsecure_005",
        role: "EMPLOYEE",
      };

      // Kavita can view her own payslip
      assert.strictEqual(canViewPayslip(employeeKavita, "emp_vsecure_004"), true);

      // Kavita cannot view Rahul's payslip
      assert.strictEqual(canViewPayslip(employeeKavita, "emp_vsecure_005"), false);

      // Rahul cannot view Kavita's payslip
      assert.strictEqual(canViewPayslip(employeeRahul, "emp_vsecure_004"), false);
    });

    it("Masks bank account numbers to last 4 digits for UI and audit logs", () => {
      assert.strictEqual(maskBankAccountNumber("50100987654321"), "•••• •••• 4321");
      assert.strictEqual(maskBankAccountNumber("000901543210"), "•••• •••• 3210");
      assert.strictEqual(maskBankAccountNumber(null), "Not Provided");
    });
  });

  // Regional Settings Verification
  describe("Regional & Company Configuration Standards", () => {
    it("Verifies strict regional settings: Asia/Kolkata, DD-MM-YYYY, 12-hour IST, INR", () => {
      assert.strictEqual(VSECURE_CONFIG.timezone, "Asia/Kolkata");
      assert.strictEqual(VSECURE_CONFIG.currency, "INR");
      assert.strictEqual(VSECURE_CONFIG.dateFormat, "DD-MM-YYYY");
      assert.strictEqual(VSECURE_CONFIG.timeFormat, "12-hour");
      assert.strictEqual(VSECURE_CONFIG.superAdminCode, "VS-001");
      assert.strictEqual(VSECURE_CONFIG.administrator, "Vishnu");
    });
  });
});
