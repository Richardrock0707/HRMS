"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@vsecure/database";
import {
  PayrollCycleItem,
  PayrollRecordItem,
  PayrollDashboardStats,
  BankTransferExportItem,
  PayrollStatus,
  PaymentStatus,
  LopCalculationBasis,
  calculateEmployeePayroll,
  getDaysInMonth,
  formatDateDDMMYYYY,
  canViewPayslip,
  canApprovePayroll,
  canFinalizePayroll,
  canReopenPayroll,
  canManagePayroll,
  canExportBankTransfer,
  canRecordSalaryPayment,
  UserContext,
} from "@vsecure/shared";
import { getSession } from "@/lib/auth";
import {
  LIVE_PAYROLL_CYCLES,
  LIVE_PAYROLL_RECORDS,
  LIVE_PAYROLL_AUDIT,
  getPayrollDashboardStats,
  updatePayrollCycleStatus,
  recordPaymentForRecord,
  generateBankTransferExport,
} from "@/lib/payrollData";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";

function toUserContext(session: any): UserContext {
  return {
    id: session?.id || "emp_vsecure_001",
    email: session?.email || "vishnu@vsecuretechnologies.com",
    role: session?.role || "SUPER_ADMIN",
    departmentId: session?.departmentId,
    status: "ACTIVE",
  };
}

/**
 * Fetch KPI Summary Stats for Payroll Dashboard
 */
export async function getPayrollDashboardStatsAction(
  month: number = 10,
  year: number = 2026
): Promise<PayrollDashboardStats> {
  const session = await getSession();

  try {
    const cycle = await prisma.payrollCycle.findUnique({
      where: { month_year: { month, year } },
      include: { records: true },
    });

    if (cycle) {
      const records = cycle.records;
      const totalGrossEarningsINR = records.reduce(
        (sum, r) => sum + Number(r.grossEarningsINR),
        0
      );
      const totalEmployeeDeductionsINR = records.reduce(
        (sum, r) => sum + Number(r.totalDeductions),
        0
      );
      const totalEmployerContributionsINR = records.reduce(
        (sum, r) => sum + Number(r.pfEmployerINR) + Number(r.esiEmployerINR),
        0
      );
      const totalNetSalaryPayableINR = records.reduce(
        (sum, r) => sum + Number(r.netPayableINR),
        0
      );

      const pendingReviewCount = records.filter(
        (r) => r.status === "PENDING_REVIEW"
      ).length;
      const pendingApprovalCount = records.filter(
        (r) => r.status === "PENDING_APPROVAL"
      ).length;
      const finalizedCount = records.filter(
        (r) => r.status === "FINALIZED"
      ).length;
      const paidCount = records.filter((r) => r.isPaid || r.status === "PAID").length;
      const exceptionsCount = records.filter(
        (r) => !r.bankAccountNumber || !r.bankIFSC
      ).length;

      return {
        totalActiveEmployees: await prisma.employee.count({
          where: { status: "ACTIVE" },
        }),
        employeesIncluded: records.length,
        totalGrossEarningsINR,
        totalEmployeeDeductionsINR,
        totalEmployerContributionsINR,
        totalNetSalaryPayableINR,
        pendingReviewCount,
        pendingApprovalCount,
        finalizedCount,
        paidCount,
        exceptionsCount,
        currentCycleStatus: cycle.status as PayrollStatus,
        currentCycleId: cycle.id,
      };
    }
  } catch (error) {
    console.warn("DB payroll cycle fetch failed, falling back to in-memory state:", error);
  }

  return getPayrollDashboardStats(month, year);
}

/**
 * Fetch the payroll cycle metadata for a given month and year
 */
export async function getPayrollCycleAction(
  month: number = 10,
  year: number = 2026
): Promise<PayrollCycleItem | null> {
  try {
    const cycle = await prisma.payrollCycle.findUnique({
      where: { month_year: { month, year } },
    });
    if (cycle) {
      return {
        id: cycle.id,
        month: cycle.month,
        year: cycle.year,
        status: cycle.status as PayrollStatus,
        totalEmployees: cycle.totalEmployees,
        totalGrossINR: Number(cycle.totalGrossINR),
        totalDeductionsINR: Number(cycle.totalDeductionsINR),
        totalEmployerContributionsINR: Number(cycle.totalEmployerContributionsINR),
        totalNetPayableINR: Number(cycle.totalNetPayableINR),
        lopCalculationBasis: cycle.lopCalculationBasis as LopCalculationBasis,
        processedBy: cycle.processedBy,
        reviewedBy: cycle.reviewedBy,
        approvedBy: cycle.approvedBy,
        finalizedAt: cycle.finalizedAt ? formatDateDDMMYYYY(cycle.finalizedAt) : null,
        paidAt: cycle.paidAt ? formatDateDDMMYYYY(cycle.paidAt) : null,
        paymentReference: cycle.paymentReference,
        rejectionReason: cycle.rejectionReason,
        notes: cycle.notes,
        createdAt: formatDateDDMMYYYY(cycle.createdAt),
        updatedAt: formatDateDDMMYYYY(cycle.updatedAt),
      };
    }
  } catch (error) {
    console.warn("DB getPayrollCycleAction fallback:", error);
  }

  const cycle = LIVE_PAYROLL_CYCLES.find((c) => c.month === month && c.year === year);
  return cycle || null;
}

/**
 * Fetch payroll records for a month & year, scoped by RBAC
 */
export async function getPayrollRecordsAction(
  month: number = 10,
  year: number = 2026,
  departmentId?: string,
  statusFilter?: string
): Promise<{ success: boolean; data: PayrollRecordItem[]; error?: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  try {
    let whereClause: any = { month, year };

    // Scoped access: Ordinary employees can ONLY view their own records
    if (user.role === "EMPLOYEE" || user.role === "MANAGER") {
      whereClause.employeeId = user.id;
    } else if (departmentId && departmentId !== "ALL") {
      whereClause.employee = { departmentId };
    }

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    const records = await prisma.payrollRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { employee: { employeeCode: "asc" } },
    });

    if (records.length > 0) {
      const items: PayrollRecordItem[] = records.map((r) => ({
        id: r.id,
        payrollCycleId: r.payrollCycleId,
        employeeId: r.employeeId,
        employeeCode: r.employee.employeeCode,
        employeeName: r.employee.fullName,
        email: r.employee.email,
        departmentName: r.employee.department.name,
        designation: r.employee.designation,
        joiningDate: formatDateDDMMYYYY(r.employee.joiningDate),
        month: r.month,
        year: r.year,
        status: r.status as PayrollStatus,
        paymentStatus: r.paymentStatus as PaymentStatus,
        calendarDays: r.calendarDays,
        workingDays: r.workingDays,
        presentDays: r.presentDays,
        lateArrivalDays: r.lateArrivalDays,
        halfDays: r.halfDays,
        paidLeaveDays: r.paidLeaveDays,
        unpaidAbsenceDays: r.unpaidAbsenceDays,
        lopDays: r.lopDays,
        overtimeHours: r.overtimeHours,
        basicSalaryINR: Number(r.basicSalaryINR),
        hraINR: Number(r.hraINR),
        conveyanceINR: Number(r.conveyanceINR),
        specialAllowanceINR: Number(r.specialAllowanceINR),
        overtimePayINR: Number(r.overtimePayINR),
        incentivesINR: Number(r.incentivesINR),
        bonusINR: Number(r.bonusINR),
        grossEarningsINR: Number(r.grossEarningsINR),
        pfEmployeeINR: Number(r.pfEmployeeINR),
        esiEmployeeINR: Number(r.esiEmployeeINR),
        profTaxINR: Number(r.profTaxINR),
        lopDeductionINR: Number(r.lopDeductionINR),
        otherDeductionsINR: Number(r.otherDeductionsINR),
        totalDeductions: Number(r.totalDeductions),
        pfEmployerINR: Number(r.pfEmployerINR),
        esiEmployerINR: Number(r.esiEmployerINR),
        totalEmployerCostINR: Number(r.totalEmployerCostINR),
        netPayableINR: Number(r.netPayableINR),
        isPaid: r.isPaid,
        paidAt: r.paidAt ? formatDateDDMMYYYY(r.paidAt) : null,
        paymentMethod: r.paymentMethod,
        paymentReference: r.paymentReference,
        paidAmountINR: r.paidAmountINR ? Number(r.paidAmountINR) : null,
        paymentRemarks: r.paymentRemarks,
        bankName: r.bankName,
        bankAccountNumber: r.bankAccountNumber,
        bankIFSC: r.bankIFSC,
        payslipPdfUrl: r.payslipPdfUrl,
        payslipNumber: r.payslipNumber,
        processedBy: r.processedBy,
        approvedBy: r.approvedBy,
        rejectionReason: r.rejectionReason,
        createdAt: formatDateDDMMYYYY(r.createdAt),
        updatedAt: formatDateDDMMYYYY(r.updatedAt),
      }));

      return { success: true, data: items };
    }
  } catch (error) {
    console.warn("DB getPayrollRecordsAction fallback:", error);
  }

  // Fallback to in-memory store
  let filtered = LIVE_PAYROLL_RECORDS.filter(
    (r) => r.month === month && r.year === year
  );

  if (user.role === "EMPLOYEE" || user.role === "MANAGER") {
    filtered = filtered.filter(
      (r) => r.employeeId === user.id || r.email === user.email
    );
  }

  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  return { success: true, data: filtered };
}

/**
 * Calculate Monthly Payroll with Attendance & LOP Integration
 */
export async function calculateMonthlyPayrollAction(
  month: number,
  year: number,
  lopBasis: LopCalculationBasis = "CALENDAR_DAYS"
): Promise<{ success: boolean; message: string; cycleId?: string; error?: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canManagePayroll(user)) {
    return {
      success: false,
      message: "Unauthorized: Only Super Admin and HR Admin can calculate payroll.",
      error: "UNAUTHORIZED",
    };
  }

  const calendarDays = getDaysInMonth(month, year);
  const workingDays = 22; // Standard 22 working days per month

  try {
    // Check if finalized
    const existing = await prisma.payrollCycle.findUnique({
      where: { month_year: { month, year } },
    });
    if (existing && existing.status === "FINALIZED") {
      return {
        success: false,
        message: "Cannot recalculate a finalized payroll cycle. Reopen cycle first.",
        error: "LOCKED_FINALIZED",
      };
    }

    // Retrieve active employees
    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: { department: true },
    });

    if (employees.length > 0) {
      // Upsert payroll cycle
      const cycle = await prisma.payrollCycle.upsert({
        where: { month_year: { month, year } },
        update: {
          status: "PENDING_REVIEW",
          lopCalculationBasis: lopBasis,
          processedBy: `${session?.fullName || "HR Admin"} (${session?.role || "HR_ADMIN"})`,
          updatedAt: new Date(),
        },
        create: {
          month,
          year,
          status: "PENDING_REVIEW",
          lopCalculationBasis: lopBasis,
          processedBy: `${session?.fullName || "HR Admin"} (${session?.role || "HR_ADMIN"})`,
        },
      });

      let totalGross = 0;
      let totalDeductions = 0;
      let totalEmployerContributions = 0;
      let totalNet = 0;

      for (const emp of employees) {
        // Query approved unpaid leaves (LOP) in this month
        const unpaidLeaveSum = await prisma.leaveRequest.aggregate({
          where: {
            employeeId: emp.id,
            status: "APPROVED",
            leaveType: "UNPAID_LOP",
            startDate: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0) },
          },
          _sum: { totalDays: true },
        });
        const lopDays = unpaidLeaveSum._sum.totalDays || 0;

        const calc = calculateEmployeePayroll({
          employeeId: emp.id,
          month,
          year,
          calendarDays,
          workingDays,
          presentDays: workingDays - lopDays,
          paidLeaveDays: 0,
          unpaidAbsenceDays: lopDays,
          lopDays,
          lopBasis,
          salary: {
            basicSalaryINR: Number(emp.basicSalaryINR),
            hraINR: Number(emp.hraINR),
            conveyanceINR: 5000,
            specialAllowanceINR: Math.max(0, Number(emp.allowancesINR) - 5000),
            pfApplicable: emp.pfApplicable,
            esiApplicable: emp.esiApplicable,
            profTaxINR: Number(emp.profTaxINR),
          },
        });

        totalGross += calc.grossEarningsINR;
        totalDeductions += calc.totalDeductions;
        totalEmployerContributions += calc.pfEmployerINR + calc.esiEmployerINR;
        totalNet += calc.netPayableINR;

        await prisma.payrollRecord.upsert({
          where: {
            employeeId_month_year: {
              employeeId: emp.id,
              month,
              year,
            },
          },
          update: {
            payrollCycleId: cycle.id,
            status: "PENDING_REVIEW",
            calendarDays,
            workingDays,
            presentDays: calc.presentDays,
            lopDays: calc.lopDays,
            basicSalaryINR: calc.basicSalaryINR,
            hraINR: calc.hraINR,
            conveyanceINR: calc.conveyanceINR,
            specialAllowanceINR: calc.specialAllowanceINR,
            grossEarningsINR: calc.grossEarningsINR,
            pfEmployeeINR: calc.pfEmployeeINR,
            esiEmployeeINR: calc.esiEmployeeINR,
            profTaxINR: calc.profTaxINR,
            lopDeductionINR: calc.lopDeductionINR,
            totalDeductions: calc.totalDeductions,
            pfEmployerINR: calc.pfEmployerINR,
            esiEmployerINR: calc.esiEmployerINR,
            totalEmployerCostINR: calc.totalEmployerCostINR,
            netPayableINR: calc.netPayableINR,
            bankName: emp.bankName,
            bankAccountNumber: emp.bankAccountNumber,
            bankIFSC: emp.bankIFSC,
            processedBy: session?.fullName || "HR Admin",
          },
          create: {
            payrollCycleId: cycle.id,
            employeeId: emp.id,
            month,
            year,
            status: "PENDING_REVIEW",
            calendarDays,
            workingDays,
            presentDays: calc.presentDays,
            lopDays: calc.lopDays,
            basicSalaryINR: calc.basicSalaryINR,
            hraINR: calc.hraINR,
            conveyanceINR: calc.conveyanceINR,
            specialAllowanceINR: calc.specialAllowanceINR,
            grossEarningsINR: calc.grossEarningsINR,
            pfEmployeeINR: calc.pfEmployeeINR,
            esiEmployeeINR: calc.esiEmployeeINR,
            profTaxINR: calc.profTaxINR,
            lopDeductionINR: calc.lopDeductionINR,
            totalDeductions: calc.totalDeductions,
            pfEmployerINR: calc.pfEmployerINR,
            esiEmployerINR: calc.esiEmployerINR,
            totalEmployerCostINR: calc.totalEmployerCostINR,
            netPayableINR: calc.netPayableINR,
            bankName: emp.bankName,
            bankAccountNumber: emp.bankAccountNumber,
            bankIFSC: emp.bankIFSC,
            processedBy: session?.fullName || "HR Admin",
          },
        });
      }

      await prisma.payrollCycle.update({
        where: { id: cycle.id },
        data: {
          totalEmployees: employees.length,
          totalGrossINR: totalGross,
          totalDeductionsINR: totalDeductions,
          totalEmployerContributionsINR: totalEmployerContributions,
          totalNetPayableINR: totalNet,
        },
      });

      revalidatePath("/payroll");
      return {
        success: true,
        message: `Successfully calculated payroll for ${employees.length} employees. Ready for review.`,
        cycleId: cycle.id,
      };
    }
  } catch (error) {
    console.warn("DB calculateMonthlyPayrollAction fallback:", error);
  }

  // In-memory simulation
  let cycle = LIVE_PAYROLL_CYCLES.find((c) => c.month === month && c.year === year);
  if (!cycle) {
    cycle = {
      id: `cycle_${year}_${month}`,
      month,
      year,
      status: "PENDING_REVIEW",
      totalEmployees: LIVE_PAYROLL_RECORDS.length,
      totalGrossINR: LIVE_PAYROLL_RECORDS.reduce((s, r) => s + r.grossEarningsINR, 0),
      totalDeductionsINR: LIVE_PAYROLL_RECORDS.reduce((s, r) => s + r.totalDeductions, 0),
      totalEmployerContributionsINR: LIVE_PAYROLL_RECORDS.reduce(
        (s, r) => s + r.pfEmployerINR + r.esiEmployerINR,
        0
      ),
      totalNetPayableINR: LIVE_PAYROLL_RECORDS.reduce((s, r) => s + r.netPayableINR, 0),
      lopCalculationBasis: lopBasis,
      processedBy: `${session?.fullName || "Priya Sharma"} (HR Admin)`,
      createdAt: formatDateDDMMYYYY(new Date()),
      updatedAt: formatDateDDMMYYYY(new Date()),
      recordsCount: LIVE_PAYROLL_RECORDS.length,
    };
    LIVE_PAYROLL_CYCLES.unshift(cycle);
  } else {
    cycle.status = "PENDING_REVIEW";
    cycle.lopCalculationBasis = lopBasis;
  }

  LIVE_PAYROLL_RECORDS.forEach((r) => {
    if (r.month === month && r.year === year) {
      r.status = "PENDING_REVIEW";
    }
  });

  revalidatePath("/payroll");
  return {
    success: true,
    message: `Calculated payroll preview for ${LIVE_PAYROLL_RECORDS.length} active employees. Status set to Pending Review.`,
    cycleId: cycle.id,
  };
}

/**
 * Submit Payroll for Super Admin Approval
 */
export async function submitPayrollForApprovalAction(
  cycleId: string,
  remarks?: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canManagePayroll(user)) {
    return { success: false, message: "Unauthorized to submit payroll for approval." };
  }

  try {
    await prisma.payrollCycle.update({
      where: { id: cycleId },
      data: {
        status: "PENDING_APPROVAL",
        reviewedBy: session?.fullName || "HR Admin",
        notes: remarks || undefined,
      },
    });
    await prisma.payrollRecord.updateMany({
      where: { payrollCycleId: cycleId },
      data: { status: "PENDING_APPROVAL" },
    });
  } catch (error) {
    console.warn("DB submitPayrollForApprovalAction fallback:", error);
  }

  updatePayrollCycleStatus(
    cycleId,
    "PENDING_APPROVAL",
    user.id,
    session?.fullName || "Priya Sharma",
    remarks || "Submitted for Super Admin authorization."
  );

  revalidatePath("/payroll");
  return { success: true, message: "Payroll submitted to Super Admin Vishnu for approval." };
}

/**
 * Super Admin Approval / Rejection Action
 */
export async function approvePayrollCycleAction(
  cycleId: string,
  decision: "APPROVE" | "REJECT",
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canApprovePayroll(user)) {
    return {
      success: false,
      message: "Unauthorized: Separation of duties requires Super Admin authorization.",
    };
  }

  const nextStatus: PayrollStatus = decision === "APPROVE" ? "APPROVED" : "DRAFT";

  try {
    await prisma.payrollCycle.update({
      where: { id: cycleId },
      data: {
        status: nextStatus,
        approvedBy: decision === "APPROVE" ? session?.fullName || "Vishnu (Super Admin)" : undefined,
        rejectionReason: decision === "REJECT" ? reason : undefined,
      },
    });
    await prisma.payrollRecord.updateMany({
      where: { payrollCycleId: cycleId },
      data: {
        status: nextStatus,
        approvedBy: decision === "APPROVE" ? session?.fullName || "Vishnu (Super Admin)" : undefined,
        rejectionReason: decision === "REJECT" ? reason : undefined,
      },
    });
  } catch (error) {
    console.warn("DB approvePayrollCycleAction fallback:", error);
  }

  updatePayrollCycleStatus(
    cycleId,
    nextStatus,
    user.id,
    session?.fullName || "Vishnu (Super Admin)",
    decision === "APPROVE" ? "Authorized and approved" : `Rejected: ${reason || "Discrepancy"}`
  );

  revalidatePath("/payroll");
  return {
    success: true,
    message:
      decision === "APPROVE"
        ? "Payroll cycle successfully approved by Super Admin Vishnu. Ready for finalization."
        : `Payroll cycle rejected and returned to Draft. Reason: ${reason || "Requires review"}`,
  };
}

/**
 * Finalize Payroll Cycle (Locks records into immutable state and releases payslips)
 */
export async function finalizePayrollCycleAction(
  cycleId: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canFinalizePayroll(user)) {
    return {
      success: false,
      message: "Unauthorized: Only Super Admin Vishnu can lock and finalize payroll.",
    };
  }

  try {
    await prisma.payrollCycle.update({
      where: { id: cycleId },
      data: {
        status: "FINALIZED",
        finalizedAt: new Date(),
      },
    });
    await prisma.payrollRecord.updateMany({
      where: { payrollCycleId: cycleId },
      data: {
        status: "FINALIZED",
      },
    });
  } catch (error) {
    console.warn("DB finalizePayrollCycleAction fallback:", error);
  }

  updatePayrollCycleStatus(
    cycleId,
    "FINALIZED",
    user.id,
    session?.fullName || "Vishnu (Super Admin)",
    "Payroll finalized and locked into immutable financial state. Payslips released."
  );

  revalidatePath("/payroll");
  return {
    success: true,
    message: "Payroll finalized! Records are now locked and payslips are securely accessible to employees.",
  };
}

/**
 * Reopen Finalized Payroll (Super Admin Authorized Override with Mandatory Reason)
 */
export async function reopenPayrollCycleAction(
  cycleId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canReopenPayroll(user)) {
    return {
      success: false,
      message: "Unauthorized: Only Super Admin Vishnu can reopen finalized payroll.",
    };
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      message: "A detailed justification is required to reopen finalized payroll.",
    };
  }

  try {
    await prisma.payrollCycle.update({
      where: { id: cycleId },
      data: {
        status: "REOPENED",
        rejectionReason: reason,
      },
    });
    await prisma.payrollRecord.updateMany({
      where: { payrollCycleId: cycleId },
      data: {
        status: "REOPENED",
      },
    });
  } catch (error) {
    console.warn("DB reopenPayrollCycleAction fallback:", error);
  }

  updatePayrollCycleStatus(
    cycleId,
    "REOPENED",
    user.id,
    session?.fullName || "Vishnu (Super Admin)",
    `Reopened for correction. Reason: ${reason}`
  );

  revalidatePath("/payroll");
  return {
    success: true,
    message: `Payroll reopened for authorized corrections. Reason logged in audit trail.`,
  };
}

/**
 * Record Salary Payment Details for an Employee
 */
export async function recordSalaryPaymentAction(
  recordId: string,
  paymentData: {
    paymentMethod: string;
    paymentReference: string;
    paidAmountINR: number;
    paymentRemarks?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canRecordSalaryPayment(user)) {
    return { success: false, message: "Unauthorized to record salary payments." };
  }

  try {
    await prisma.payrollRecord.update({
      where: { id: recordId },
      data: {
        isPaid: true,
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
        paidAmountINR: paymentData.paidAmountINR,
        paymentRemarks: paymentData.paymentRemarks,
      },
    });
  } catch (error) {
    console.warn("DB recordSalaryPaymentAction fallback:", error);
  }

  recordPaymentForRecord(
    recordId,
    paymentData,
    user.id,
    session?.fullName || "Priya Sharma (HR Admin)"
  );

  revalidatePath("/payroll");
  return {
    success: true,
    message: `Payment reference ${paymentData.paymentReference} recorded successfully.`,
  };
}

/**
 * Generate Bank Salary Transfer Export File (CSV / Array)
 */
export async function getBankTransferExportAction(
  month: number = 10,
  year: number = 2026
): Promise<{
  success: boolean;
  data: BankTransferExportItem[];
  csvContent: string;
  error?: string;
}> {
  const session = await getSession();
  const user = toUserContext(session);

  if (!canExportBankTransfer(user)) {
    return {
      success: false,
      data: [],
      csvContent: "",
      error: "Unauthorized: Bank transfer exports are restricted to HR Admin and Super Admin.",
    };
  }

  const items = generateBankTransferExport(month, year);

  // Generate Netbanking CSV format
  const headers = [
    "Beneficiary Name",
    "Account Number",
    "IFSC Code",
    "Amount (INR)",
    "Narration",
    "Employee Code",
    "Department",
    "Reference",
  ];

  const rows = items.map((i) => [
    `"${i.beneficiaryName}"`,
    `"${i.beneficiaryAccount}"`,
    `"${i.ifscCode}"`,
    i.amountINR.toFixed(2),
    `"${i.paymentNarration}"`,
    `"${i.employeeCode}"`,
    `"${i.department}"`,
    `"${i.paymentReference}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return {
    success: true,
    data: items,
    csvContent,
  };
}

/**
 * Securely fetch individual payslip details
 */
export async function getPayslipDetailAction(
  recordId: string
): Promise<{ success: boolean; data?: PayrollRecordItem; error?: string }> {
  const session = await getSession();
  const user = toUserContext(session);

  const rec = LIVE_PAYROLL_RECORDS.find((r) => r.id === recordId);
  if (!rec) {
    return { success: false, error: "Payslip record not found." };
  }

  if (!canViewPayslip(user, rec.employeeId)) {
    return {
      success: false,
      error: "Security Alert: You are not authorized to view another employee's payslip.",
    };
  }

  return { success: true, data: rec };
}
