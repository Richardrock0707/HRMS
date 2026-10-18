/**
 * Haversine formula to calculate exact GPS distance in meters
 * between an employee's Android phone and a VSecure office location
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
}

/**
 * Checks whether given coordinates are within the office geofence radius
 */
export function isWithinGeofence(
  employeeLat: number,
  employeeLng: number,
  officeLat: number,
  officeLng: number,
  radiusMeters = 100
): boolean {
  const distance = calculateDistanceMeters(employeeLat, employeeLng, officeLat, officeLng);
  return distance <= radiusMeters;
}

/**
 * Returns a detailed geofence evaluation result with status and human-readable feedback
 */
export function evaluateGeofenceStatus(
  employeeLat: number,
  employeeLng: number,
  officeLat: number,
  officeLng: number,
  radiusMeters = 100
): {
  isWithin: boolean;
  distanceMeters: number;
  radiusMeters: number;
  accuracyStatus: "INSIDE_PREMISES" | "BORDERLINE" | "OUTSIDE_PERIMETER";
  message: string;
} {
  const distance = calculateDistanceMeters(employeeLat, employeeLng, officeLat, officeLng);
  const isWithin = distance <= radiusMeters;

  let accuracyStatus: "INSIDE_PREMISES" | "BORDERLINE" | "OUTSIDE_PERIMETER";
  let message: string;

  if (distance <= radiusMeters * 0.8) {
    accuracyStatus = "INSIDE_PREMISES";
    message = `Within office perimeter (${distance}m from center)`;
  } else if (distance <= radiusMeters) {
    accuracyStatus = "BORDERLINE";
    message = `Near office boundary (${distance}m of ${radiusMeters}m allowable radius)`;
  } else {
    accuracyStatus = "OUTSIDE_PERIMETER";
    message = `Outside authorized office geofence (${distance}m away, exceeds ${radiusMeters}m limit)`;
  }

  return {
    isWithin,
    distanceMeters: distance,
    radiusMeters,
    accuracyStatus,
    message,
  };
}

/**
 * Evaluates GPS accuracy quality in meters
 */
export function evaluateGpsAccuracy(accuracyMeters: number): {
  isAcceptable: boolean;
  quality: "HIGH_PRECISION" | "ACCEPTABLE" | "LOW_ACCURACY";
  message: string;
} {
  if (accuracyMeters <= 20) {
    return {
      isAcceptable: true,
      quality: "HIGH_PRECISION",
      message: `Excellent GPS fix (±${Math.round(accuracyMeters)}m precision)`,
    };
  }
  if (accuracyMeters <= 50) {
    return {
      isAcceptable: true,
      quality: "ACCEPTABLE",
      message: `Standard GPS fix (±${Math.round(accuracyMeters)}m accuracy)`,
    };
  }
  return {
    isAcceptable: false,
    quality: "LOW_ACCURACY",
    message: `Weak GPS signal (±${Math.round(accuracyMeters)}m). Move to an open area or window for a better satellite lock.`,
  };
}

/**
 * Multi-layer anti-spoofing and location risk evaluation
 */
export function evaluateLocationRisk(params: {
  isMockLocation: boolean;
  distanceMeters: number;
  radiusMeters: number;
  accuracyMeters: number;
  isDeviceBound: boolean;
}): {
  reviewStatus: "AUTO_VERIFIED" | "PENDING_REVIEW" | "FLAGGED_SUSPICIOUS" | "REJECTED";
  isAllowed: boolean;
  reason: string;
} {
  // If Android reported a mock location provider (fake GPS app)
  if (params.isMockLocation) {
    return {
      reviewStatus: "FLAGGED_SUSPICIOUS",
      isAllowed: false,
      reason: "Mock GPS / location spoofing tool detected on Android device.",
    };
  }

  // If outside allowable perimeter (including 20m GPS accuracy tolerance buffer)
  if (params.distanceMeters > params.radiusMeters + 20) {
    return {
      reviewStatus: "REJECTED",
      isAllowed: false,
      reason: `Location is ${params.distanceMeters}m from center (exceeds ${params.radiusMeters}m geofence).`,
    };
  }

  // If GPS accuracy is extremely degraded (> 75m)
  if (params.accuracyMeters > 75) {
    return {
      reviewStatus: "PENDING_REVIEW",
      isAllowed: true,
      reason: `Degraded GPS accuracy (±${Math.round(params.accuracyMeters)}m). Flagged for supervisor verification.`,
    };
  }

  return {
    reviewStatus: "AUTO_VERIFIED",
    isAllowed: true,
    reason: `Verified inside perimeter (${params.distanceMeters}m from center, ±${Math.round(params.accuracyMeters)}m accuracy).`,
  };
}

/**
 * Evaluates shift punctuality against IST work shift
 * e.g., shiftStartTime = "09:30", gracePeriodMinutes = 15 => Late threshold is 09:45 AM
 */
export function evaluatePunctuality(
  checkInDate: Date,
  shiftStartTime = "09:30",
  gracePeriodMinutes = 15
): {
  status: "PRESENT" | "LATE";
  minutesLate: number;
  message: string;
} {
  // Extract IST hours & minutes
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = istFormatter.formatToParts(checkInDate);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  const checkInMinutes = hour * 60 + minute;

  const [shiftHour, shiftMin] = shiftStartTime.split(":").map((v) => parseInt(v, 10));
  const shiftStartMinutes = (shiftHour || 9) * 60 + (shiftMin || 30);
  const lateThresholdMinutes = shiftStartMinutes + gracePeriodMinutes;

  if (checkInMinutes <= lateThresholdMinutes) {
    return {
      status: "PRESENT",
      minutesLate: 0,
      message: "On-time arrival within shift grace period.",
    };
  }

  const diff = checkInMinutes - shiftStartMinutes;
  return {
    status: "LATE",
    minutesLate: diff,
    message: `Late arrival (${diff} mins after shift start ${shiftStartTime}).`,
  };
}

/**
 * Calculates working hours, duration string, and half-day vs full-day status
 */
export function calculateWorkingHours(
  checkInTime: Date,
  checkOutTime: Date,
  minHoursFullDay = 8.0,
  minHoursHalfDay = 4.5
): {
  totalMinutes: number;
  totalHoursDecimal: number;
  displayHours: string;
  isFullDay: boolean;
  isHalfDay: boolean;
} {
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalHoursDecimal = Number((totalMinutes / 60).toFixed(2));

  const displayHours = `${hours}h ${mins}m`;
  const isFullDay = totalHoursDecimal >= minHoursFullDay;
  const isHalfDay = !isFullDay && totalHoursDecimal >= minHoursHalfDay;

  return {
    totalMinutes,
    totalHoursDecimal,
    displayHours,
    isFullDay,
    isHalfDay,
  };
}
