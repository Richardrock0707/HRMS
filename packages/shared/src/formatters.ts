import { VSECURE_CONFIG } from "./constants";

/**
 * Formats any Date or ISO string into DD-MM-YYYY in Asia/Kolkata timezone
 * Example output: "18-10-2026"
 */
export function formatDateDDMMYYYY(dateInput: Date | string | number = new Date()): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "--";
  }

  const parts = new Intl.DateTimeFormat(VSECURE_CONFIG.locale, {
    timeZone: VSECURE_CONFIG.timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "2026";
  return `${day}-${month}-${year}`;
}

/**
 * Formats any Date or ISO string into 12-hour IST time
 * Example output: "09:30 AM"
 */
export function formatTime12HourIST(dateInput: Date | string | number = new Date()): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat(VSECURE_CONFIG.locale, {
    timeZone: VSECURE_CONFIG.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

/**
 * Formats any Date or ISO string into complete Indian standard timestamp
 * Example output: "18-10-2026, 09:30 AM IST"
 */
export function formatDateTimeIST(dateInput: Date | string | number = new Date()): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "--";
  }

  const formattedDate = formatDateDDMMYYYY(date);
  const formattedTime = formatTime12HourIST(date);
  return `${formattedDate}, ${formattedTime} IST`;
}

/**
 * Formats numbers into Indian Rupees (INR) with Lakhs/Crores grouping
 * Example output: "₹45,000" or "₹45,000.00"
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat(VSECURE_CONFIG.locale, {
    style: "currency",
    currency: VSECURE_CONFIG.currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Formats large amounts into Indian Lakhs / Crores for executive dashboards
 * Example: 2500000 -> "₹25.00 Lakh", 15000000 -> "₹1.50 Cr"
 */
export function formatINRExecutive(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0";
  }

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(amount, false);
}
