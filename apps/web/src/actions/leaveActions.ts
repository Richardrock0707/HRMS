"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@vsecure/database";
import {
  LeaveApplicationInput,
  LeaveApplicationSchema,
  LeavePolicyConfigInput,
  LeaveBalanceItem,
  LeaveRecordItem,
  LeaveTransactionItem,
  LeaveDashboardStats,
  LeaveType,
  ApprovalStatus,
  calculateLeaveDuration,
  detectLeaveConflicts,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  formatDateTimeIST,
  parseDateDDMMYYYY,
  canApproveLeave,
  canViewLeave,
  canAdjustLeaveBalance,
  canManageLeavePolicy,
  DEFAULT_LEAVE_TYPES,
  DEFAULT_2026_HOLIDAYS,
} from "@vsecure/shared";
import { requireSession } from "@/lib/auth";
import {
  LIVE_LEAVE_POLICY,
  LIVE_LEAVE_TYPES,
  LIVE_PUBLIC_HOLIDAYS,
  LIVE_LEAVE_BALANCES,
  LIVE_LEAVE_REQUESTS,
  LIVE_LEAVE_TRANSACTIONS,
  addLiveLeaveRequest,
  updateLiveLeaveRequest,
  addLiveLeaveTransaction,
} from "@/lib/leaveData";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";
import { INITIAL_ATTENDANCE_RECORDS } from "@/lib/attendanceData";

/**
 * Fetch KPI Summary Stats for Leave Dashboard
 */
export async function getLeaveDashboardStatsAction(): Promise<LeaveDashboardStats> {
  const session = await requireSession();
  const todayStr = formatDateDDMMYYYY(new Date());

  try {
    const [
      totalRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
    ] = await Promise.all([
      prisma.leaveRequest.count(),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.leaveRequest.count({ where: { status: "APPROVED" } }),
      prisma.leaveRequest.count({ where: { status: "REJECTED" } }),
    ]);

    // Check who is on approved leave today
    const activeLeavesToday = await prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        isCancelled: false,
      },
    });

    const today = parseDateDDMMYYYY(todayStr) || new Date();
    const futureLimit = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const employeesOnLeaveToday = activeLeavesToday.filter((l) => {
      const start = l.startDate;
      const end = l.endDate;
      return today.getTime() >= start.getTime() && today.getTime() <= end.getTime();
    }).length;

    const upcomingAbsences = activeLeavesToday.filter((l) => {
      const start = l.startDate;
      return start.getTime() > today.getTime() && start.getTime() <= futureLimit.getTime();
    }).length;

    const lopRequests = activeLeavesToday.filter((l) => {
      if (l.leaveType !== "UNPAID_LOP") return false;
      const start = l.startDate;
      return start.getMonth() + 1 === currentMonth && start.getFullYear() === currentYear;
    });

    const unpaidLopDaysMonth = lopRequests.reduce((acc, curr) => acc + curr.totalDays, 0);

    return {
      totalLeaveRequests: totalRequests,
      pendingApprovals: pendingCount,
      approvedRequests: approvedCount,
      rejectedRequests: rejectedCount,
      employeesOnLeaveToday,
      upcomingAbsences,
      unpaidLopDaysMonth,
    };
  } catch (err) {
    // Graceful fallback to in-memory state
    const allReqs = LIVE_LEAVE_REQUESTS;
    const totalRequests = allReqs.length;
    const pendingCount = allReqs.filter((r) => r.status === "PENDING").length;
    const approvedCount = allReqs.filter((r) => r.status === "APPROVED").length;
    const rejectedCount = allReqs.filter((r) => r.status === "REJECTED").length;

    const today = parseDateDDMMYYYY(todayStr) || new Date();
    const employeesOnLeaveToday = allReqs.filter((r) => {
      if (r.status !== "APPROVED" || r.isCancelled) return false;
      const start = parseDateDDMMYYYY(r.startDate);
      const end = parseDateDDMMYYYY(r.endDate);
      if (!start || !end) return false;
      return today.getTime() >= start.getTime() && today.getTime() <= end.getTime();
    }).length;

    const futureLimit = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingAbsences = allReqs.filter((r) => {
      if (r.status !== "APPROVED" || r.isCancelled) return false;
      const start = parseDateDDMMYYYY(r.startDate);
      if (!start) return false;
      return start.getTime() > today.getTime() && start.getTime() <= futureLimit.getTime();
    }).length;

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const unpaidLopDaysMonth = allReqs
      .filter((r) => {
        if (r.status !== "APPROVED" || r.leaveType !== "UNPAID_LOP") return false;
        const start = parseDateDDMMYYYY(r.startDate);
        return start && start.getMonth() + 1 === currentMonth && start.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.totalDays, 0);

    return {
      totalLeaveRequests: totalRequests,
      pendingApprovals: pendingCount,
      approvedRequests: approvedCount,
      rejectedRequests: rejectedCount,
      employeesOnLeaveToday,
      upcomingAbsences,
      unpaidLopDaysMonth,
    };
  }
}

/**
 * Fetch Leave Balances (RBAC scoped)
 */
export async function getLeaveBalancesAction(targetEmployeeId?: string): Promise<LeaveBalanceItem[]> {
  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;
  const currentUserDeptId = session?.departmentId;

  // Resolve target employee
  const effectiveEmployeeId = targetEmployeeId || currentUserId;

  // Enforce anti-leakage permission
  const userContext = {
    id: currentUserId,
    role: currentUserRole,
    departmentId: currentUserDeptId,
  };

  // Find target employee info
  const staffMember = INITIAL_STAFF_DIRECTORY.find(
    (s) => s.id === effectiveEmployeeId || s.employeeCode === effectiveEmployeeId
  );

  const targetContext = {
    id: staffMember?.id || effectiveEmployeeId,
    departmentId: staffMember?.departmentId,
  };

  if (!canViewLeave(userContext, targetContext)) {
    throw new Error("Unauthorized: You do not have permission to view this employee's leave balance.");
  }

  try {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        employee: {
          OR: [{ id: targetContext.id }, { employeeCode: effectiveEmployeeId }],
        },
        year: 2026,
      },
    });

    if (balances.length > 0) {
      return balances.map((b) => {
        const typeCfg = DEFAULT_LEAVE_TYPES.find((t) => t.leaveType === b.leaveType);
        return {
          id: b.id,
          employeeId: b.employeeId,
          year: b.year,
          leaveType: b.leaveType as LeaveType,
          code: typeCfg?.code || b.leaveType,
          name: typeCfg?.name || b.leaveType,
          isPaid: typeCfg?.isPaid ?? true,
          allocated: b.allocated,
          accrued: b.accrued,
          carriedForward: b.carriedForward,
          used: b.used,
          pending: b.pending,
          remaining: b.remaining,
        };
      });
    }
  } catch (err) {
    // Fall back to in-memory balances
  }

  return LIVE_LEAVE_BALANCES.filter(
    (b) => b.employeeId === targetContext.id || b.employeeId === effectiveEmployeeId
  );
}

/**
 * Fetch Leave Requests with Filtering & Role Scoping
 */
export async function getLeaveRequestsAction(params?: {
  status?: string;
  leaveType?: string;
  departmentId?: string;
  search?: string;
  tab?: "my" | "approvals" | "all" | "ledger";
}): Promise<LeaveRecordItem[]> {
  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;
  const currentUserDeptId = session?.departmentId;
  const currentUserCode = session?.employeeCode || "VS-001";

  const { status, leaveType, departmentId, search, tab = "all" } = params || {};

  try {
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (leaveType && leaveType !== "ALL") {
      where.leaveType = leaveType;
    }

    // Role-based visibility enforcement
    if (tab === "my" || currentUserRole === "EMPLOYEE") {
      where.employee = {
        OR: [{ id: currentUserId }, { employeeCode: currentUserCode }],
      };
    } else if (tab === "approvals") {
      // Pending queue for reviewer
      where.status = "PENDING";
      if (currentUserRole === "MANAGER") {
        // Manager can only see department members, and NEVER self
        where.employee = {
          departmentId: currentUserDeptId,
          NOT: { id: currentUserId },
        };
      }
    } else if (currentUserRole === "MANAGER") {
      // General manager view restricted to department
      where.employee = {
        departmentId: currentUserDeptId,
      };
    } else if (departmentId && departmentId !== "ALL") {
      where.employee = { departmentId };
    }

    const records = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
            designationRef: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (records.length > 0) {
      return records.map((r) => {
        const typeCfg = DEFAULT_LEAVE_TYPES.find((t) => t.leaveType === r.leaveType);
        return {
          id: r.id,
          referenceId: r.referenceId || `LV-${r.id.slice(-6)}`,
          employeeId: r.employeeId,
          employeeCode: r.employee.employeeCode,
          employeeName: r.employee.fullName,
          departmentId: r.employee.departmentId || "",
          departmentName: r.employee.department?.name || "Operations",
          designation: r.employee.designation || r.employee.designationRef?.title || "Specialist",
          reportingManagerName: "Reporting Officer",
          leaveType: r.leaveType as LeaveType,
          leaveTypeName: typeCfg?.name || r.leaveType,
          isPaid: typeCfg?.isPaid ?? true,
          startDate: formatDateDDMMYYYY(r.startDate),
          endDate: formatDateDDMMYYYY(r.endDate),
          isHalfDay: r.isHalfDay,
          halfDaySession: r.halfDaySession,
          totalDays: r.totalDays,
          reason: r.reason,
          supportingDocumentUrl: r.supportingDocumentUrl,
          status: r.status as ApprovalStatus,
          approvedBy: r.approvedBy,
          rejectionReason: r.rejectionReason,
          actionedAt: r.actionedAt ? formatDateTimeIST(r.actionedAt) : null,
          cancellationReason: r.cancellationReason,
          isCancelled: r.isCancelled,
          createdAt: formatDateTimeIST(r.createdAt),
        };
      });
    }
  } catch (err) {
    // Fall back to in-memory state
  }

  // In-memory filter
  let results = [...LIVE_LEAVE_REQUESTS];

  if (tab === "my" || currentUserRole === "EMPLOYEE") {
    results = results.filter(
      (r) => r.employeeId === currentUserId || r.employeeCode === currentUserCode
    );
  } else if (tab === "approvals") {
    results = results.filter((r) => r.status === "PENDING");
    if (currentUserRole === "MANAGER") {
      // Must not approve self, and must be in department
      results = results.filter(
        (r) =>
          r.employeeId !== currentUserId &&
          r.employeeCode !== currentUserCode &&
          r.departmentId === currentUserDeptId
      );
    }
  } else if (currentUserRole === "MANAGER") {
    results = results.filter((r) => r.departmentId === currentUserDeptId);
  } else if (departmentId && departmentId !== "ALL") {
    results = results.filter((r) => r.departmentId === departmentId);
  }

  if (status && status !== "ALL") {
    results = results.filter((r) => r.status === status);
  }
  if (leaveType && leaveType !== "ALL") {
    results = results.filter((r) => r.leaveType === leaveType);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.referenceId.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }

  return results;
}

/**
 * Submit New Leave Application with Complete Duration & Balance Math
 */
export async function applyLeaveAction(input: LeaveApplicationInput): Promise<{
  success: boolean;
  referenceId: string;
  leaveRequest: LeaveRecordItem;
  message: string;
}> {
  const parsed = LeaveApplicationSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid leave application data.");
  }

  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserCode = session?.employeeCode || "VS-001";
  const currentUserName = session?.fullName || "Vishnu";
  const currentUserDeptId = session?.departmentId || "dept_eng";

  const staff = INITIAL_STAFF_DIRECTORY.find(
    (s) => s.id === currentUserId || s.employeeCode === currentUserCode
  );

  const empId = staff?.id || currentUserId;
  const empCode = staff?.employeeCode || currentUserCode;
  const empName = staff?.fullName || currentUserName;
  const deptId = staff?.departmentId || currentUserDeptId;
  const deptName = staff?.departmentName || "Engineering & Architecture";
  const designation = staff?.designation || "Engineer";

  // 1. Centralized Duration & Deductible Working Days Engine
  const durationResult = calculateLeaveDuration({
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    isHalfDay: parsed.data.isHalfDay,
    halfDaySession: parsed.data.halfDaySession,
    excludeWeekends: LIVE_LEAVE_POLICY.excludeWeekends,
    excludeHolidays: LIVE_LEAVE_POLICY.excludeHolidays,
    holidays: LIVE_PUBLIC_HOLIDAYS,
  });

  if (!durationResult.isValid) {
    throw new Error(durationResult.errorMessage || "Invalid date range selected.");
  }

  if (durationResult.totalDays <= 0) {
    throw new Error(
      "The selected date range contains only weekends or recognized public holidays. No leave days deducted."
    );
  }

  // 2. Conflict & Overlap Detection
  const existingLeaves = LIVE_LEAVE_REQUESTS.filter(
    (r) => r.employeeId === empId || r.employeeCode === empCode
  );

  const conflictCheck = detectLeaveConflicts(
    existingLeaves,
    parsed.data.startDate,
    parsed.data.endDate,
    parsed.data.isHalfDay,
    parsed.data.halfDaySession
  );

  if (conflictCheck.hasConflict) {
    throw new Error(conflictCheck.reason || "Conflicting leave dates detected.");
  }

  // 3. Balance Verification
  const balance = LIVE_LEAVE_BALANCES.find(
    (b) => (b.employeeId === empId || b.employeeId === currentUserId) && b.leaveType === parsed.data.leaveType
  );

  const isUnpaid = parsed.data.leaveType === "UNPAID_LOP";

  if (!isUnpaid && !LIVE_LEAVE_POLICY.allowNegativeBalance) {
    if (balance && balance.remaining < durationResult.totalDays) {
      throw new Error(
        `Insufficient leave balance. You have ${balance.remaining} days available in ${parsed.data.leaveType}, but requested ${durationResult.totalDays} days.`
      );
    }
  }

  // 4. Generate Reference ID (e.g. LV-2026-004)
  const reqCount = LIVE_LEAVE_REQUESTS.length + 1;
  const referenceId = `LV-2026-${String(reqCount).padStart(3, "0")}`;

  const typeCfg = DEFAULT_LEAVE_TYPES.find((t) => t.leaveType === parsed.data.leaveType);

  const newRequest: LeaveRecordItem = {
    id: `leave_req_${Date.now()}`,
    referenceId,
    employeeId: empId,
    employeeCode: empCode,
    employeeName: empName,
    departmentId: deptId,
    departmentName: deptName,
    designation,
    reportingManagerName: "Department Manager",
    leaveType: parsed.data.leaveType,
    leaveTypeName: typeCfg?.name || parsed.data.leaveType,
    isPaid: typeCfg?.isPaid ?? true,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    isHalfDay: parsed.data.isHalfDay,
    halfDaySession: parsed.data.halfDaySession || null,
    totalDays: durationResult.totalDays,
    reason: parsed.data.reason,
    supportingDocumentUrl: parsed.data.supportingDocumentUrl || null,
    status: "PENDING",
    approvedBy: null,
    actionedAt: null,
    rejectionReason: null,
    cancellationReason: null,
    isCancelled: false,
    createdAt: formatDateTimeIST(new Date()),
  };

  // 5. Update In-Memory / DB State
  addLiveLeaveRequest(newRequest);

  if (balance) {
    balance.pending += durationResult.totalDays;
  }

  try {
    await prisma.leaveRequest.create({
      data: {
        referenceId,
        employeeId: empId,
        leaveType: parsed.data.leaveType,
        startDate: parseDateDDMMYYYY(parsed.data.startDate) || new Date(),
        endDate: parseDateDDMMYYYY(parsed.data.endDate) || new Date(),
        isHalfDay: parsed.data.isHalfDay,
        halfDaySession: parsed.data.halfDaySession,
        totalDays: durationResult.totalDays,
        reason: parsed.data.reason,
        supportingDocumentUrl: parsed.data.supportingDocumentUrl,
        status: "PENDING",
      },
    });
  } catch (err) {
    // In-memory already updated
  }

  revalidatePath("/leave");
  revalidatePath("/attendance");

  return {
    success: true,
    referenceId,
    leaveRequest: newRequest,
    message: `Leave request ${referenceId} submitted successfully for ${durationResult.totalDays} day(s).`,
  };
}

/**
 * Review (Approve or Reject) Leave Request with Anti-Self-Approval & Balance Debit
 */
export async function reviewLeaveRequestAction(
  requestId: string,
  decision: "APPROVE" | "REJECT",
  remarks?: string
): Promise<{ success: boolean; message: string }> {
  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;
  const currentUserName = session?.fullName || "Vishnu";
  const currentUserDeptId = session?.departmentId;

  // Retrieve leave request
  const request = LIVE_LEAVE_REQUESTS.find(
    (r) => r.id === requestId || r.referenceId === requestId
  );

  if (!request) {
    throw new Error("Leave request not found.");
  }

  if (request.status !== "PENDING") {
    throw new Error(`Cannot action request that has already been finalized as ${request.status}.`);
  }

  // Enforce Anti-Self-Approval
  const userContext = {
    id: currentUserId,
    role: currentUserRole,
    departmentId: currentUserDeptId,
  };

  if (!canApproveLeave(userContext, { employeeId: request.employeeId, departmentId: request.departmentId, status: request.status })) {
    if (currentUserId === request.employeeId) {
      throw new Error("Anti-Self-Approval Policy: You cannot review or approve your own leave application.");
    }
    throw new Error("Unauthorized: You do not possess the required RBAC permissions to action this leave request.");
  }

  const nowIST = formatDateTimeIST(new Date());

  if (decision === "APPROVE") {
    // 1. Mark request APPROVED
    updateLiveLeaveRequest(request.id, {
      status: "APPROVED",
      approvedBy: `${currentUserName} (${currentUserRole})`,
      actionedAt: nowIST,
    });

    // 2. Debit Leave Balance
    const balance = LIVE_LEAVE_BALANCES.find(
      (b) => b.employeeId === request.employeeId && b.leaveType === request.leaveType
    );

    if (balance) {
      balance.pending = Math.max(0, balance.pending - request.totalDays);
      balance.used += request.totalDays;
      balance.remaining = Math.max(0, balance.remaining - request.totalDays);

      // 3. Create Audit Ledger Transaction
      addLiveLeaveTransaction({
        id: `txn_debit_${Date.now()}`,
        employeeId: request.employeeId,
        employeeCode: request.employeeCode,
        employeeName: request.employeeName,
        year: 2026,
        leaveType: request.leaveType,
        transactionType: "DEBIT",
        days: -request.totalDays,
        balanceAfter: balance.remaining,
        leaveRequestId: request.id,
        remarks: remarks || `Leave approved by ${currentUserName}`,
        actionedBy: `${currentUserName} (${currentUserRole})`,
        createdAt: nowIST,
      });
    }

    // 4. Phase 3 Attendance Engine Integration:
    // If leave covers today, ensure attendance shows ON_LEAVE
    const todayStr = formatDateDDMMYYYY(new Date());
    const start = parseDateDDMMYYYY(request.startDate);
    const end = parseDateDDMMYYYY(request.endDate);
    const today = parseDateDDMMYYYY(todayStr);

    if (start && end && today && today.getTime() >= start.getTime() && today.getTime() <= end.getTime()) {
      const existingAtt = INITIAL_ATTENDANCE_RECORDS.find(
        (a) => (a.employeeId === request.employeeId || a.employeeCode === request.employeeCode) && a.attendanceDate === todayStr
      );
      if (existingAtt) {
        existingAtt.status = request.isHalfDay ? "HALF_DAY" : "ON_LEAVE";
      } else {
        INITIAL_ATTENDANCE_RECORDS.unshift({
          id: `att_leave_${Date.now()}`,
          employeeId: request.employeeId,
          employeeCode: request.employeeCode,
          employeeName: request.employeeName,
          departmentId: request.departmentId,
          departmentName: request.departmentName,
          designation: request.designation,
          attendanceDate: todayStr,
          checkInTime: "--",
          checkOutTime: null,
          totalDuration: request.isHalfDay ? "4.0 hrs" : "Leave",
          status: request.isHalfDay ? "HALF_DAY" : "ON_LEAVE",
          attendanceType: "OFFICE",
          checkInLat: 0,
          checkInLng: 0,
          checkOutLat: null,
          checkOutLng: null,
          gpsAccuracyMeters: 0,
          distanceFromOfficeMeters: 0,
          isWithinGeofence: true,
          isMockLocation: false,
          reviewStatus: "AUTO_VERIFIED",
          rejectionReason: null,
          geofenceRadius: 100,
          locationName: "Approved Absence",
          selfieUrl: null,
          fieldVisitsCount: 0,
        });
      }
    }

    try {
      await prisma.leaveRequest.update({
        where: { id: request.id },
        data: {
          status: "APPROVED",
          approvedBy: `${currentUserName} (${currentUserRole})`,
          actionedAt: new Date(),
        },
      });
    } catch (err) {
      // In-memory already updated
    }

    revalidatePath("/leave");
    revalidatePath("/attendance");

    return {
      success: true,
      message: `Leave request ${request.referenceId} has been approved successfully.`,
    };
  } else {
    // REJECT
    if (!remarks || remarks.trim().length < 3) {
      throw new Error("A rejection reason is mandatory when declining a leave request.");
    }

    updateLiveLeaveRequest(request.id, {
      status: "REJECTED",
      rejectionReason: remarks,
      approvedBy: `${currentUserName} (${currentUserRole})`,
      actionedAt: nowIST,
    });

    const balance = LIVE_LEAVE_BALANCES.find(
      (b) => b.employeeId === request.employeeId && b.leaveType === request.leaveType
    );
    if (balance) {
      balance.pending = Math.max(0, balance.pending - request.totalDays);
    }

    try {
      await prisma.leaveRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED",
          rejectionReason: remarks,
          approvedBy: `${currentUserName} (${currentUserRole})`,
          actionedAt: new Date(),
        },
      });
    } catch (err) {
      // In-memory already updated
    }

    revalidatePath("/leave");

    return {
      success: true,
      message: `Leave request ${request.referenceId} has been rejected. Reason logged in audit history.`,
    };
  }
}

/**
 * Cancel a Leave Request (Pending or Approved)
 */
export async function cancelLeaveRequestAction(
  requestId: string,
  cancellationReason: string
): Promise<{ success: boolean; message: string }> {
  if (!cancellationReason || cancellationReason.trim().length < 3) {
    throw new Error("A cancellation reason is required.");
  }

  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;
  const currentUserName = session?.fullName || "Vishnu";

  const request = LIVE_LEAVE_REQUESTS.find(
    (r) => r.id === requestId || r.referenceId === requestId
  );

  if (!request) {
    throw new Error("Leave request not found.");
  }

  if (request.status === "CANCELLED" || request.isCancelled) {
    throw new Error("This leave request is already cancelled.");
  }

  const isOwner = request.employeeId === currentUserId;
  const isAdmin = currentUserRole === "SUPER_ADMIN" || currentUserRole === "HR_ADMIN";

  if (!isOwner && !isAdmin) {
    throw new Error("Unauthorized: Only the applicant or an HR administrator can cancel this request.");
  }

  const nowIST = formatDateTimeIST(new Date());

  // If already APPROVED, refund the days back to remaining
  if (request.status === "APPROVED") {
    const balance = LIVE_LEAVE_BALANCES.find(
      (b) => b.employeeId === request.employeeId && b.leaveType === request.leaveType
    );

    if (balance) {
      balance.used = Math.max(0, balance.used - request.totalDays);
      balance.remaining += request.totalDays;

      addLiveLeaveTransaction({
        id: `txn_refund_${Date.now()}`,
        employeeId: request.employeeId,
        employeeCode: request.employeeCode,
        employeeName: request.employeeName,
        year: 2026,
        leaveType: request.leaveType,
        transactionType: "CANCELLATION",
        days: request.totalDays,
        balanceAfter: balance.remaining,
        leaveRequestId: request.id,
        remarks: `Refund on cancellation: ${cancellationReason}`,
        actionedBy: `${currentUserName} (${currentUserRole})`,
        createdAt: nowIST,
      });
    }
  } else if (request.status === "PENDING") {
    const balance = LIVE_LEAVE_BALANCES.find(
      (b) => b.employeeId === request.employeeId && b.leaveType === request.leaveType
    );
    if (balance) {
      balance.pending = Math.max(0, balance.pending - request.totalDays);
    }
  }

  updateLiveLeaveRequest(request.id, {
    status: "CANCELLED",
    isCancelled: true,
    cancellationReason,
    actionedAt: nowIST,
  });

  revalidatePath("/leave");
  revalidatePath("/attendance");

  return {
    success: true,
    message: `Leave request ${request.referenceId} has been cancelled and balances restored.`,
  };
}

/**
 * Manual Balance Adjustment by HR Admin or Super Admin Vishnu
 */
export async function adjustLeaveBalanceAction(
  employeeId: string,
  leaveType: LeaveType,
  adjustmentDays: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;
  const currentUserName = session?.fullName || "Vishnu";

  const userContext = {
    id: currentUserId,
    role: currentUserRole,
  };

  if (!canAdjustLeaveBalance(userContext)) {
    throw new Error("Unauthorized: Only HR Admins and Super Admin Vishnu can adjust leave quotas.");
  }

  if (typeof adjustmentDays !== "number" || adjustmentDays === 0) {
    throw new Error("Adjustment days must be a non-zero number (positive for credit, negative for deduction).");
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error("A detailed audit reason (min 5 characters) is mandatory for quota adjustments.");
  }

  const staff = INITIAL_STAFF_DIRECTORY.find((s) => s.id === employeeId || s.employeeCode === employeeId);
  const targetId = staff?.id || employeeId;
  const targetCode = staff?.employeeCode || employeeId;
  const targetName = staff?.fullName || "Employee";

  const balance = LIVE_LEAVE_BALANCES.find(
    (b) => b.employeeId === targetId && b.leaveType === leaveType
  );

  if (!balance) {
    throw new Error("Leave balance record for the specified employee and leave type was not found.");
  }

  balance.allocated += adjustmentDays;
  balance.remaining += adjustmentDays;

  const nowIST = formatDateTimeIST(new Date());

  addLiveLeaveTransaction({
    id: `txn_adj_${Date.now()}`,
    employeeId: targetId,
    employeeCode: targetCode,
    employeeName: targetName,
    year: 2026,
    leaveType,
    transactionType: "ADJUSTMENT",
    days: adjustmentDays,
    balanceAfter: balance.remaining,
    leaveRequestId: null,
    remarks: `Manual adjustment by ${currentUserName}: ${reason}`,
    actionedBy: `${currentUserName} (${currentUserRole})`,
    createdAt: nowIST,
  });

  revalidatePath("/leave");

  return {
    success: true,
    message: `Leave balance for ${targetName} (${leaveType}) adjusted by ${adjustmentDays > 0 ? "+" : ""}${adjustmentDays} days.`,
  };
}

/**
 * Fetch Leave Transactions Audit Ledger
 */
export async function getLeaveTransactionsAction(targetEmployeeId?: string): Promise<LeaveTransactionItem[]> {
  const session = await requireSession();
  const currentUserId = session.id;
  const currentUserRole = session.role;

  if (currentUserRole === "EMPLOYEE" || !targetEmployeeId) {
    return LIVE_LEAVE_TRANSACTIONS.filter((t) => t.employeeId === currentUserId);
  }

  if (targetEmployeeId && targetEmployeeId !== "ALL") {
    return LIVE_LEAVE_TRANSACTIONS.filter((t) => t.employeeId === targetEmployeeId);
  }

  return LIVE_LEAVE_TRANSACTIONS;
}
