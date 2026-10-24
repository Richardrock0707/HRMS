"use server";

import { redirect } from "next/navigation";
import { prisma, verifyPassword, hashPassword, isPasswordHashed } from "@vsecure/database";
import { Role, formatDateTimeIST, DEMO_CREDENTIALS } from "@vsecure/shared";
import {
  setSessionCookie,
  deleteSessionCookie,
  getSession,
  UserSession,
  ALLOW_DEMO_LOGIN,
} from "@/lib/auth";
import { timingSafeEqual } from "crypto";

const DEMO_PASSWORD = "VSecure@2026";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function loginAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const identifier = formData.get("identifier")?.toString().trim();
  const password = formData.get("password")?.toString();
  const deviceId = formData.get("deviceId")?.toString().trim() || null;
  const deviceModel = formData.get("deviceModel")?.toString().trim() || null;

  if (!identifier || !password) {
    return { error: "Please enter your Email or Employee ID (e.g. VS-001) and password." };
  }

  // Look up employee by Email OR by Employee Code
  let employee = null;
  let dbUnavailable = false;
  try {
    employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { employeeCode: { equals: identifier.toUpperCase() } },
        ],
      },
      include: {
        department: true,
      },
    });
  } catch (dbErr) {
    dbUnavailable = true;
    console.error("Database connection error in loginAction:", dbErr);
  }

  // Demo-only fallback: works ONLY outside production (or if ALLOW_DEMO_LOGIN=true),
  // only when the database has no such user, and only with the exact demo password.
  if (!employee) {
    if (ALLOW_DEMO_LOGIN) {
      const demo = DEMO_CREDENTIALS.find(
        (d) =>
          d.email.toLowerCase() === identifier.toLowerCase() ||
          d.code.toUpperCase() === identifier.toUpperCase()
      );

      if (demo && safeEqual(password, DEMO_PASSWORD)) {
        const session: UserSession = {
          id: `demo_${demo.code.toLowerCase()}`,
          employeeCode: demo.code,
          email: demo.email,
          fullName: demo.name,
          role: demo.role,
          departmentId: demo.role === "HR_ADMIN" ? "dept_hr" : "dept_eng",
          departmentName: demo.role === "HR_ADMIN" ? "People & HR" : "Engineering & Architecture",
          designation: demo.title,
          boundDeviceId: `android_${demo.code.toLowerCase()}_handset`,
          deviceModel: "Google Pixel 9 Pro",
          lastLoginIST: formatDateTimeIST(new Date()),
          issuedAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        await setSessionCookie(session);
        redirect("/");
      }
    }

    if (dbUnavailable) {
      return { error: "Service temporarily unavailable. Please try again shortly." };
    }
    // Same message for unknown user and wrong password (no account enumeration)
    return { error: "Invalid credentials." };
  }

  // Check account status
  if (employee.status === "TERMINATED" || employee.status === "INACTIVE") {
    return { error: "This employee account is inactive. Please contact your administrator." };
  }

  // Password verification
  let passwordOk = false;
  if (isPasswordHashed(employee.passwordHash)) {
    passwordOk = verifyPassword(password, employee.passwordHash);
  } else if (safeEqual(password, employee.passwordHash)) {
    // Legacy plain-text value: accept once, then upgrade to a scrypt hash
    passwordOk = true;
    await prisma.employee.update({
      where: { id: employee.id },
      data: { passwordHash: hashPassword(password) },
    });
  }
  if (!passwordOk) {
    return { error: "Invalid credentials." };
  }

  // Hardware Device Binding Check (for Android mobile sign-ins)
  if (deviceId) {
    if (!employee.boundDeviceId) {
      // First-time device binding
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          boundDeviceId: deviceId,
          deviceModel: deviceModel || "Android Device",
          deviceBoundAt: new Date(),
          lastLoginAt: new Date(),
        },
      });
    } else if (employee.boundDeviceId !== deviceId) {
      // Hardware Device Mismatch -> Block buddy-punching & request approval
      return {
        error: `Device Mismatch Error: This account is hardware-locked to ${
          employee.deviceModel || "another Android device"
        }. A Device Change Request must be submitted to Admin Vishnu.`,
        deviceMismatch: true,
        boundDeviceId: employee.boundDeviceId,
        attemptedDeviceId: deviceId,
      };
    }
  }

  // Create session
  const session: UserSession = {
    id: employee.id,
    employeeCode: employee.employeeCode,
    email: employee.email,
    fullName: employee.fullName,
    role: employee.role as Role,
    departmentId: employee.departmentId,
    departmentName: employee.department?.name,
    designation: employee.designation,
    boundDeviceId: employee.boundDeviceId,
    deviceModel: employee.deviceModel,
    lastLoginIST: formatDateTimeIST(new Date()),
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  await setSessionCookie(session);
  redirect("/");
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect("/login");
}

export async function switchDemoUserAction(role: Role) {
  if (!ALLOW_DEMO_LOGIN) {
    redirect("/login");
  }
  const demo = DEMO_CREDENTIALS.find((d) => d.role === role) || DEMO_CREDENTIALS[0];

  const session: UserSession = {
    id: `demo_${demo.code.toLowerCase()}`,
    employeeCode: demo.code,
    email: demo.email,
    fullName: demo.name,
    role: demo.role,
    departmentId: demo.role === "HR_ADMIN" ? "dept_hr" : "dept_eng",
    departmentName: demo.role === "HR_ADMIN" ? "People & HR" : "Engineering & Architecture",
    designation: demo.title,
    boundDeviceId: `android_${demo.code.toLowerCase()}_handset`,
    deviceModel: "Android Enterprise Handset",
    lastLoginIST: formatDateTimeIST(new Date()),
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  await setSessionCookie(session);
  redirect("/");
}

/**
 * Android Device Binding Reset Request
 */
export async function submitDeviceChangeRequestAction(formData: FormData) {
  const employeeCode = formData.get("employeeCode")?.toString().trim().toUpperCase();
  const newDeviceId = formData.get("newDeviceId")?.toString().trim();
  const newDeviceModel = formData.get("newDeviceModel")?.toString().trim();
  const reason = formData.get("reason")?.toString().trim();

  if (!employeeCode || !newDeviceId || !newDeviceModel || !reason) {
    return { error: "All device change request fields are required." };
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (!employee) {
      return { error: `Employee code ${employeeCode} not found in directory.` };
    }

    await prisma.deviceChangeRequest.create({
      data: {
        employeeId: employee.id,
        oldDeviceId: employee.boundDeviceId,
        newDeviceId,
        newDeviceModel,
        reason,
        status: "PENDING",
      },
    });

    return {
      success: true,
      message: "Device Change Request submitted. Administrator Vishnu will review and approve.",
    };
  } catch (error) {
    console.error("Error creating device change request:", error);
    return {
      error: "Could not record the request right now. Please try again or contact your administrator.",
    };
  }
}
