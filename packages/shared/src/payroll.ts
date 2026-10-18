import {
  PayrollCalculationInput,
  PayrollCalculationResult,
  PayrollStatus,
  PaymentStatus,
  LopCalculationBasis,
} from "./types";

/**
 * Month names for payroll cycles
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getMonthName(month: number): string {
  if (month < 1 || month > 12) return "--";
  return MONTH_NAMES[month - 1];
}

/**
 * Returns number of calendar days in a given month and year
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Masks bank account number for privacy in UI tables (e.g., "•••• •••• 1012")
 */
export function maskBankAccountNumber(accountNumber?: string | null): string {
  if (!accountNumber) return "Not Provided";
  const trimmed = accountNumber.replace(/\s+/g, "");
  if (trimmed.length <= 4) return trimmed;
  const last4 = trimmed.slice(-4);
  return `•••• •••• ${last4}`;
}

/**
 * Converts numeric amount in INR to formal Indian English words
 * Example: 145250 -> "One Lakh Forty-Five Thousand Two Hundred Fifty Rupees Only"
 */
export function formatINRInWords(amount: number): string {
  if (!amount || amount === 0) return "Zero Rupees Only";
  const num = Math.floor(Math.abs(amount));

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const unit = n % 10;
    return `${tens[Math.floor(n / 10)]}${unit ? `-${units[unit]}` : ""}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = "";
    if (hundred > 0) {
      res += `${units[hundred]} Hundred`;
      if (rest > 0) res += " and ";
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(`${convertTwoDigits(crore)} Crore`);
  }
  if (lakh > 0) {
    parts.push(`${convertTwoDigits(lakh)} Lakh`);
  }
  if (thousand > 0) {
    parts.push(`${convertTwoDigits(thousand)} Thousand`);
  }
  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder));
  }

  return `${parts.join(" ")} Rupees Only`;
}

/**
 * Deterministic Loss of Pay (LOP) calculation engine
 */
export function calculateLopDeduction(
  monthlyGrossINR: number,
  calendarDays: number,
  workingDays: number,
  lopDays: number,
  basis: LopCalculationBasis = "CALENDAR_DAYS"
): { dailyGrossINR: number; lopDeductionINR: number } {
  if (lopDays <= 0 || monthlyGrossINR <= 0) {
    return { dailyGrossINR: 0, lopDeductionINR: 0 };
  }

  const divisor = basis === "WORKING_DAYS" ? Math.max(1, workingDays) : Math.max(1, calendarDays);
  // Round daily rate to 2 decimal places to ensure reproducibility
  const dailyGrossINR = Math.round((monthlyGrossINR / divisor) * 100) / 100;
  // Final deduction rounded to nearest whole rupee per Indian payroll standards
  const lopDeductionINR = Math.round(dailyGrossINR * lopDays);

  return { dailyGrossINR, lopDeductionINR };
}

/**
 * Deterministic, decimal-safe Indian Payroll Calculation Engine
 * 
 * Order of operations:
 * 1. Calculate Base Gross Earnings = Basic + HRA + Conveyance + Special Allowance
 * 2. Calculate Variable Additions = Overtime Pay + Incentives + Bonus
 * 3. Total Gross Earnings = Base Gross + Variable Additions
 * 4. Compute Loss of Pay (LOP) Deduction on Gross based on configured basis (Calendar vs Working Days)
 * 5. Compute Statutory Deductions:
 *    - Employee PF (12% of basic, capped at ₹1,800 unless configured)
 *    - Employee ESI (0.75% of gross if gross <= ₹21,000)
 *    - Professional Tax (₹200 if gross >= ₹15,000, or configured)
 * 6. Compute Employer Contributions:
 *    - Employer PF (12% of basic, capped at ₹1,800)
 *    - Employer ESI (3.25% of gross if eligible)
 * 7. Net Payable = Gross - (LOP + Employee PF + Employee ESI + PT + Other Deductions)
 */
export function calculateEmployeePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const {
    calendarDays = 31,
    workingDays = 22,
    presentDays = 0,
    paidLeaveDays = 0,
    lopDays = 0,
    lopBasis = "CALENDAR_DAYS",
    salary,
  } = input;

  const basicSalaryINR = Math.max(0, salary.basicSalaryINR || 0);
  const hraINR = Math.max(0, salary.hraINR || 0);
  const conveyanceINR = Math.max(0, salary.conveyanceINR || 0);
  const specialAllowanceINR = Math.max(0, salary.specialAllowanceINR || 0);

  // Overtime
  const overtimeHours = Math.max(0, salary.overtimeHours || 0);
  const overtimeHourlyRateINR = Math.max(0, salary.overtimeHourlyRateINR || 0);
  const overtimePayINR = Math.round(overtimeHours * overtimeHourlyRateINR);

  // Variable components
  const incentivesINR = Math.max(0, salary.incentivesINR || 0);
  const bonusINR = Math.max(0, salary.bonusINR || 0);

  // Gross Earnings
  const baseMonthlyGross = basicSalaryINR + hraINR + conveyanceINR + specialAllowanceINR;
  const grossEarningsINR = baseMonthlyGross + overtimePayINR + incentivesINR + bonusINR;

  // LOP Deduction
  const { dailyGrossINR, lopDeductionINR } = calculateLopDeduction(
    baseMonthlyGross,
    calendarDays,
    workingDays,
    lopDays,
    lopBasis
  );

  // Employee Statutory PF (12% on Basic, statutory wage cap is ₹15,000 so ₹1,800 is max standard deduction)
  let pfEmployeeINR = 0;
  if (salary.pfApplicable !== false) {
    pfEmployeeINR = Math.min(1800, Math.round(basicSalaryINR * 0.12));
  }

  // Employee Statutory ESI (0.75% if gross <= ₹21,000 per month)
  let esiEmployeeINR = 0;
  if (salary.esiApplicable === true && grossEarningsINR <= 21000) {
    esiEmployeeINR = Math.ceil(grossEarningsINR * 0.0075);
  }

  // Professional Tax (Standard Karnataka / Maharashtra / Tamil Nadu slab: ₹200 for gross >= ₹15,000)
  let profTaxINR = 0;
  if (salary.profTaxINR !== undefined) {
    profTaxINR = salary.profTaxINR;
  } else if (grossEarningsINR >= 15000) {
    profTaxINR = 200;
  }

  const otherDeductionsINR = Math.max(0, salary.otherDeductionsINR || 0);

  // Total Employee Deductions
  const totalDeductions =
    pfEmployeeINR + esiEmployeeINR + profTaxINR + lopDeductionINR + otherDeductionsINR;

  // Employer Contributions (Cost to Company, NOT deducted from employee net pay)
  let pfEmployerINR = 0;
  if (salary.pfApplicable !== false) {
    pfEmployerINR = Math.min(1800, Math.round(basicSalaryINR * 0.12));
  }

  let esiEmployerINR = 0;
  if (salary.esiApplicable === true && grossEarningsINR <= 21000) {
    esiEmployerINR = Math.ceil(grossEarningsINR * 0.0325);
  }

  const totalEmployerCostINR = grossEarningsINR + pfEmployerINR + esiEmployerINR;

  // Net Payable
  const netPayableINR = Math.max(0, grossEarningsINR - totalDeductions);

  return {
    calendarDays,
    workingDays,
    presentDays,
    paidLeaveDays,
    lopDays,
    dailyGrossINR,
    basicSalaryINR,
    hraINR,
    conveyanceINR,
    specialAllowanceINR,
    overtimePayINR,
    incentivesINR,
    bonusINR,
    grossEarningsINR,
    pfEmployeeINR,
    esiEmployeeINR,
    profTaxINR,
    lopDeductionINR,
    otherDeductionsINR,
    totalDeductions,
    pfEmployerINR,
    esiEmployerINR,
    totalEmployerCostINR,
    netPayableINR,
  };
}

/**
 * Visual styling token configuration for Payroll Status badges
 */
export function getPayrollStatusConfig(status: PayrollStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "DRAFT":
      return { label: "Draft", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    case "PENDING_REVIEW":
      return { label: "Pending Review", bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
    case "PENDING_APPROVAL":
      return { label: "Awaiting Super Admin", bg: "#FEF3C7", text: "#B45309", border: "#FBBF24" };
    case "APPROVED":
      return { label: "Approved", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
    case "FINALIZED":
      return { label: "Finalized & Locked", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" };
    case "PAID":
      return { label: "Disbursed / Paid", bg: "#DCFCE7", text: "#166534", border: "#86EFAC" };
    case "REOPENED":
      return { label: "Reopened for Correction", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" };
    default:
      return { label: status, bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
  }
}

/**
 * Visual styling token configuration for Payment Status badges
 */
export function getPaymentStatusConfig(status: PaymentStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "NOT_PAID":
      return { label: "Unpaid", bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
    case "PROCESSING":
      return { label: "Processing Bank Transfer", bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" };
    case "PAID":
      return { label: "Paid", bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" };
    case "PARTIALLY_PAID":
      return { label: "Partially Paid", bg: "#FFEDD5", text: "#C2410C", border: "#FDBA74" };
    case "FAILED":
      return { label: "Transfer Failed", bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" };
    default:
      return { label: status, bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
  }
}
