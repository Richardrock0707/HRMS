/**
 * VSecure Technologies HRMS - Spacing & Elevation Tokens
 */

export const spacing = {
  0: "0px",
  1: "0.25rem", // 4px
  2: "0.5rem",  // 8px
  3: "0.75rem", // 12px
  4: "1rem",    // 16px
  5: "1.25rem", // 20px
  6: "1.5rem",  // 24px
  8: "2rem",    // 32px
  10: "2.5rem", // 40px
  12: "3rem",   // 48px
  16: "4rem",   // 64px
} as const;

export const borderRadius = {
  none: "0px",
  sm: "0.25rem",  // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem",   // 8px
  xl: "0.75rem",  // 12px
  "2xl": "1rem",  // 16px
  full: "9999px",
} as const;

export const shadows = {
  none: "none",
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  card: "0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
  elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
  dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
} as const;
