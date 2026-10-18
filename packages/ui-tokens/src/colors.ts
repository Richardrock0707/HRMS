/**
 * VSecure Technologies HRMS - Strict Modern White-Theme Color Tokens
 * Light mode forced across Web & Android. Dark mode disabled.
 */

export const colors = {
  // Pure White Surface & Canvas Tokens
  surface: {
    primary: "#FFFFFF", // Pure White
    subtle: "#F8FAFC",  // Slate 50 (App Canvas / Sidebar / Card Backdrop)
    elevated: "#F1F5F9",// Slate 100 (Hover & Subtle Fill)
    card: "#FFFFFF",
    modal: "#FFFFFF",
  },

  // Crisp Hairline Borders & Dividers
  border: {
    hairline: "#E2E8F0", // Slate 200 (1px solid crisp border)
    subtle: "#F1F5F9",   // Slate 100
    strong: "#CBD5E1",   // Slate 300
    focus: "#2563EB",    // Royal Blue 600
  },

  // High-Contrast Enterprise Typography Tokens
  text: {
    primary: "#0F172A",   // Slate 900 (Headings, primary text)
    secondary: "#334155", // Slate 700 (Body text, labels)
    muted: "#64748B",     // Slate 500 (Timestamps, metadata, hints)
    inverse: "#FFFFFF",   // White text on dark buttons
    disabled: "#94A3B8",  // Slate 400
  },

  // Primary Brand Accent: VSecure Royal Blue
  brand: {
    50: "#EFF6FF",   // Soft active pill / badge background
    100: "#DBEAFE",  // Soft hover accent
    200: "#BFDBFE",
    500: "#3B82F6",
    600: "#2563EB",  // Primary brand accent button / active indicator
    700: "#1D4ED8",  // Hover state
    800: "#1E40AF",  // Active press state
    900: "#1E3A8A",
  },

  // Semantic Status Tokens (Indian Enterprise HR Standard)
  status: {
    present: {
      text: "#16A34A",       // Green 600
      background: "#F0FDF4", // Green 50
      border: "#BBF7D0",     // Green 200
    },
    late: {
      text: "#D97706",       // Amber 600
      background: "#FFFBEB", // Amber 50
      border: "#FDE68A",     // Amber 200
    },
    absent: {
      text: "#DC2626",       // Red 600
      background: "#FEF2F2", // Red 50
      border: "#FECACA",     // Red 200
    },
    halfDay: {
      text: "#EA580C",       // Orange 600
      background: "#FFF7ED", // Orange 50
      border: "#FED7AA",     // Orange 200
    },
    onLeave: {
      text: "#7C3AED",       // Violet 600
      background: "#F5F3FF", // Violet 50
      border: "#DDD6FE",     // Violet 200
    },
    fieldDuty: {
      text: "#0284C7",       // Sky 600
      background: "#F0F9FF", // Sky 50
      border: "#BAE6FD",     // Sky 200
    },
    pending: {
      text: "#D97706",
      background: "#FFFBEB",
      border: "#FDE68A",
    },
    approved: {
      text: "#16A34A",
      background: "#F0FDF4",
      border: "#BBF7D0",
    },
    rejected: {
      text: "#DC2626",
      background: "#FEF2F2",
      border: "#FECACA",
    },
  },
} as const;

export type Colors = typeof colors;
