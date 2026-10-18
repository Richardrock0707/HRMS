/**
 * VSecure Technologies HRMS - Production Structured Logger
 * 
 * Enforces:
 * 1. Asia/Kolkata (IST) ISO timestamps
 * 2. Automated PII & Confidential Data Sanitization (Bank Accounts, Aadhaar, Passwords, PINs, Tokens)
 * 3. Log Levels: INFO, WARN, ERROR, SECURITY_AUDIT
 */

import { formatDateDDMMYYYY, formatTime12HourIST } from "@vsecure/shared";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY_AUDIT";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Deep sanitization function to scrub PII before writing to stdout/log streams
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Check if looks like a 12-digit Aadhaar number
    if (/^\d{12}$/.test(data.replace(/\s+/g, ""))) {
      return `•••• •••• ${data.slice(-4)}`;
    }
    // Check if looks like a bank account (9 to 18 digits)
    if (/^\d{9,18}$/.test(data.replace(/\s+/g, ""))) {
      return `••••••••${data.slice(-4)}`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Redact passwords, hashes, tokens completely
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("hash") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("cookie") ||
        lowerKey.includes("pin")
      ) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      // Mask bank account numbers
      if (lowerKey.includes("account") || lowerKey.includes("bankaccount")) {
        if (typeof value === "string") {
          const trimmed = value.replace(/\s+/g, "");
          sanitized[key] = trimmed.length > 4 ? `••••••••${trimmed.slice(-4)}` : "••••";
        } else {
          sanitized[key] = "[MASKED_ACCOUNT]";
        }
        continue;
      }

      // Mask Aadhaar numbers
      if (lowerKey.includes("aadhaar") || lowerKey.includes("uidai")) {
        if (typeof value === "string") {
          const trimmed = value.replace(/\s+/g, "");
          sanitized[key] = trimmed.length > 4 ? `•••• •••• ${trimmed.slice(-4)}` : "••••";
        } else {
          sanitized[key] = "[MASKED_AADHAAR]";
        }
        continue;
      }

      // Recursively sanitize nested objects
      sanitized[key] = sanitizeLogData(value);
    }

    return sanitized;
  }

  return data;
}

function createLog(level: LogLevel, message: string, context?: Record<string, any>, err?: any): LogEntry {
  const now = new Date();
  const entry: LogEntry = {
    timestamp: `${formatDateDDMMYYYY(now)} ${formatTime12HourIST(now)} IST`,
    level,
    message,
  };

  if (context) {
    entry.context = sanitizeLogData(context);
  }

  if (err) {
    entry.error = {
      name: err.name || "Error",
      message: err.message || String(err),
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }

  return entry;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    const entry = createLog("INFO", message, context);
    console.log(JSON.stringify(entry));
  },

  warn(message: string, context?: Record<string, any>) {
    const entry = createLog("WARN", message, context);
    console.warn(JSON.stringify(entry));
  },

  error(message: string, error?: any, context?: Record<string, any>) {
    const entry = createLog("ERROR", message, context, error);
    console.error(JSON.stringify(entry));
  },

  securityAudit(event: string, actor: { id: string; code?: string; role: string }, context?: Record<string, any>) {
    const entry = createLog("SECURITY_AUDIT", `[SECURITY] ${event}`, {
      actor: {
        id: actor.id,
        code: actor.code,
        role: actor.role,
      },
      ...context,
    });
    console.log(JSON.stringify(entry));
  },
};
