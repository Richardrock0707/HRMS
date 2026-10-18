import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateEmployeePayroll,
  calculateLopDeduction,
  formatINRInWords,
  maskBankAccountNumber,
  getMonthName,
  getDaysInMonth,
  getPayrollStatusConfig,
  getPaymentStatusConfig,
  hasPermission,
  canViewPayslip,
  canApprovePayroll,
  canFinalizePayroll,
  canReopenPayroll,
  canManagePayroll,
  canExportBankTransfer,
  canRecordSalaryPayment,
  UserContext,
} from "../src/index.ts";

describe("Phase 5 Automated Payroll & Financial Calculation Engine", () => {
  it("Scenario 1: Employee with complete monthly salary structure (Vishnu VS-001)", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_vsecure_001",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      unpaidAbsenceDays: 0,
      lopDays: 0,
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 120000,
        hraINR: 60000,
        conveyanceINR: 10000,
        specialAllowanceINR: 60000,
        pfApplicable: true,
        esiApplicable: false,
        profTaxINR: 200,
      },
    });

    assert.strictEqual(calc.grossEarningsINR, 250000);
    assert.strictEqual(calc.pfEmployeeINR, 1800); // Standard statutory cap ₹1,800
    assert.strictEqual(calc.esiEmployeeINR, 0); // Ineligible (> ₹21,000)
    assert.strictEqual(calc.profTaxINR, 200);
    assert.strictEqual(calc.lopDeductionINR, 0);
    assert.strictEqual(calc.totalDeductions, 2000);
    assert.strictEqual(calc.netPayableINR, 248000);
    assert.strictEqual(calc.pfEmployerINR, 1800);
    assert.strictEqual(calc.totalEmployerCostINR, 251800);
  });

  it("Scenario 2: Employee with approved paid leave (Kavita VS-004: 2 Paid Casual Leaves, 0 LOP)", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_vsecure_004",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 20,
      paidLeaveDays: 2, // 2 Days approved CL from Phase 4
      unpaidAbsenceDays: 0,
      lopDays: 0,
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 55000,
        hraINR: 27500,
        conveyanceINR: 5000,
        specialAllowanceINR: 22500,
        pfApplicable: true,
        esiApplicable: false,
        profTaxINR: 200,
      },
    });

    assert.strictEqual(calc.grossEarningsINR, 110000);
    assert.strictEqual(calc.lopDeductionINR, 0); // Approved paid leave has zero LOP
    assert.strictEqual(calc.totalDeductions, 2000);
    assert.strictEqual(calc.netPayableINR, 108000);
  });

  it("Scenario 3: Employee with 1 Day Loss of Pay (Rahul VS-005: 1 LOP Day = 45000/31)", () => {
    const calc = calculateEmployeePayroll({
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

    assert.strictEqual(calc.grossEarningsINR, 45000);
    // 45,000 / 31 = 1451.61 -> rounded to nearest whole rupee = ₹1,452
    assert.strictEqual(calc.lopDeductionINR, 1452);
    assert.strictEqual(calc.pfEmployeeINR, 1800);
    assert.strictEqual(calc.profTaxINR, 200);
    assert.strictEqual(calc.totalDeductions, 1800 + 200 + 1452); // 3,452
    assert.strictEqual(calc.netPayableINR, 45000 - 3452); // 41,548
  });

  it("Scenario 4: Loss of Pay with Working Days Basis vs Calendar Days Basis", () => {
    // 1 LOP Day on ₹66,000 gross with 22 working days vs 31 calendar days
    const calendarBasis = calculateLopDeduction(66000, 31, 22, 1, "CALENDAR_DAYS");
    const workingBasis = calculateLopDeduction(66000, 31, 22, 1, "WORKING_DAYS");

    // Working days divisor: 66,000 / 22 = 3,000 / day
    assert.strictEqual(workingBasis.dailyGrossINR, 3000);
    assert.strictEqual(workingBasis.lopDeductionINR, 3000);

    // Calendar days divisor: 66,000 / 31 = 2129.03 / day
    assert.strictEqual(calendarBasis.dailyGrossINR, 2129.03);
    assert.strictEqual(calendarBasis.lopDeductionINR, 2129);
  });

  it("Scenario 5: Employee with Half-Day LOP (0.5 day LOP)", () => {
    const halfDayLop = calculateLopDeduction(62000, 31, 22, 0.5, "CALENDAR_DAYS");
    // Daily: 62000 / 31 = 2000. 0.5 day = 1000
    assert.strictEqual(halfDayLop.dailyGrossINR, 2000);
    assert.strictEqual(halfDayLop.lopDeductionINR, 1000);
  });

  it("Scenario 6: Employee with Variable Overtime Earnings", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_vsecure_test",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      unpaidAbsenceDays: 0,
      lopDays: 0,
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 30000,
        hraINR: 15000,
        conveyanceINR: 3000,
        specialAllowanceINR: 2000,
        overtimeHours: 12,
        overtimeHourlyRateINR: 250, // 12 * 250 = ₹3,000
        pfApplicable: true,
        profTaxINR: 200,
      },
    });

    assert.strictEqual(calc.overtimePayINR, 3000);
    assert.strictEqual(calc.grossEarningsINR, 50000 + 3000); // 53,000
    assert.strictEqual(calc.netPayableINR, 53000 - (1800 + 200)); // 51,000
  });

  it("Scenario 7: Employee with Performance Incentives and Festival Bonus", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_vsecure_test",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      unpaidAbsenceDays: 0,
      lopDays: 0,
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 40000,
        hraINR: 20000,
        incentivesINR: 7500,
        bonusINR: 10000,
        pfApplicable: true,
        profTaxINR: 200,
      },
    });

    assert.strictEqual(calc.grossEarningsINR, 77500); // 60,000 + 7,500 + 10,000
    assert.strictEqual(calc.totalDeductions, 2000);
    assert.strictEqual(calc.netPayableINR, 75500);
  });

  it("Scenario 8: Statutory ESI Deduction (Deepa VS-006: Gross ₹20,000, ESI 0.75% = ₹150)", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_vsecure_006",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      unpaidAbsenceDays: 0,
      lopDays: 0,
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 10000,
        hraINR: 5000,
        conveyanceINR: 2000,
        specialAllowanceINR: 3000,
        pfApplicable: true,
        esiApplicable: true, // eligible because gross <= 21,000
        profTaxINR: 200,
      },
    });

    assert.strictEqual(calc.grossEarningsINR, 20000);
    // Employee ESI: 20,000 * 0.0075 = ₹150
    assert.strictEqual(calc.esiEmployeeINR, 150);
    // Employer ESI: 20,000 * 0.0325 = ₹650
    assert.strictEqual(calc.esiEmployerINR, 650);
    // Employee PF: 12% of 10,000 = ₹1,200
    assert.strictEqual(calc.pfEmployeeINR, 1200);
    assert.strictEqual(calc.profTaxINR, 200);
    assert.strictEqual(calc.totalDeductions, 1550);
    assert.strictEqual(calc.netPayableINR, 18450);
  });

  it("Scenario 9: Converts Indian currency to formal words accurately", () => {
    assert.strictEqual(
      formatINRInWords(248000),
      "Two Lakh Forty-Eight Thousand Rupees Only"
    );
    assert.strictEqual(
      formatINRInWords(108000),
      "One Lakh Eight Thousand Rupees Only"
    );
    assert.strictEqual(
      formatINRInWords(41548),
      "Forty-One Thousand Five Hundred and Forty-Eight Rupees Only"
    );
    assert.strictEqual(
      formatINRInWords(0),
      "Zero Rupees Only"
    );
  });

  it("Scenario 10: Correctly masks Bank Account numbers for UI tables", () => {
    assert.strictEqual(maskBankAccountNumber("50100987654321"), "•••• •••• 4321");
    assert.strictEqual(maskBankAccountNumber("918010045829103"), "•••• •••• 9103");
    assert.strictEqual(maskBankAccountNumber(null), "Not Provided");
  });

  it("Scenario 11: Calendar helper returns correct days in month and month names", () => {
    assert.strictEqual(getDaysInMonth(10, 2026), 31); // October
    assert.strictEqual(getDaysInMonth(9, 2026), 30);  // September
    assert.strictEqual(getDaysInMonth(2, 2024), 29);  // Leap year Feb
    assert.strictEqual(getDaysInMonth(2, 2026), 28);  // Normal year Feb
    assert.strictEqual(getMonthName(10), "October");
    assert.strictEqual(getMonthName(1), "January");
  });

  it("Scenario 12: Separation of duties: Only Super Admin can approve, finalize, and reopen payroll", () => {
    const superAdmin: UserContext = {
      id: "emp_vsecure_001",
      email: "vishnu@vsecuretechnologies.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    };

    const hrAdmin: UserContext = {
      id: "emp_vsecure_002",
      email: "priya.sharma@vsecuretechnologies.com",
      role: "HR_ADMIN",
      status: "ACTIVE",
    };

    const manager: UserContext = {
      id: "emp_vsecure_003",
      email: "arjun.mehta@vsecuretechnologies.com",
      role: "MANAGER",
      status: "ACTIVE",
    };

    const employee: UserContext = {
      id: "emp_vsecure_004",
      email: "kavita.raman@vsecuretechnologies.com",
      role: "EMPLOYEE",
      status: "ACTIVE",
    };

    // Approval
    assert.strictEqual(canApprovePayroll(superAdmin), true);
    assert.strictEqual(canApprovePayroll(hrAdmin), false);
    assert.strictEqual(canApprovePayroll(manager), false);

    // Finalization
    assert.strictEqual(canFinalizePayroll(superAdmin), true);
    assert.strictEqual(canFinalizePayroll(hrAdmin), false);

    // Reopen
    assert.strictEqual(canReopenPayroll(superAdmin), true);
    assert.strictEqual(canReopenPayroll(hrAdmin), false);

    // Preparation / Calculation
    assert.strictEqual(canManagePayroll(superAdmin), true);
    assert.strictEqual(canManagePayroll(hrAdmin), true);
    assert.strictEqual(canManagePayroll(manager), false);
    assert.strictEqual(canManagePayroll(employee), false);
  });

  it("Scenario 13: RBAC Anti-Leakage: Employees can only view their own payslip", () => {
    const employeeKavita: UserContext = {
      id: "emp_vsecure_004",
      email: "kavita.raman@vsecuretechnologies.com",
      role: "EMPLOYEE",
      status: "ACTIVE",
    };

    const employeeRahul: UserContext = {
      id: "emp_vsecure_005",
      email: "rahul.verma@vsecuretechnologies.com",
      role: "EMPLOYEE",
      status: "ACTIVE",
    };

    const hrAdmin: UserContext = {
      id: "emp_vsecure_002",
      email: "priya.sharma@vsecuretechnologies.com",
      role: "HR_ADMIN",
      status: "ACTIVE",
    };

    // Kavita can view her own payslip
    assert.strictEqual(canViewPayslip(employeeKavita, "emp_vsecure_004"), true);

    // Kavita CANNOT view Rahul's payslip
    assert.strictEqual(canViewPayslip(employeeKavita, "emp_vsecure_005"), false);

    // Rahul CANNOT view Kavita's payslip
    assert.strictEqual(canViewPayslip(employeeRahul, "emp_vsecure_004"), false);

    // HR Admin can view both
    assert.strictEqual(canViewPayslip(hrAdmin, "emp_vsecure_004"), true);
    assert.strictEqual(canViewPayslip(hrAdmin, "emp_vsecure_005"), true);
  });

  it("Scenario 14: Net Pay cannot be negative if deductions exceed gross earnings", () => {
    const calc = calculateEmployeePayroll({
      employeeId: "emp_test_negative",
      month: 10,
      year: 2026,
      calendarDays: 31,
      workingDays: 22,
      presentDays: 0,
      paidLeaveDays: 0,
      unpaidAbsenceDays: 31,
      lopDays: 31, // Full month LOP
      lopBasis: "CALENDAR_DAYS",
      salary: {
        basicSalaryINR: 20000,
        hraINR: 10000,
        otherDeductionsINR: 5000,
      },
    });

    assert.strictEqual(calc.lopDeductionINR, 30000);
    assert.strictEqual(calc.netPayableINR >= 0, true);
    assert.strictEqual(calc.netPayableINR, 0); // Floors at 0
  });
});
