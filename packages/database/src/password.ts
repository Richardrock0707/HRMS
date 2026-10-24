import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Password hashing using Node's built-in scrypt (no extra dependency).
 * Stored format: scrypt$<salt base64url>$<hash base64url>
 * Server-side only. Do not import this from the mobile app.
 */
const PREFIX = "scrypt";
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `${PREFIX}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function isPasswordHashed(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!isPasswordHashed(stored)) return false;
  try {
    const [, saltB64, hashB64] = stored.split("$");
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");
    const actual = scryptSync(password, salt, expected.length, SCRYPT_OPTIONS);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
