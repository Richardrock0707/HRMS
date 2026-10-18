import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateDistanceMeters,
  isWithinGeofence,
  evaluateGpsAccuracy,
  evaluateLocationRisk,
  evaluatePunctuality,
  calculateWorkingHours,
  hasPermission,
  canViewAttendance,
  canApproveCorrection,
  canManageAttendancePolicy,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  formatINR,
  DEFAULT_OFFICE_COORDINATES,
} from "../src/index.ts";

describe("Phase 3 GPS Geofence & Haversine Engine", () => {
  const hq = DEFAULT_OFFICE_COORDINATES;

  it("Scenario 1: Accurately calculates distance for inside-perimeter coordinates", () => {
    // 8 meters away from HQ center
    const lat = 12.93524;
    const lng = 77.69465;
    const distance = calculateDistanceMeters(lat, lng, hq.latitude, hq.longitude);

    assert.ok(distance <= 15, `Expected distance <= 15m, got ${distance}m`);
    assert.strictEqual(isWithinGeofence(lat, lng, hq.latitude, hq.longitude, 100), true);
  });

  it("Scenario 2: Accurately identifies coordinates outside 100m perimeter", () => {
    // 380 meters away from HQ center
    const lat = 12.9385;
    const lng = 77.697;
    const distance = calculateDistanceMeters(lat, lng, hq.latitude, hq.longitude);

    assert.ok(distance > 100, `Expected distance > 100m, got ${distance}m`);
    assert.strictEqual(isWithinGeofence(lat, lng, hq.latitude, hq.longitude, 100), false);
  });
});

describe("Phase 3 GPS Accuracy & Signal Quality Evaluation", () => {
  it("Scenario 3: High precision GPS signal (±8.5m) is acceptable", () => {
    const res = evaluateGpsAccuracy(8.5);
    assert.strictEqual(res.isAcceptable, true);
    assert.strictEqual(res.quality, "HIGH_PRECISION");
  });

  it("Scenario 4: Standard GPS signal (±35m) is acceptable", () => {
    const res = evaluateGpsAccuracy(35);
    assert.strictEqual(res.isAcceptable, true);
    assert.strictEqual(res.quality, "ACCEPTABLE");
  });

  it("Scenario 5: Degraded GPS signal (±85m) is flagged as low accuracy", () => {
    const res = evaluateGpsAccuracy(85);
    assert.strictEqual(res.isAcceptable, false);
    assert.strictEqual(res.quality, "LOW_ACCURACY");
  });
});

describe("Phase 3 Anti-Spoofing & Mock GPS Risk Analysis", () => {
  it("Scenario 6: Blocks attendance attempt when Android mock location is reported", () => {
    const res = evaluateLocationRisk({
      isMockLocation: true,
      distanceMeters: 10,
      radiusMeters: 100,
      accuracyMeters: 10,
      isDeviceBound: true,
    });
    assert.strictEqual(res.isAllowed, false);
    assert.strictEqual(res.reviewStatus, "FLAGGED_SUSPICIOUS");
    assert.match(res.reason, /mock gps/i);
  });

  it("Scenario 7: Rejects punch when measured distance exceeds allowable geofence", () => {
    const res = evaluateLocationRisk({
      isMockLocation: false,
      distanceMeters: 280,
      radiusMeters: 100,
      accuracyMeters: 10,
      isDeviceBound: true,
    });
    assert.strictEqual(res.isAllowed, false);
    assert.strictEqual(res.reviewStatus, "REJECTED");
  });

  it("Scenario 8: Flags degraded accuracy (±85m) for supervisor review", () => {
    const res = evaluateLocationRisk({
      isMockLocation: false,
      distanceMeters: 40,
      radiusMeters: 100,
      accuracyMeters: 85,
      isDeviceBound: true,
    });
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.reviewStatus, "PENDING_REVIEW");
  });

  it("Scenario 9: Auto-verifies clean punch inside perimeter with good satellite lock", () => {
    const res = evaluateLocationRisk({
      isMockLocation: false,
      distanceMeters: 15,
      radiusMeters: 100,
      accuracyMeters: 9,
      isDeviceBound: true,
    });
    assert.strictEqual(res.isAllowed, true);
    assert.strictEqual(res.reviewStatus, "AUTO_VERIFIED");
  });
});

describe("Phase 3 Shift Punctuality & Working Hour Calculations", () => {
  it("Scenario 10: Arrival before shift start (09:24 AM) marked as PRESENT", () => {
    const punchTime = new Date();
    punchTime.setHours(9, 24, 0, 0);
    const res = evaluatePunctuality(punchTime, "09:30", 15);
    assert.strictEqual(res.status, "PRESENT");
    assert.strictEqual(res.minutesLate, 0);
  });

  it("Scenario 11: Arrival within 15-minute grace period (09:44 AM) marked as PRESENT", () => {
    const punchTime = new Date();
    punchTime.setHours(9, 44, 0, 0);
    const res = evaluatePunctuality(punchTime, "09:30", 15);
    assert.strictEqual(res.status, "PRESENT");
  });

  it("Scenario 12: Arrival after grace period (09:52 AM) marked as LATE", () => {
    const punchTime = new Date();
    punchTime.setHours(9, 52, 0, 0);
    const res = evaluatePunctuality(punchTime, "09:30", 15);
    assert.strictEqual(res.status, "LATE");
    assert.strictEqual(res.minutesLate, 22);
  });

  it("Scenario 13: 9-hour shift marks isFullDay = true", () => {
    const checkIn = new Date("2026-10-18T09:30:00Z");
    const checkOut = new Date("2026-10-18T18:30:00Z");
    const hours = calculateWorkingHours(checkIn, checkOut, 8.0, 4.5);
    assert.strictEqual(hours.isFullDay, true);
    assert.strictEqual(hours.isHalfDay, false);
    assert.strictEqual(hours.displayHours, "9h 0m");
  });

  it("Scenario 14: 5-hour shift marks isHalfDay = true", () => {
    const checkIn = new Date("2026-10-18T09:30:00Z");
    const checkOut = new Date("2026-10-18T14:30:00Z");
    const hours = calculateWorkingHours(checkIn, checkOut, 8.0, 4.5);
    assert.strictEqual(hours.isFullDay, false);
    assert.strictEqual(hours.isHalfDay, true);
    assert.strictEqual(hours.displayHours, "5h 0m");
  });
});

describe("Phase 3 4-Tier RBAC Authorization for Attendance", () => {
  const superAdmin = { id: "emp_vsecure_001", role: "SUPER_ADMIN" as const };
  const hrAdmin = { id: "emp_vsecure_002", role: "HR_ADMIN" as const };
  const managerEng = {
    id: "emp_vsecure_003",
    role: "MANAGER" as const,
    departmentId: "dept_eng",
  };
  const empOps = {
    id: "emp_vsecure_004",
    role: "EMPLOYEE" as const,
    departmentId: "dept_ops",
  };

  it("Scenario 15: Super Admin Vishnu has unrestricted attendance permissions", () => {
    assert.strictEqual(hasPermission("SUPER_ADMIN", "ATTENDANCE:VIEW_ALL"), true);
    assert.strictEqual(hasPermission("SUPER_ADMIN", "ATTENDANCE:CORRECTION_APPROVE"), true);
    assert.strictEqual(hasPermission("SUPER_ADMIN", "ATTENDANCE:POLICY_MANAGE"), true);
    assert.strictEqual(canApproveCorrection(superAdmin), true);
    assert.strictEqual(canManageAttendancePolicy(superAdmin), true);
  });

  it("Scenario 16: HR Admin can view all attendance and approve corrections", () => {
    assert.strictEqual(hasPermission("HR_ADMIN", "ATTENDANCE:VIEW_ALL"), true);
    assert.strictEqual(hasPermission("HR_ADMIN", "ATTENDANCE:CORRECTION_APPROVE"), true);
    assert.strictEqual(canApproveCorrection(hrAdmin), true);
  });

  it("Scenario 17: Manager is restricted to own department records", () => {
    assert.strictEqual(hasPermission("MANAGER", "ATTENDANCE:VIEW_DEPT"), true);
    assert.strictEqual(hasPermission("MANAGER", "ATTENDANCE:VIEW_ALL"), false);
    assert.strictEqual(hasPermission("MANAGER", "ATTENDANCE:CORRECTION_APPROVE"), false);

    // Can access subordinate in dept_eng
    assert.strictEqual(
      canViewAttendance(managerEng, { id: "emp_sub_01", departmentId: "dept_eng" }),
      true
    );
    // Cannot access employee in dept_ops
    assert.strictEqual(
      canViewAttendance(managerEng, { id: "emp_vsecure_004", departmentId: "dept_ops" }),
      false
    );
  });

  it("Scenario 18: Employee can only view their own attendance", () => {
    assert.strictEqual(hasPermission("EMPLOYEE", "ATTENDANCE:VIEW_SELF"), true);
    assert.strictEqual(hasPermission("EMPLOYEE", "ATTENDANCE:VIEW_ALL"), false);
    assert.strictEqual(canViewAttendance(empOps, { id: "emp_vsecure_004" }), true);
    assert.strictEqual(canViewAttendance(empOps, { id: "emp_vsecure_001" }), false);
  });
});

describe("Regional Formats & Currency", () => {
  it("Scenario 19: Formats dates strictly as DD-MM-YYYY", () => {
    const formatted = formatDateDDMMYYYY(new Date("2026-10-18T00:00:00Z"));
    assert.strictEqual(formatted, "18-10-2026");
  });

  it("Scenario 20: Formats times strictly as 12-hour IST with AM/PM", () => {
    const sampleDate = new Date("2026-10-18T03:54:00Z"); // 09:24 AM IST
    const formatted = formatTime12HourIST(sampleDate);
    assert.match(formatted, /09:24 AM/);
  });

  it("Scenario 21: Formats compensation strictly in INR with Rupee symbol", () => {
    const formatted = formatINR(150000);
    assert.match(formatted, /₹\s*1,50,000/);
  });
});
