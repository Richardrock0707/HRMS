/**
 * VSecure Technologies HRMS - Production Environment Variable Validator
 * Validates critical environment variables at startup and halts with actionable diagnostics if malformed.
 */

import { z } from "@vsecure/shared";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL must be specified"),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_TIMEZONE: z.string().default("Asia/Kolkata"),
  NEXT_PUBLIC_CURRENCY: z.string().default("INR"),
  NEXT_PUBLIC_LOCALE: z.string().default("en-IN"),
  SUPER_ADMIN_CODE: z.string().default("VS-001"),
  SUPER_ADMIN_EMAIL: z.string().email().default("vishnu@vsecuretechnologies.com"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.string().optional().default("3000"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e: { path: (string | number)[]; message: string }) => ` - ${e.path.join(".")}: ${e.message}`)
      .join("\n");

    const message = `[FATAL] VSecure HRMS Production Environment Configuration Failure:\n${errorDetails}\n\nPlease verify your .env.production file.`;
    console.error(message);

    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
  }

  return (result.success ? result.data : process.env) as EnvConfig;
}

export const env = validateEnv();
