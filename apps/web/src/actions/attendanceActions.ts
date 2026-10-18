"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@vsecure/database";
import {
  AttendanceCheckInInput,
  AttendanceCheckInSchema,
  AttendanceCheckOutInput,
  AttendanceCheckOutSchema,
  AttendanceCorrectionInput,
  AttendanceCorrectionSchema,
  AttendancePolicyInput,
  AttendancePolicySchema,
  AttendanceRecordItem,
  AttendanceDashboardStats,
  FieldVisitInput,
  FieldVisitSchema,
  Role,
  hasPermission,
  calculateDistanceMeters,
  evaluateGpsAccuracy,
  evaluateLocationRisk,
  evaluatePunctuality,
  calculateWorkingHours,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  parseDateDDMMYYYY,
  DEFAULT_OFFICE_COORDINATES,
} from "@vsecure/shared";
import { getSession } from "@/lib/auth";
import {
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_FIELD_VISITS,
  LIVE_ATTENDANCE_POLICY,
  LIVE_CLIENT_SITES,
  updateLiveAttendancePolicy,
  AttendanceCorrectionItem,
} from "@/lib/attendanceData";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";
import { LIVE_LEAVE_REQUESTS } from "@/lib/leaveData";

/**
 * Fetch KPI Summary Stats for Attendance Dashboard
 */
export async function getAttendanceDashboardStatsAction(): Promise<AttendanceDashboardStats> {
  const session = await getSession();
  const currentRole: Role = session?.role || "SUPER_ADMIN";
  const currentDeptId = session?.departmentId;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = {
      attendanceDate: today,
    };

    if (currentRole === "MANAGER" && currentDeptId) {
      where.employee = { departmentId: currentDeptId };
    }

    const [
      totalEmployeesCount,
      presentCount,
      lateCount,
      fieldDutyCount,
      pendingCorrectionsCount,
      flaggedSuspiciousCount,
    ] = await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.attendanceLog.count({ where: { ...where, status: "PRESENT" } }),
      prisma.attendanceLog.count({ where: { ...where, status: "LATE" } }),
      prisma.attendanceLog.count({ where: { ...where, status: "FIELD_DUTY" } }),
      prisma.attendanceCorrection.count({ where: { status: "PENDING" } }),
      prisma.attendanceLog.count({
        where: {
          ...where,
          OR: [{ reviewStatus: "FLAGGED_SUSPICIOUS" }, { isMockLocation: true }],
        },
      }),
    ]);

    // Active approved leaves today
    const todayStr = formatDateDDMMYYYY(new Date());
    const todayDate = parseDateDDMMYYYY(todayStr) || new Date();
    const onLeaveCount = LIVE_LEAVE_REQUESTS.filter((r) => {
      if (r.status !== "APPROVED" || r.isCancelled) return false;
      const start = parseDateDDMMYYYY(r.startDate);
      const end = parseDateDDMMYYYY(r.endDate);
      if (!start || !end) return false;
      return todayDate.getTime() >= start.getTime() && todayDate.getTime() <= end.getTime();
    }).length;

    const absentCount = Math.max(
      0,
      totalEmployeesCount - (presentCount + lateCount + fieldDutyCount + onLeaveCount)
    );

    return {
      totalActiveEmployees: totalEmployeesCount,
      presentToday: presentCount,
      lateArrivals: lateCount,
      onLeaveToday: onLeaveCount,
      fieldDutyToday: fieldDutyCount,
      absentToday: absentCount,
      pendingCorrections: pendingCorrectionsCount,
      locationExceptions: flaggedSuspiciousCount,
    };
  } catch (error) {
    // In-memory fallback
    const total = INITIAL_STAFF_DIRECTORY.filter((e) => e.status === "ACTIVE").length;
    const records = INITIAL_ATTENDANCE_RECORDS;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const field = records.filter((r) => r.status === "FIELD_DUTY").length;
    const flagged = records.filter(
      (r) => r.isMockLocation || r.reviewStatus === "FLAGGED_SUSPICIOUS"
    ).length;
    const pendingCorr = INITIAL_CORRECTION_REQUESTS.filter((c) => c.status === "PENDING").length;

    const todayStr = formatDateDDMMYYYY(new Date());
    const todayDate = parseDateDDMMYYYY(todayStr) || new Date();
    const onLeaveCount = LIVE_LEAVE_REQUESTS.filter((r) => {
      if (r.status !== "APPROVED" || r.isCancelled) return false;
      const start = parseDateDDMMYYYY(r.startDate);
      const end = parseDateDDMMYYYY(r.endDate);
      if (!start || !end) return false;
      return todayDate.getTime() >= start.getTime() && todayDate.getTime() <= end.getTime();
    }).length;

    return {
      totalActiveEmployees: total,
      presentToday: present,
      lateArrivals: late,
      onLeaveToday: onLeaveCount,
      fieldDutyToday: field,
      absentToday: Math.max(0, total - (present + late + field + onLeaveCount)),
      pendingCorrections: pendingCorr,
      locationExceptions: flagged,
    };
  }
}

/**
 * Fetch Attendance Records with RBAC and multi-attribute filters
 */
export async function getAttendanceRecordsAction(params?: {
  query?: string;
  departmentId?: string;
  status?: string;
  attendanceType?: string;
  reviewStatus?: string;
  date?: string; // DD-MM-YYYY
}): Promise<AttendanceRecordItem[]> {
  const session = await getSession();
  const currentRole: Role = session?.role || "SUPER_ADMIN";
  const currentUserId = session?.id || "emp_vsecure_001";
  const currentDeptId = session?.departmentId;

  try {
    const where: any = {};

    // Role-based scope
    if (currentRole === "MANAGER" && currentDeptId) {
      where.employee = { departmentId: currentDeptId };
    } else if (currentRole === "EMPLOYEE") {
      where.employeeId = currentUserId;
    }

    if (params?.status && params.status !== "ALL") {
      where.status = params.status;
    }
    if (params?.attendanceType && params.attendanceType !== "ALL") {
      where.attendanceType = params.attendanceType;
    }
    if (params?.reviewStatus && params.reviewStatus !== "ALL") {
      where.reviewStatus = params.reviewStatus;
    }

    if (params?.query) {
      where.employee = {
        ...(where.employee || {}),
        OR: [
          { fullName: { contains: params.query, mode: "insensitive" } },
          { employeeCode: { contains: params.query, mode: "insensitive" } },
          { email: { contains: params.query, mode: "insensitive" } },
          { phone: { contains: params.query, mode: "insensitive" } },
        ],
      };
    }

    const logs = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
          },
        },
        officeLocation: true,
        clientSite: true,
        fieldVisits: true,
      },
      orderBy: { checkInTime: "desc" },
    });

    if (logs.length > 0) {
      return logs.map((log) => ({
        id: log.id,
        employeeId: log.employeeId,
        employeeCode: log.employee.employeeCode,
        employeeName: log.employee.fullName,
        departmentId: log.employee.departmentId,
        departmentName: log.employee.department?.name || "General",
        designation: log.employee.designation,
        attendanceDate: formatDateDDMMYYYY(log.attendanceDate),
        checkInTime: formatTime12HourIST(log.checkInTime),
        checkOutTime: log.checkOutTime ? formatTime12HourIST(log.checkOutTime) : null,
        totalDuration: log.workingHoursDisplay || (log.checkOutTime ? "Completed" : "In Progress"),
        status: log.status as any,
        attendanceType: log.attendanceType as any,
        checkInLat: log.checkInLat,
        checkInLng: log.checkInLng,
        checkOutLat: log.checkOutLat,
        checkOutLng: log.checkOutLng,
        gpsAccuracyMeters: log.gpsAccuracyMeters,
        distanceFromOfficeMeters: log.distanceFromHQ,
        isWithinGeofence: log.isWithinGeofence,
        isMockLocation: log.isMockLocation,
        reviewStatus: log.reviewStatus as any,
        rejectionReason: log.rejectionReason,
        geofenceRadius: log.geofenceSnapshotRadius,
        locationName: log.clientSite?.name || log.officeLocation?.name || "VSecure Technologies HQ",
        selfieUrl: log.selfieUrl,
        fieldVisitsCount: log.fieldVisits?.length || 0,
      }));
    }
  } catch (error) {
    console.error("Database read error for attendance records, falling back to simulated store:", error);
  }

  // Fallback in-memory dataset
  let list = [...INITIAL_ATTENDANCE_RECORDS];

  // Apply RBAC
  if (currentRole === "MANAGER" && currentDeptId) {
    list = list.filter((r) => r.departmentId === currentDeptId || r.employeeId === currentUserId);
  } else if (currentRole === "EMPLOYEE") {
    list = list.filter((r) => r.employeeId === currentUserId || r.employeeCode === "VS-004");
  }

  if (params?.query) {
    const q = params.query.toLowerCase();
    list = list.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q)
    );
  }
  if (params?.status && params.status !== "ALL") {
    list = list.filter((r) => r.status === params.status);
  }
  if (params?.attendanceType && params.attendanceType !== "ALL") {
    list = list.filter((r) => r.attendanceType === params.attendanceType);
  }
  if (params?.reviewStatus && params.reviewStatus !== "ALL") {
    list = list.filter((r) => r.reviewStatus === params.reviewStatus);
  }

  return list;
}

/**
 * GPS Attendance Check-In Action (Android & Web)
 */
export async function checkInAttendanceAction(input: AttendanceCheckInInput) {
  const session = await getSession();
  const currentRole = session?.role || "EMPLOYEE";
  const currentUserId = session?.id || input.employeeId;

  // Validate input
  const parsed = AttendanceCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  const d = parsed.data;

  // Check GPS accuracy
  const accuracyEval = evaluateGpsAccuracy(d.gpsAccuracyMeters);
  if (!accuracyEval.isAcceptable) {
    return {
      error: `Check-in blocked: ${accuracyEval.message}`,
    };
  }

  // Determine authorized geofence target (HQ vs Client Site)
  let targetLat: number = DEFAULT_OFFICE_COORDINATES.latitude;
  let targetLng: number = DEFAULT_OFFICE_COORDINATES.longitude;
  let targetRadius: number = LIVE_ATTENDANCE_POLICY.defaultGeofenceRadiusMeters;
  let targetLocationName: string = DEFAULT_OFFICE_COORDINATES.name;
  let clientSiteId = d.clientSiteId || null;

  if (d.attendanceType === "FIELD_DUTY" && d.clientSiteId) {
    const clientSite = LIVE_CLIENT_SITES.find((s) => s.id === d.clientSiteId);
    if (clientSite) {
      targetLat = clientSite.latitude;
      targetLng = clientSite.longitude;
      targetRadius = clientSite.radiusMeters;
      targetLocationName = clientSite.name;
    }
  }

  // Calculate distance via Haversine
  const distance = calculateDistanceMeters(d.latitude, d.longitude, targetLat, targetLng);
  const isWithin = distance <= targetRadius;

  // Anti-spoofing and risk evaluation
  const riskEval = evaluateLocationRisk({
    isMockLocation: d.isMockLocation,
    distanceMeters: distance,
    radiusMeters: targetRadius,
    accuracyMeters: d.gpsAccuracyMeters,
    isDeviceBound: true,
  });

  if (!riskEval.isAllowed && riskEval.reviewStatus === "FLAGGED_SUSPICIOUS") {
    return {
      error: `Attendance Rejected: ${riskEval.reason}`,
    };
  }

  if (!riskEval.isAllowed && riskEval.reviewStatus === "REJECTED") {
    return {
      error: `Geofence Violation: You are ${distance}m from ${targetLocationName} (authorized radius is ${targetRadius}m).`,
    };
  }

  // Evaluate punctuality (Present vs Late)
  const now = new Date();
  const punctuality = evaluatePunctuality(
    now,
    LIVE_ATTENDANCE_POLICY.shiftStartTime,
    LIVE_ATTENDANCE_POLICY.gracePeriodMinutes
  );

  const finalStatus =
    d.attendanceType === "FIELD_DUTY" ? "FIELD_DUTY" : punctuality.status;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  try {
    // Check if check-in already recorded today
    const existing = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: d.employeeId,
        attendanceDate: todayDate,
      },
    });

    if (existing) {
      return {
        error: `Duplicate Check-In: Attendance already marked for today at ${formatTime12HourIST(
          existing.checkInTime
        )}.`,
      };
    }

    const created = await prisma.attendanceLog.create({
      data: {
        employeeId: d.employeeId,
        attendanceDate: todayDate,
        checkInTime: now,
        checkInLat: d.latitude,
        checkInLng: d.longitude,
        gpsAccuracyMeters: d.gpsAccuracyMeters,
        distanceFromHQ: distance,
        isWithinGeofence: isWithin,
        isMockLocation: d.isMockLocation,
        status: finalStatus as any,
        attendanceType: d.attendanceType as any,
        workingHoursDisplay: "In Progress",
        reviewStatus: riskEval.reviewStatus as any,
        rejectionReason: riskEval.reviewStatus === "PENDING_REVIEW" ? riskEval.reason : null,
        geofenceSnapshotRadius: targetRadius,
        officeLocationId: DEFAULT_OFFICE_COORDINATES.id,
        clientSiteId: clientSiteId,
        selfieUrl: d.selfieUrl || null,
        remarks: d.remarks || punctuality.message,
      },
    });

    revalidatePath("/attendance");
    revalidatePath("/");
    return {
      success: true,
      message: `Punch In successful at ${formatTime12HourIST(now)} (${finalStatus})!`,
      status: finalStatus,
      checkInTime: formatTime12HourIST(now),
    };
  } catch (err: any) {
    console.error("Database check-in error, updating in-memory store:", err);

    // Find employee info from directory
    const emp = INITIAL_STAFF_DIRECTORY.find((e) => e.id === d.employeeId || e.employeeCode === d.employeeId);

    const existingMem = INITIAL_ATTENDANCE_RECORDS.find(
      (r) =>
        (r.employeeId === d.employeeId || r.employeeCode === d.employeeId) &&
        r.attendanceDate === formatDateDDMMYYYY(now)
    );

    if (existingMem) {
      return {
        error: `Duplicate Check-In: Attendance already marked for today at ${existingMem.checkInTime}.`,
      };
    }

    const newRecord: AttendanceRecordItem = {
      id: `att_log_${Date.now()}`,
      employeeId: d.employeeId,
      employeeCode: emp?.employeeCode || "VS-001",
      employeeName: emp?.fullName || "Vishnu",
      departmentId: emp?.departmentId || "dept_eng",
      departmentName: emp?.departmentName || "Engineering & Architecture",
      designation: emp?.designation || "Staff",
      attendanceDate: formatDateDDMMYYYY(now),
      checkInTime: formatTime12HourIST(now),
      checkOutTime: null,
      totalDuration: "In Progress",
      status: finalStatus as any,
      attendanceType: d.attendanceType,
      checkInLat: d.latitude,
      checkInLng: d.longitude,
      checkOutLat: null,
      checkOutLng: null,
      gpsAccuracyMeters: d.gpsAccuracyMeters,
      distanceFromOfficeMeters: distance,
      isWithinGeofence: isWithin,
      isMockLocation: d.isMockLocation,
      reviewStatus: riskEval.reviewStatus,
      rejectionReason: riskEval.reviewStatus === "PENDING_REVIEW" ? riskEval.reason : null,
      geofenceRadius: targetRadius,
      locationName: targetLocationName,
      selfieUrl: d.selfieUrl || null,
      fieldVisitsCount: 0,
    };

    INITIAL_ATTENDANCE_RECORDS.unshift(newRecord);
    revalidatePath("/attendance");
    revalidatePath("/");

    return {
      success: true,
      message: `Punch In successful at ${formatTime12HourIST(now)} (${finalStatus})!`,
      status: finalStatus,
      checkInTime: formatTime12HourIST(now),
    };
  }
}

/**
 * GPS Attendance Check-Out Action (Android & Web)
 */
export async function checkOutAttendanceAction(input: AttendanceCheckOutInput) {
  const parsed = AttendanceCheckOutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  const d = parsed.data;
  const now = new Date();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  try {
    const existing = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: d.employeeId,
        attendanceDate: todayDate,
      },
    });

    if (!existing) {
      return {
        error: "Check-Out Failed: No active check-in record found for today.",
      };
    }

    if (existing.checkOutTime) {
      return {
        error: `Check-Out already recorded at ${formatTime12HourIST(existing.checkOutTime)}.`,
      };
    }

    const hoursCalc = calculateWorkingHours(
      existing.checkInTime,
      now,
      LIVE_ATTENDANCE_POLICY.minHoursFullDay,
      LIVE_ATTENDANCE_POLICY.minHoursHalfDay
    );

    const updated = await prisma.attendanceLog.update({
      where: { id: existing.id },
      data: {
        checkOutTime: now,
        checkOutLat: d.latitude,
        checkOutLng: d.longitude,
        totalDurationMinutes: hoursCalc.totalMinutes,
        workingHoursDisplay: hoursCalc.displayHours,
        status:
          existing.status === "FIELD_DUTY"
            ? "FIELD_DUTY"
            : hoursCalc.isHalfDay
            ? "HALF_DAY"
            : existing.status,
      },
    });

    revalidatePath("/attendance");
    revalidatePath("/");
    return {
      success: true,
      message: `Punch Out recorded at ${formatTime12HourIST(now)}. Total duration: ${hoursCalc.displayHours}.`,
      checkOutTime: formatTime12HourIST(now),
      duration: hoursCalc.displayHours,
    };
  } catch (err: any) {
    console.error("Database check-out error, updating in-memory store:", err);

    const record = INITIAL_ATTENDANCE_RECORDS.find(
      (r) =>
        (r.employeeId === d.employeeId || r.employeeCode === d.employeeId) &&
        r.attendanceDate === formatDateDDMMYYYY(now)
    );

    if (!record) {
      return { error: "No active check-in record found for today." };
    }

    if (record.checkOutTime) {
      return { error: `Check-Out already recorded at ${record.checkOutTime}.` };
    }

    // Parse checkInTime to approximate Date
    const checkInDate = new Date();
    checkInDate.setHours(9, 24, 0, 0);

    const hoursCalc = calculateWorkingHours(
      checkInDate,
      now,
      LIVE_ATTENDANCE_POLICY.minHoursFullDay,
      LIVE_ATTENDANCE_POLICY.minHoursHalfDay
    );

    record.checkOutTime = formatTime12HourIST(now);
    record.checkOutLat = d.latitude;
    record.checkOutLng = d.longitude;
    record.totalDuration = hoursCalc.displayHours;
    if (record.status !== "FIELD_DUTY" && hoursCalc.isHalfDay) {
      record.status = "HALF_DAY";
    }

    revalidatePath("/attendance");
    revalidatePath("/");

    return {
      success: true,
      message: `Punch Out recorded at ${formatTime12HourIST(now)}. Total duration: ${hoursCalc.displayHours}.`,
      checkOutTime: formatTime12HourIST(now),
      duration: hoursCalc.displayHours,
    };
  }
}

/**
 * Log Field Visit for Field Engineers
 */
export async function logFieldVisitAction(input: FieldVisitInput) {
  const parsed = FieldVisitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  const d = parsed.data;
  const now = new Date();

  try {
    const visit = await prisma.fieldVisit.create({
      data: {
        employeeId: d.employeeId,
        clientSiteId: d.clientSiteId || null,
        clientName: d.clientName,
        workOrderNumber: d.workOrderNumber || null,
        checkInTime: new Date(d.checkInTime),
        checkOutTime: d.checkOutTime ? new Date(d.checkOutTime) : now,
        checkInLat: d.latitude,
        checkInLng: d.longitude,
        gpsAccuracyMeters: d.gpsAccuracyMeters || 10,
        visitNotes: d.visitNotes,
        sitePhotoUrl: d.sitePhotoUrl || null,
        status: d.status || "COMPLETED",
      },
    });

    revalidatePath("/attendance");
    return {
      success: true,
      message: `Field Visit at ${d.clientName} logged successfully!`,
      visit,
    };
  } catch (err) {
    INITIAL_FIELD_VISITS.unshift({
      id: `visit_${Date.now()}`,
      employeeId: d.employeeId,
      employeeCode: "VS-004",
      employeeName: "Kavita Nair",
      clientSiteId: d.clientSiteId || "site_client_001",
      clientName: d.clientName,
      workOrderNumber: d.workOrderNumber || "WO-GEN-2026",
      checkInTime: typeof d.checkInTime === "string" ? d.checkInTime : formatTime12HourIST(d.checkInTime),
      checkOutTime: formatTime12HourIST(now),
      latitude: d.latitude,
      longitude: d.longitude,
      gpsAccuracyMeters: d.gpsAccuracyMeters || 10,
      visitNotes: d.visitNotes,
      status: "COMPLETED",
    });

    revalidatePath("/attendance");
    return {
      success: true,
      message: `Field Visit at ${d.clientName} logged successfully!`,
    };
  }
}

/**
 * Submit Attendance Correction Request (Employee / Manager)
 */
export async function submitAttendanceCorrectionAction(input: AttendanceCorrectionInput) {
  const parsed = AttendanceCorrectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  const d = parsed.data;
  const [day, month, year] = d.attendanceDate.split("-").map(Number);
  const dateObj = new Date(year || 2026, (month || 1) - 1, day || 1);

  try {
    const correction = await prisma.attendanceCorrection.create({
      data: {
        employeeId: d.employeeId,
        attendanceDate: dateObj,
        requestType: d.requestType as any,
        requestedCheckInTime: new Date(),
        reason: d.reason,
        supportingDocUrl: d.supportingDocUrl || null,
        status: "PENDING",
      },
    });

    revalidatePath("/attendance");
    return {
      success: true,
      message: "Attendance correction request submitted for HR Admin review.",
      correction,
    };
  } catch (err) {
    const emp = INITIAL_STAFF_DIRECTORY.find((e) => e.id === d.employeeId || e.employeeCode === d.employeeId);

    INITIAL_CORRECTION_REQUESTS.unshift({
      id: `corr_req_${Date.now()}`,
      employeeId: d.employeeId,
      employeeCode: emp?.employeeCode || "VS-004",
      employeeName: emp?.fullName || "Employee",
      departmentName: emp?.departmentName || "General",
      attendanceDate: d.attendanceDate,
      requestType: d.requestType,
      originalCheckInTime: null,
      originalCheckOutTime: null,
      requestedCheckInTime: d.requestedCheckInTime,
      requestedCheckOutTime: d.requestedCheckOutTime || null,
      reason: d.reason,
      status: "PENDING",
      actionedBy: null,
      actionedAt: null,
      reviewerNotes: null,
      createdAt: `${formatDateDDMMYYYY(new Date())} ${formatTime12HourIST(new Date())}`,
    });

    revalidatePath("/attendance");
    return {
      success: true,
      message: "Attendance correction request submitted for HR Admin review.",
    };
  }
}

/**
 * Review Attendance Correction (Approve / Reject) by Super Admin Vishnu or HR Admin
 */
export async function reviewAttendanceCorrectionAction(
  correctionId: string,
  decision: "APPROVED" | "REJECTED",
  reviewerNotes?: string
) {
  const session = await getSession();
  const currentRole = session?.role || "SUPER_ADMIN";
  const reviewerName = session?.fullName ? `${session.fullName} (${session.role})` : "Vishnu (Super Admin)";

  if (!hasPermission(currentRole, "ATTENDANCE:CORRECTION_APPROVE")) {
    return { error: "Access Denied: Only Super Admin and HR Admin can review correction requests." };
  }

  try {
    const updated = await prisma.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        status: decision,
        actionedBy: reviewerName,
        actionedAt: new Date(),
        reviewerNotes: reviewerNotes || null,
      },
    });

    revalidatePath("/attendance");
    return {
      success: true,
      message: `Correction request has been ${decision.toLowerCase()} by ${reviewerName}.`,
    };
  } catch (err) {
    const req = INITIAL_CORRECTION_REQUESTS.find((c) => c.id === correctionId);
    if (req) {
      req.status = decision;
      req.actionedBy = reviewerName;
      req.actionedAt = `${formatDateDDMMYYYY(new Date())} ${formatTime12HourIST(new Date())}`;
      req.reviewerNotes = reviewerNotes || "Actioned in dashboard";
    }

    revalidatePath("/attendance");
    return {
      success: true,
      message: `Correction request has been ${decision.toLowerCase()} by ${reviewerName}.`,
    };
  }
}

/**
 * Get and Update Attendance Policy Settings
 */
export async function getAttendancePolicyAction(): Promise<AttendancePolicyInput> {
  try {
    const policy = await prisma.attendancePolicy.findFirst();
    if (policy) {
      return {
        defaultGeofenceRadiusMeters: policy.defaultGeofenceRadiusMeters,
        shiftStartTime: policy.shiftStartTime,
        shiftEndTime: policy.shiftEndTime,
        gracePeriodMinutes: policy.gracePeriodMinutes,
        minHoursFullDay: policy.minHoursFullDay,
        minHoursHalfDay: policy.minHoursHalfDay,
        requireSelfie: policy.requireSelfie,
        blockMockLocation: policy.blockMockLocation,
        allowFieldDutyCheckIn: policy.allowFieldDutyCheckIn,
      };
    }
  } catch (e) {
    // fallback
  }

  return LIVE_ATTENDANCE_POLICY;
}

export async function updateAttendancePolicyAction(input: AttendancePolicyInput) {
  const session = await getSession();
  const currentRole = session?.role || "SUPER_ADMIN";

  if (!hasPermission(currentRole, "ATTENDANCE:POLICY_MANAGE")) {
    return { error: "Access Denied: Only Administrator Vishnu and HR Admins can configure attendance policies." };
  }

  const parsed = AttendancePolicySchema.safeParse(input);
  if (!parsed.success) {
    return { error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(", ")}` };
  }

  const d = parsed.data;

  try {
    const org = await prisma.organization.findFirst();
    if (org) {
      await prisma.attendancePolicy.upsert({
        where: { organizationId: org.id },
        update: d,
        create: {
          ...d,
          organizationId: org.id,
        },
      });
    }
  } catch (err) {
    // fallback
  }

  updateLiveAttendancePolicy(d);
  revalidatePath("/attendance");
  revalidatePath("/");

  return {
    success: true,
    message: "Attendance Policy & Geofence Settings updated successfully!",
  };
}
