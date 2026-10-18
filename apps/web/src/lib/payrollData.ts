/**
 * VSecure Technologies HRMS - Phase 5 Automated Payroll & Salary In-Memory Fallback State
 * Decimal-safe calculations, DD-MM-YYYY dates, 12-hour IST, Indian Rupee (INR ₹)
 */

import {
  PayrollCycleItem,
  PayrollRecordItem,
  PayrollDashboardStats,
  BankTransferExportItem,
  PayrollStatus,
  PaymentStatus,
  LopCalculationBasis,
  calculateEmployeePayroll,
  getDaysInMonth,
  formatDateDDMMYYYY,
} from "@vsecure/shared";

export let LIVE_PAYROLL_CYCLES: PayrollCycleItem[] = [
  {
    id: "cycle_2026_10",
    month: 10,
    year: 2026,
    status: "APPROVED",
    totalEmployees: 6,
    totalGrossINR: 680000,
    totalDeductionsINR: 12492,
    totalEmployerContributionsINR: 11140,
    totalNetPayableINR: 667508,
    lopCalculationBasis: "CALENDAR_DAYS",
    processedBy: "Priya Sharma (HR Admin)",
    reviewedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    finalizedAt: null,
    paidAt: null,
    paymentReference: "VS-PAY-202610-BATCH",
    rejectionReason: null,
    notes: "October 2026 regular cycle. Verified against biometric geofence logs and Phase 4 approved leaves.",
    createdAt: "01-10-2026, 09:00 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
    recordsCount: 6,
  },
  {
    id: "cycle_2026_09",
    month: 9,
    year: 2026,
    status: "PAID",
    totalEmployees: 6,
    totalGrossINR: 680000,
    totalDeductionsINR: 11040,
    totalEmployerContributionsINR: 11140,
    totalNetPayableINR: 668960,
    lopCalculationBasis: "CALENDAR_DAYS",
    processedBy: "Priya Sharma (HR Admin)",
    reviewedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    finalizedAt: "30-09-2026, 06:00 PM IST",
    paidAt: "01-10-2026, 11:30 AM IST",
    paymentReference: "CMS98471203948",
    rejectionReason: null,
    notes: "September 2026 salary cycle successfully disbursed via Corporate Netbanking.",
    createdAt: "01-09-2026, 09:00 AM IST",
    updatedAt: "01-10-2026, 11:30 AM IST",
    recordsCount: 6,
  },
];

export let LIVE_PAYROLL_RECORDS: PayrollRecordItem[] = [
  // VS-001: Vishnu (Super Admin / Chief Architect)
  {
    id: "rec_pay_2026_10_001",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_001",
    employeeCode: "VS-001",
    employeeName: "Vishnu",
    email: "vishnu@vsecuretechnologies.com",
    departmentName: "Engineering & Architecture",
    designation: "Founder & Chief Architect",
    joiningDate: "01-01-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 22,
    lateArrivalDays: 0,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidAbsenceDays: 0,
    lopDays: 0,
    overtimeHours: 0,
    basicSalaryINR: 120000,
    hraINR: 60000,
    conveyanceINR: 10000,
    specialAllowanceINR: 60000,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 250000,
    pfEmployeeINR: 1800,
    esiEmployeeINR: 0,
    profTaxINR: 200,
    lopDeductionINR: 0,
    otherDeductionsINR: 0,
    totalDeductions: 2000,
    pfEmployerINR: 1800,
    esiEmployerINR: 0,
    totalEmployerCostINR: 251800,
    netPayableINR: 248000,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "HDFC Bank",
    bankAccountNumber: "50100987654321",
    bankIFSC: "HDFC0001234",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-001.pdf",
    payslipNumber: "VS-PAY-202610-001",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
  // VS-002: Priya Sharma (HR Admin)
  {
    id: "rec_pay_2026_10_002",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_002",
    employeeCode: "VS-002",
    employeeName: "Priya Sharma",
    email: "priya.sharma@vsecuretechnologies.com",
    departmentName: "People & Human Resources",
    designation: "HR Operations Lead",
    joiningDate: "15-02-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 21.5,
    lateArrivalDays: 1,
    halfDays: 0.5,
    paidLeaveDays: 0.5,
    unpaidAbsenceDays: 0,
    lopDays: 0,
    overtimeHours: 0,
    basicSalaryINR: 50000,
    hraINR: 25000,
    conveyanceINR: 5000,
    specialAllowanceINR: 15000,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 95000,
    pfEmployeeINR: 1800,
    esiEmployeeINR: 0,
    profTaxINR: 200,
    lopDeductionINR: 0,
    otherDeductionsINR: 0,
    totalDeductions: 2000,
    pfEmployerINR: 1800,
    esiEmployerINR: 0,
    totalEmployerCostINR: 96800,
    netPayableINR: 93000,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "ICICI Bank",
    bankAccountNumber: "000901543210",
    bankIFSC: "ICIC0000009",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-002.pdf",
    payslipNumber: "VS-PAY-202610-002",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
  // VS-003: Arjun Mehta (Manager / Engineering Lead)
  {
    id: "rec_pay_2026_10_003",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_003",
    employeeCode: "VS-003",
    employeeName: "Arjun Mehta",
    email: "arjun.mehta@vsecuretechnologies.com",
    departmentName: "Engineering & Architecture",
    designation: "Principal Cloud Architect",
    joiningDate: "10-03-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 22,
    lateArrivalDays: 0,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidAbsenceDays: 0,
    lopDays: 0,
    overtimeHours: 0,
    basicSalaryINR: 85000,
    hraINR: 42500,
    conveyanceINR: 10000,
    specialAllowanceINR: 27500,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 165000,
    pfEmployeeINR: 1800,
    esiEmployeeINR: 0,
    profTaxINR: 200,
    lopDeductionINR: 0,
    otherDeductionsINR: 0,
    totalDeductions: 2000,
    pfEmployerINR: 1800,
    esiEmployerINR: 0,
    totalEmployerCostINR: 166800,
    netPayableINR: 163000,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "State Bank of India",
    bankAccountNumber: "389201948571",
    bankIFSC: "SBIN0004567",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-003.pdf",
    payslipNumber: "VS-PAY-202610-003",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
  // VS-004: Kavita Raman (Senior Cloud Engineer) - 2 Days Approved Casual Leave (Paid)
  {
    id: "rec_pay_2026_10_004",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_004",
    employeeCode: "VS-004",
    employeeName: "Kavita Raman",
    email: "kavita.raman@vsecuretechnologies.com",
    departmentName: "Engineering & Architecture",
    designation: "Senior Cloud Engineer",
    joiningDate: "01-06-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 20,
    lateArrivalDays: 0,
    halfDays: 0,
    paidLeaveDays: 2, // Approved Casual Leave (12-10-2026 to 13-10-2026)
    unpaidAbsenceDays: 0,
    lopDays: 0,
    overtimeHours: 0,
    basicSalaryINR: 55000,
    hraINR: 27500,
    conveyanceINR: 5000,
    specialAllowanceINR: 22500,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 110000,
    pfEmployeeINR: 1800,
    esiEmployeeINR: 0,
    profTaxINR: 200,
    lopDeductionINR: 0,
    otherDeductionsINR: 0,
    totalDeductions: 2000,
    pfEmployerINR: 1800,
    esiEmployerINR: 0,
    totalEmployerCostINR: 111800,
    netPayableINR: 108000,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "Axis Bank",
    bankAccountNumber: "918010045829103",
    bankIFSC: "UTIB0000123",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-004.pdf",
    payslipNumber: "VS-PAY-202610-004",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
  // VS-005: Rahul Verma (Cloud Operations Engineer) - 1 Day LOP (Unpaid Absence)
  {
    id: "rec_pay_2026_10_005",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_005",
    employeeCode: "VS-005",
    employeeName: "Rahul Verma",
    email: "rahul.verma@vsecuretechnologies.com",
    departmentName: "Cloud & Operations",
    designation: "Cloud Operations Engineer",
    joiningDate: "15-07-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 21,
    lateArrivalDays: 2,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidAbsenceDays: 1,
    lopDays: 1, // 1 LOP Day = 45000 / 31 = ₹1,452 deduction
    overtimeHours: 0,
    basicSalaryINR: 22000,
    hraINR: 11000,
    conveyanceINR: 3000,
    specialAllowanceINR: 9000,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 45000,
    pfEmployeeINR: 1800,
    esiEmployeeINR: 0,
    profTaxINR: 200,
    lopDeductionINR: 1452,
    otherDeductionsINR: 0,
    totalDeductions: 3452,
    pfEmployerINR: 1800,
    esiEmployerINR: 0,
    totalEmployerCostINR: 46800,
    netPayableINR: 41548,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "Kotak Mahindra Bank",
    bankAccountNumber: "781290384721",
    bankIFSC: "KKBK0000987",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-005.pdf",
    payslipNumber: "VS-PAY-202610-005",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
  // VS-006: Deepa Nair (Field Network Specialist) - Statutory ESI Eligible
  {
    id: "rec_pay_2026_10_006",
    payrollCycleId: "cycle_2026_10",
    employeeId: "emp_vsecure_006",
    employeeCode: "VS-006",
    employeeName: "Deepa Nair",
    email: "deepa.nair@vsecuretechnologies.com",
    departmentName: "Cloud & Operations",
    designation: "Field Network Specialist",
    joiningDate: "01-08-2024",
    month: 10,
    year: 2026,
    status: "APPROVED",
    paymentStatus: "NOT_PAID",
    calendarDays: 31,
    workingDays: 22,
    presentDays: 22,
    lateArrivalDays: 0,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidAbsenceDays: 0,
    lopDays: 0,
    overtimeHours: 0,
    basicSalaryINR: 10000,
    hraINR: 5000,
    conveyanceINR: 2000,
    specialAllowanceINR: 3000,
    overtimePayINR: 0,
    incentivesINR: 0,
    bonusINR: 0,
    grossEarningsINR: 20000,
    pfEmployeeINR: 1200, // 12% of 10,000
    esiEmployeeINR: 150, // 0.75% of 20,000
    profTaxINR: 200,
    lopDeductionINR: 0,
    otherDeductionsINR: 0,
    totalDeductions: 1550,
    pfEmployerINR: 1200,
    esiEmployerINR: 650, // 3.25% of 20,000
    totalEmployerCostINR: 21850,
    netPayableINR: 18450,
    isPaid: false,
    paidAt: null,
    paymentMethod: "NEFT",
    paymentReference: null,
    paidAmountINR: null,
    paymentRemarks: null,
    bankName: "Canara Bank",
    bankAccountNumber: "0847101009823",
    bankIFSC: "CNRB0000847",
    payslipPdfUrl: "/api/payslip/VS-PAY-202610-006.pdf",
    payslipNumber: "VS-PAY-202610-006",
    processedBy: "Priya Sharma (HR Admin)",
    approvedBy: "Vishnu (Super Admin)",
    rejectionReason: null,
    createdAt: "01-10-2026, 09:30 AM IST",
    updatedAt: "18-10-2026, 05:30 PM IST",
  },
];

export interface PayrollAuditItem {
  id: string;
  payrollRecordId?: string | null;
  payrollCycleId?: string | null;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  actorId: string;
  actorName: string;
  remarks?: string | null;
  createdAt: string;
}

export let LIVE_PAYROLL_AUDIT: PayrollAuditItem[] = [
  {
    id: "aud_pay_001",
    payrollCycleId: "cycle_2026_10",
    action: "CALCULATE",
    previousStatus: "DRAFT",
    newStatus: "PENDING_REVIEW",
    actorId: "emp_vsecure_002",
    actorName: "Priya Sharma (HR Admin)",
    remarks: "Automated calculation generated based on Phase 3 geofence attendance and Phase 4 approved leaves.",
    createdAt: "01-10-2026, 09:30 AM IST",
  },
  {
    id: "aud_pay_002",
    payrollCycleId: "cycle_2026_10",
    action: "SUBMIT_APPROVAL",
    previousStatus: "PENDING_REVIEW",
    newStatus: "PENDING_APPROVAL",
    actorId: "emp_vsecure_002",
    actorName: "Priya Sharma (HR Admin)",
    remarks: "Payroll reviewed. Verified 1 LOP day for Rahul Verma and 2 paid casual leaves for Kavita Raman.",
    createdAt: "01-10-2026, 11:15 AM IST",
  },
  {
    id: "aud_pay_003",
    payrollCycleId: "cycle_2026_10",
    action: "APPROVE",
    previousStatus: "PENDING_APPROVAL",
    newStatus: "APPROVED",
    actorId: "emp_vsecure_001",
    actorName: "Vishnu (Super Admin)",
    remarks: "Authorized and approved for salary disbursement upon final review.",
    createdAt: "18-10-2026, 05:30 PM IST",
  },
];

// Helper functions for state manipulation

export function getPayrollDashboardStats(month: number = 10, year: number = 2026): PayrollDashboardStats {
  const cycle = LIVE_PAYROLL_CYCLES.find((c) => c.month === month && c.year === year);
  const records = LIVE_PAYROLL_RECORDS.filter((r) => r.month === month && r.year === year);

  const totalGrossEarningsINR = records.reduce((sum, r) => sum + r.grossEarningsINR, 0);
  const totalEmployeeDeductionsINR = records.reduce((sum, r) => sum + r.totalDeductions, 0);
  const totalEmployerContributionsINR = records.reduce(
    (sum, r) => sum + r.pfEmployerINR + r.esiEmployerINR,
    0
  );
  const totalNetSalaryPayableINR = records.reduce((sum, r) => sum + r.netPayableINR, 0);

  const pendingReviewCount = records.filter((r) => r.status === "PENDING_REVIEW").length;
  const pendingApprovalCount = records.filter((r) => r.status === "PENDING_APPROVAL").length;
  const finalizedCount = records.filter((r) => r.status === "FINALIZED").length;
  const paidCount = records.filter((r) => r.isPaid || r.status === "PAID").length;
  const exceptionsCount = records.filter((r) => !r.bankAccountNumber || !r.bankIFSC).length;

  return {
    totalActiveEmployees: 6,
    employeesIncluded: records.length,
    totalGrossEarningsINR,
    totalEmployeeDeductionsINR,
    totalEmployerContributionsINR,
    totalNetSalaryPayableINR,
    pendingReviewCount,
    pendingApprovalCount,
    finalizedCount,
    paidCount,
    exceptionsCount,
    currentCycleStatus: cycle?.status || "DRAFT",
    currentCycleId: cycle?.id || null,
  };
}

export function updatePayrollCycleStatus(
  cycleId: string,
  newStatus: PayrollStatus,
  actorId: string,
  actorName: string,
  remarks?: string
): PayrollCycleItem | null {
  const cycle = LIVE_PAYROLL_CYCLES.find((c) => c.id === cycleId);
  if (!cycle) return null;

  const previousStatus = cycle.status;
  cycle.status = newStatus;
  cycle.updatedAt = formatDateDDMMYYYY(new Date());

  if (newStatus === "FINALIZED") {
    cycle.finalizedAt = formatDateDDMMYYYY(new Date());
  } else if (newStatus === "PAID") {
    cycle.paidAt = formatDateDDMMYYYY(new Date());
  }

  // Update records status to match cycle
  LIVE_PAYROLL_RECORDS.forEach((r) => {
    if (r.payrollCycleId === cycleId) {
      r.status = newStatus;
      if (newStatus === "PAID") {
        r.isPaid = true;
        r.paymentStatus = "PAID";
        r.paidAt = formatDateDDMMYYYY(new Date());
      }
    }
  });

  // Log audit
  LIVE_PAYROLL_AUDIT.push({
    id: `aud_${Date.now()}`,
    payrollCycleId: cycleId,
    action: newStatus,
    previousStatus,
    newStatus,
    actorId,
    actorName,
    remarks: remarks || `Status transitioned to ${newStatus}`,
    createdAt: `${formatDateDDMMYYYY(new Date())}, IST`,
  });

  return cycle;
}

export function recordPaymentForRecord(
  recordId: string,
  paymentDetails: {
    paymentMethod: string;
    paymentReference: string;
    paidAmountINR: number;
    paymentRemarks?: string;
  },
  actorId: string,
  actorName: string
): PayrollRecordItem | null {
  const rec = LIVE_PAYROLL_RECORDS.find((r) => r.id === recordId);
  if (!rec) return null;

  rec.isPaid = true;
  rec.status = "PAID";
  rec.paymentStatus = "PAID";
  rec.paidAt = formatDateDDMMYYYY(new Date());
  rec.paymentMethod = paymentDetails.paymentMethod;
  rec.paymentReference = paymentDetails.paymentReference;
  rec.paidAmountINR = paymentDetails.paidAmountINR;
  rec.paymentRemarks = paymentDetails.paymentRemarks || null;
  rec.updatedAt = formatDateDDMMYYYY(new Date());

  LIVE_PAYROLL_AUDIT.push({
    id: `aud_${Date.now()}`,
    payrollRecordId: recordId,
    action: "RECORD_PAYMENT",
    previousStatus: "FINALIZED",
    newStatus: "PAID",
    actorId,
    actorName,
    remarks: `Payment recorded via ${paymentDetails.paymentMethod}. Ref: ${paymentDetails.paymentReference}`,
    createdAt: `${formatDateDDMMYYYY(new Date())}, IST`,
  });

  return rec;
}

export function generateBankTransferExport(month: number = 10, year: number = 2026): BankTransferExportItem[] {
  const records = LIVE_PAYROLL_RECORDS.filter(
    (r) => r.month === month && r.year === year && r.netPayableINR > 0
  );

  return records.map((r) => ({
    beneficiaryName: r.employeeName,
    beneficiaryAccount: r.bankAccountNumber || "MISSING_ACCOUNT",
    ifscCode: r.bankIFSC || "MISSING_IFSC",
    amountINR: r.netPayableINR,
    paymentNarration: `SALARY-${r.month}-${r.year}-${r.employeeCode}`,
    employeeCode: r.employeeCode,
    department: r.departmentName,
    paymentReference: r.paymentReference || `SAL-${r.employeeCode}-${r.month}${r.year}`,
  }));
}
