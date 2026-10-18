import { cookies } from "next/headers";
import crypto from "crypto";
import { Role } from "@vsecure/shared";

export interface UserSession {
  id: string;
  employeeCode: string;
  email: string;
  fullName: string;
  role: Role;
  departmentId: string;
  departmentName?: string;
  designation?: string;
  boundDeviceId?: string | null;
  deviceModel?: string | null;
  lastLoginIST?: string;
  issuedAt: number;
  expiresAt: number;
}

const COOKIE_NAME = "vsecure_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "vsecure-enterprise-hrms-session-secret-key-32chars!";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Encrypts and signs session data into an HTTP-only secure cookie payload
 */
export function encryptSession(session: UserSession): string {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(SESSION_SECRET).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const payload = JSON.stringify(session);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

/**
 * Decrypts and verifies the session token
 */
export function decryptSession(token: string): UserSession | null {
  try {
    const buffer = Buffer.from(token, "base64url");
    if (buffer.length < 28) return null; // 12 iv + 16 tag + ciphertext

    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const key = crypto.createHash("sha256").update(SESSION_SECRET).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const session = JSON.parse(decrypted.toString("utf8")) as UserSession;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Server-side helper to read the current authenticated session
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
}

/**
 * Sets the encrypted session cookie with strict security flags
 */
export async function setSessionCookie(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const token = encryptSession(session);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

/**
 * Clears the session cookie on logout
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
