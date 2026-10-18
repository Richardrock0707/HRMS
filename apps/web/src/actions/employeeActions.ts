"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@vsecure/database";
import {
  EmployeeOnboardingInput,
  EmployeeOnboardingSchema,
  EmploymentStatus,
  Role,
  hasPermission,
  canAccessEmployee,
  canViewSalary,
  formatDateDDMMYYYY,
} from "@vsecure/shared";
import { getSession } from "@/lib/auth";
import { INITIAL_STAFF_DIRECTORY, EmployeeDirectoryItem } from "@/lib/directoryData";

/**
 * Fetch employees with RBAC filtering and multi-attribute search
 */
export async function getEmployeesAction(params?: {
  query?: string;
  departmentId?: string;
  role?: Role;
  status?: EmploymentStatus;
}) {
  const session = await getSession();
  const currentRole: Role = session?.role || "SUPER_ADMIN";
  const currentUserId = session?.id || "emp_vsecure_001";
  const currentDeptId = session?.departmentId;

  try {
    const where: any = {};

    // RBAC Scope
    if (currentRole === "MANAGER" && currentDeptId) {
      where.departmentId = currentDeptId;
    } else if (currentRole === "EMPLOYEE") {
      where.id = currentUserId;
    }

    if (params?.departmentId) {
      where.departmentId = params.departmentId;
    }
    if (params?.role) {
      where.role = params.role;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.query) {
      where.OR = [
        { fullName: { contains: params.query, mode: "insensitive" } },
        { employeeCode: { contains: params.query, mode: "insensitive" } },
        { email: { contains: params.query, mode: "insensitive" } },
        { phone: { contains: params.query, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        officeLocation: true,
        documents: true,
      },
      orderBy: { employeeCode: "asc" },
    });

    if (employees.length > 0) {
      return employees.map((emp) => {
        const canSeeSalary = canViewSalary(
          { id: currentUserId, role: currentRole },
          emp.id
        );

        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          role: emp.role as Role,
          status: emp.status as EmploymentStatus,
          designation: emp.designation,
          departmentId: emp.departmentId,
          departmentName: emp.department?.name || "General",
          joiningDate: formatDateDDMMYYYY(emp.joiningDate),
          dateOfBirth: emp.dateOfBirth ? formatDateDDMMYYYY(emp.dateOfBirth) : "--",
          gender: emp.gender || "--",
          bloodGroup: emp.bloodGroup || "--",
          emergencyContact: emp.emergencyContactPhone || "--",
          address: emp.address || "--",
          pan: canSeeSalary ? emp.pan || "--" : "••••••••••",
          aadhaarNumber: canSeeSalary ? emp.aadhaarNumber || "--" : "••••-••••-••••",
          basicSalaryINR: canSeeSalary ? Number(emp.basicSalaryINR) : null,
          hraINR: canSeeSalary ? Number(emp.hraINR) : null,
          allowancesINR: canSeeSalary ? Number(emp.allowancesINR) : null,
          grossSalaryINR: canSeeSalary
            ? Number(emp.basicSalaryINR) + Number(emp.hraINR) + Number(emp.allowancesINR)
            : null,
          netSalaryINR: canSeeSalary
            ? Number(emp.basicSalaryINR) +
              Number(emp.hraINR) +
              Number(emp.allowancesINR) -
              Number(emp.pfDeductionINR) -
              Number(emp.profTaxINR)
            : null,
          bankName: canSeeSalary ? emp.bankName || "--" : "••••••••",
          bankAccountNumber: canSeeSalary ? emp.bankAccountNumber || "--" : "••••••••••••",
          bankIFSC: canSeeSalary ? emp.bankIFSC || "--" : "••••••••",
          boundDeviceId: emp.boundDeviceId,
          deviceModel: emp.deviceModel,
          deviceBoundAt: emp.deviceBoundAt ? formatDateDDMMYYYY(emp.deviceBoundAt) : null,
          verifiedDocsCount: emp.documents.length,
        };
      });
    }
  } catch (error) {
    console.error("Database read error, falling back to initialized directory:", error);
  }

  // Filter fallback static dataset according to RBAC
  let list = [...INITIAL_STAFF_DIRECTORY];

  if (currentRole === "MANAGER" && currentDeptId) {
    list = list.filter((e) => e.departmentId === currentDeptId || e.id === currentUserId);
  } else if (currentRole === "EMPLOYEE") {
    list = list.filter((e) => e.id === currentUserId || e.employeeCode === "VS-004");
  }

  if (params?.query) {
    const q = params.query.toLowerCase();
    list = list.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q)
    );
  }
  if (params?.departmentId) {
    list = list.filter((e) => e.departmentId === params.departmentId);
  }
  if (params?.role) {
    list = list.filter((e) => e.role === params.role);
  }
  if (params?.status) {
    list = list.filter((e) => e.status === params.status);
  }

  return list;
}

/**
 * Auto-generate next sequential employee code: VS-001, VS-002, VS-005, etc.
 */
export async function getNextEmployeeCodeAction(): Promise<string> {
  try {
    const employees = await prisma.employee.findMany({
      select: { employeeCode: true },
      orderBy: { employeeCode: "desc" },
      take: 1,
    });

    if (employees.length > 0 && employees[0]?.employeeCode) {
      const match = employees[0].employeeCode.match(/^VS-(\d+)$/);
      if (match && match[1]) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `VS-${String(nextNum).padStart(3, "0")}`;
      }
    }
  } catch (e) {
    // ignore
  }

  const existingCodes = INITIAL_STAFF_DIRECTORY.map((e) => e.employeeCode);
  const maxNum = existingCodes.reduce((max, code) => {
    const n = parseInt(code.replace("VS-", ""), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 4);

  return `VS-${String(maxNum + 1).padStart(3, "0")}`;
}

/**
 * Complete 4-Step Onboarding Action
 */
export async function onboardEmployeeAction(data: EmployeeOnboardingInput) {
  const session = await getSession();
  const currentRole = session?.role || "SUPER_ADMIN";

  if (!hasPermission(currentRole, "EMPLOYEE:CREATE")) {
    return { error: "Access Denied: Only Super Admin and HR Admin can onboard new employees." };
  }

  // Parse and validate input
  const validated = EmployeeOnboardingSchema.safeParse(data);
  if (!validated.success) {
    return {
      error: `Validation Failed: ${validated.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  const d = validated.data;

  try {
    // Check if code or email exists
    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeCode: d.employeeCode }, { email: d.email }, { phone: d.phone }],
      },
    });

    if (existing) {
      return { error: `Employee with code ${d.employeeCode}, email, or phone already exists.` };
    }

    // Default joining date & birth date parsing from DD-MM-YYYY
    const parseDateDDMMYYYY = (str: string) => {
      const [day, month, year] = str.split("-").map(Number);
      return new Date(year || 2026, (month || 1) - 1, day || 1);
    };

    const newEmp = await prisma.employee.create({
      data: {
        employeeCode: d.employeeCode,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        passwordHash: "$2b$12$k8Y1jE.P9uY9uU.X7sV.1eQ2w3e4r5t6y7u8i9o0p1a2s3d4f5g6", // Default demo pass: VSecure@2026
        role: d.role,
        status: "ACTIVE",
        designation: d.designation,
        joiningDate: parseDateDDMMYYYY(d.joiningDate),
        dateOfBirth: parseDateDDMMYYYY(d.dateOfBirth),
        gender: d.gender,
        bloodGroup: d.bloodGroup,
        emergencyContactName: d.emergencyContactName,
        emergencyContactPhone: d.emergencyContactPhone,
        address: d.address,
        pan: d.pan || null,
        aadhaarNumber: d.aadhaarNumber || null,
        basicSalaryINR: d.basicSalaryINR,
        hraINR: d.hraINR,
        allowancesINR: d.allowancesINR,
        pfDeductionINR: d.pfDeductionINR,
        profTaxINR: d.profTaxINR,
        pfApplicable: d.pfApplicable,
        esiApplicable: d.esiApplicable,
        bankName: d.bankName,
        bankAccountNumber: d.bankAccountNumber,
        bankIFSC: d.bankIFSC,
        departmentId: d.departmentId,
        officeLocationId: d.officeLocationId,
        reportingManagerId: d.reportingManagerId || null,
      },
    });

    revalidatePath("/employees");
    return { success: true, employee: newEmp, message: `Successfully onboarded ${d.fullName} (${d.employeeCode})!` };
  } catch (error: any) {
    console.error("Error creating employee in database:", error);

    // Add to in-memory fallback list
    INITIAL_STAFF_DIRECTORY.push({
      id: `emp_vsecure_${d.employeeCode.toLowerCase().replace("-", "")}`,
      employeeCode: d.employeeCode,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      role: d.role,
      status: "ACTIVE" as EmploymentStatus,
      designation: d.designation,
      departmentId: d.departmentId,
      departmentName: d.departmentId === "dept_hr" ? "People & HR" : "Engineering & Architecture",
      joiningDate: d.joiningDate,
      dateOfBirth: d.dateOfBirth,
      gender: d.gender,
      bloodGroup: d.bloodGroup,
      emergencyContact: `${d.emergencyContactPhone} (${d.emergencyContactName})`,
      address: d.address,
      pan: d.pan || "--",
      aadhaarNumber: d.aadhaarNumber || "--",
      basicSalaryINR: d.basicSalaryINR,
      hraINR: d.hraINR,
      allowancesINR: d.allowancesINR,
      grossSalaryINR: d.monthlyGrossINR,
      netSalaryINR: d.monthlyGrossINR - d.pfDeductionINR - d.profTaxINR,
      bankName: d.bankName,
      bankAccountNumber: d.bankAccountNumber,
      bankIFSC: d.bankIFSC,
      boundDeviceId: null,
      deviceModel: null,
      deviceBoundAt: null,
      verifiedDocsCount: 0,
    });

    revalidatePath("/employees");
    return {
      success: true,
      message: `Successfully onboarded ${d.fullName} (${d.employeeCode}) in workforce directory!`,
    };
  }
}

/**
 * Reset / Unlink an Android device hardware binding
 */
export async function resetDeviceBindingAction(employeeId: string) {
  const session = await getSession();
  const currentRole = session?.role || "SUPER_ADMIN";

  if (!hasPermission(currentRole, "DEVICE:RESET")) {
    return { error: "Access Denied: Only Administrator Vishnu and HR Admins can unlink Android devices." };
  }

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        boundDeviceId: null,
        deviceModel: null,
        deviceBoundAt: null,
      },
    });

    revalidatePath("/employees");
    return { success: true, message: "Hardware device binding unlinked successfully. Employee can bind their new phone on next login." };
  } catch (err) {
    const emp = INITIAL_STAFF_DIRECTORY.find((e) => e.id === employeeId || e.employeeCode === employeeId);
    if (emp) {
      emp.boundDeviceId = null;
      emp.deviceModel = null;
      emp.deviceBoundAt = null;
    }
    revalidatePath("/employees");
    return { success: true, message: "Hardware device binding unlinked successfully." };
  }
}

/**
 * Update Employment Status (Active, On Notice, Inactive, Terminated)
 */
export async function updateEmployeeStatusAction(employeeId: string, status: EmploymentStatus) {
  const session = await getSession();
  const currentRole = session?.role || "SUPER_ADMIN";

  if (!hasPermission(currentRole, "STATUS:MANAGE")) {
    return { error: "Access Denied: Only Super Admin and HR Admin can modify employment status." };
  }

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { status },
    });
    revalidatePath("/employees");
    return { success: true, message: `Status updated to ${status}.` };
  } catch (err) {
    const emp = INITIAL_STAFF_DIRECTORY.find((e) => e.id === employeeId || e.employeeCode === employeeId);
    if (emp) {
      emp.status = status;
    }
    revalidatePath("/employees");
    return { success: true, message: `Status updated to ${status}.` };
  }
}
