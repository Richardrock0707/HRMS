"use server";

import { redirect } from "next/navigation";
import { prisma } from "@vsecure/database";
import { Role, formatDateTimeIST, DEMO_CREDENTIALS } from "@vsecure/shared";
import { setSessionCookie, deleteSessionCookie, getSession, UserSession } from "@/lib/auth";

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
    console.error("Database connection error in loginAction:", dbErr);
    // In local dev without live PG, check fallback demo user
  }

  // Fallback demo user if database is offline or not yet seeded
  if (!employee) {
    const demo = DEMO_CREDENTIALS.find(
      (d) =>
        d.email.toLowerCase() === identifier.toLowerCase() ||
        d.code.toUpperCase() === identifier.toUpperCase()
    );

    if (demo && (password === "VSecure@2026" || password === "password123" || password.length >= 6)) {
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

    return {
      error: "Invalid credentials. Use 'VS-001' or 'vishnu@vsecuretechnologies.com' with 'VSecure@2026'.",
    };
  }

  // Check account status
  if (employee.status === "TERMINATED" || employee.status === "INACTIVE") {
    return { error: "This employee account is inactive. Please contact Administrator Vishnu." };
  }

  // Password verification (allows standard demo password or stored hash)
  const isDemoPassword = password === "VSecure@2026" || password === "password123";
  if (!isDemoPassword && employee.passwordHash !== password) {
    return { error: "Invalid password. Default demo password is 'VSecure@2026'." };
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
      success: true,
      message: "Demo Request recorded: Pending approval by Administrator Vishnu.",
    };
  }
}
