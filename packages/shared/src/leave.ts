/**
 * VSecure Technologies HRMS - Centralized Leave Management Engine
 * Asia/Kolkata (IST), DD-MM-YYYY Date Parsing, Working Days & Holiday Math
 */

import { LeaveType, ApprovalStatus, LeaveSession } from "./types";
import { DEFAULT_2026_HOLIDAYS } from "./constants";

export interface LeaveCalculationOptions {
  startDate: string; // DD-MM-YYYY
  endDate: string;   // DD-MM-YYYY
  isHalfDay?: boolean;
  halfDaySession?: LeaveSession;
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  holidays?: readonly { date: string; name?: string }[];
}

export interface LeaveCalculationResult {
  totalDays: number;
  eligibleWorkingDays: number;
  weekendDays: number;
  holidayDays: number;
  dateList: string[]; // DD-MM-YYYY array
  breakdown: Array<{
    date: string;
    dayOfWeek: string;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
    deduction: number; // 0, 0.5, or 1.0
  }>;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Parses a DD-MM-YYYY string into a Date object at 00:00:00 IST
 */
export function parseDateDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (year < 2000 || year > 2100) return null;
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month, day, 0, 0, 0, 0);
  // Verify date didn't overflow (e.g. Feb 31)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Formats a Date object into DD-MM-YYYY string
 */
export function formatToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Returns true if the date is Saturday (6) or Sunday (0)
 */
export function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Day name in English for given date
 */
export function getDayName(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

/**
 * Centralized Leave Duration & Deductible Working Days Engine
 * Considers start date, end date, half-day request, weekend exclusions, and company holidays.
 */
export function calculateLeaveDuration(options: LeaveCalculationOptions): LeaveCalculationResult {
  const {
    startDate,
    endDate,
    isHalfDay = false,
    excludeWeekends = true,
    excludeHolidays = true,
    holidays = DEFAULT_2026_HOLIDAYS,
  } = options;

  const start = parseDateDDMMYYYY(startDate);
  const end = parseDateDDMMYYYY(endDate);

  if (!start) {
    return {
      totalDays: 0,
      eligibleWorkingDays: 0,
      weekendDays: 0,
      holidayDays: 0,
      dateList: [],
      breakdown: [],
      isValid: false,
      errorMessage: `Invalid start date: ${startDate}. Expected DD-MM-YYYY format.`,
    };
  }

  if (!end) {
    return {
      totalDays: 0,
      eligibleWorkingDays: 0,
      weekendDays: 0,
      holidayDays: 0,
      dateList: [],
      breakdown: [],
      isValid: false,
      errorMessage: `Invalid end date: ${endDate}. Expected DD-MM-YYYY format.`,
    };
  }

  if (start.getTime() > end.getTime()) {
    return {
      totalDays: 0,
      eligibleWorkingDays: 0,
      weekendDays: 0,
      holidayDays: 0,
      dateList: [],
      breakdown: [],
      isValid: false,
      errorMessage: "Start date cannot be after end date.",
    };
  }

  if (isHalfDay && startDate !== endDate) {
    return {
      totalDays: 0,
      eligibleWorkingDays: 0,
      weekendDays: 0,
      holidayDays: 0,
      dateList: [],
      breakdown: [],
      isValid: false,
      errorMessage: "Half-day leave requests can only be applied for a single calendar day.",
    };
  }

  const holidayMap = new Map<string, string>();
  for (const h of holidays) {
    holidayMap.set(h.date, h.name || "Public Holiday");
  }

  let totalDays = 0;
  let eligibleWorkingDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  const dateList: string[] = [];
  const breakdown: LeaveCalculationResult["breakdown"] = [];

  const current = new Date(start.getTime());

  while (current.getTime() <= end.getTime()) {
    const dateFormatted = formatToDDMMYYYY(current);
    dateList.push(dateFormatted);

    const isWknd = isWeekendDay(current);
    const holidayName = holidayMap.get(dateFormatted);
    const isHol = !!holidayName;

    let deduction = 0;

    if (isWknd && excludeWeekends) {
      weekendDays++;
      deduction = 0;
    } else if (isHol && excludeHolidays) {
      holidayDays++;
      deduction = 0;
    } else {
      eligibleWorkingDays++;
      deduction = isHalfDay ? 0.5 : 1.0;
      totalDays += deduction;
    }

    breakdown.push({
      date: dateFormatted,
      dayOfWeek: getDayName(current),
      isWeekend: isWknd,
      isHoliday: isHol,
      holidayName,
      deduction,
    });

    // Advance 1 day safely
    current.setDate(current.getDate() + 1);
  }

  return {
    totalDays: Number(totalDays.toFixed(2)),
    eligibleWorkingDays,
    weekendDays,
    holidayDays,
    dateList,
    breakdown,
    isValid: true,
  };
}

/**
 * Checks whether a proposed leave date range conflicts with existing approved or pending leaves
 */
export function detectLeaveConflicts(
  existingLeaves: Array<{
    id?: string;
    referenceId?: string;
    startDate: string;
    endDate: string;
    status: ApprovalStatus | string;
    isHalfDay?: boolean;
    halfDaySession?: string | null;
  }>,
  newStartDate: string,
  newEndDate: string,
  newIsHalfDay = false,
  newHalfDaySession?: string | null,
  excludeRequestId?: string
): { hasConflict: boolean; conflictingLeave?: any; reason?: string } {
  const newStart = parseDateDDMMYYYY(newStartDate);
  const newEnd = parseDateDDMMYYYY(newEndDate);

  if (!newStart || !newEnd) {
    return { hasConflict: false };
  }

  for (const leave of existingLeaves) {
    // Ignore cancelled or rejected leaves, and ignore self when editing
    if (leave.status === "REJECTED" || leave.status === "CANCELLED") continue;
    if (excludeRequestId && leave.id === excludeRequestId) continue;

    const existStart = parseDateDDMMYYYY(leave.startDate);
    const existEnd = parseDateDDMMYYYY(leave.endDate);

    if (!existStart || !existEnd) continue;

    // Standard interval overlap check: [startA <= endB] and [endA >= startB]
    const overlaps = newStart.getTime() <= existEnd.getTime() && newEnd.getTime() >= existStart.getTime();

    if (overlaps) {
      // If both are half-days on the exact same date with different sessions, they might co-exist
      if (
        newIsHalfDay &&
        leave.isHalfDay &&
        newStartDate === leave.startDate &&
        newHalfDaySession &&
        leave.halfDaySession &&
        newHalfDaySession !== leave.halfDaySession
      ) {
        // First half and second half can co-exist on the same date!
        continue;
      }

      return {
        hasConflict: true,
        conflictingLeave: leave,
        reason: `Overlaps with ${leave.status === "APPROVED" ? "approved" : "pending"} leave request (${leave.referenceId || leave.id}) from ${leave.startDate} to ${leave.endDate}.`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Visual badge metadata for Leave Types
 */
export function getLeaveTypeBadge(type: LeaveType): {
  label: string;
  code: string;
  badgeClass: string;
  isPaid: boolean;
  desc: string;
} {
  switch (type) {
    case "CASUAL":
      return {
        label: "Casual Leave",
        code: "CL",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
        isPaid: true,
        desc: "Personal errands and unplanned needs",
      };
    case "SICK":
      return {
        label: "Sick Leave",
        code: "SL",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        isPaid: true,
        desc: "Medical ailments and health recovery",
      };
    case "EARNED":
      return {
        label: "Earned Leave",
        code: "EL",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        isPaid: true,
        desc: "Planned vacations & privilege leave",
      };
    case "UNPAID_LOP":
      return {
        label: "Loss of Pay",
        code: "LOP",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        isPaid: false,
        desc: "Unpaid absence deducted in Payroll",
      };
    case "COMP_OFF":
      return {
        label: "Compensatory Off",
        code: "COMP",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        isPaid: true,
        desc: "Credited for weekend / holiday work",
      };
  }
}

/**
 * Visual badge metadata for Leave Approval Status
 */
export function getLeaveApprovalBadge(status: ApprovalStatus | string): {
  label: string;
  badgeClass: string;
  iconName: string;
} {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200",
        iconName: "check-circle",
      };
    case "PENDING":
      return {
        label: "Pending Approval",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200",
        iconName: "clock",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-200",
        iconName: "x-circle",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        iconName: "slash",
      };
    default:
      return {
        label: String(status),
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        iconName: "help-circle",
      };
  }
}
