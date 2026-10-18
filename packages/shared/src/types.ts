import { z } from "zod";

export const RoleSchema = z.enum(["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]);
export type Role = z.infer<typeof RoleSchema>;

export const EmploymentStatusSchema = z.enum(["ACTIVE", "ON_NOTICE", "INACTIVE", "TERMINATED"]);
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;

export const AttendanceStatusSchema = z.enum([
  "PRESENT",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "ON_LEAVE",
  "FIELD_DUTY",
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const AttendanceTypeSchema = z.enum([
  "OFFICE",
  "FIELD_DUTY",
  "CLIENT_SITE",
  "APPROVED_OFFSITE",
]);
export type AttendanceType = z.infer<typeof AttendanceTypeSchema>;

export const AttendanceReviewStatusSchema = z.enum([
  "AUTO_VERIFIED",
  "PENDING_REVIEW",
  "FLAGGED_SUSPICIOUS",
  "REJECTED",
]);
export type AttendanceReviewStatus = z.infer<typeof AttendanceReviewStatusSchema>;

export const CorrectionTypeSchema = z.enum([
  "MISSED_CHECK_IN",
  "MISSED_CHECK_OUT",
  "GPS_FAILURE",
  "INCORRECT_HOURS",
  "OFFSITE_EXEMPTION",
]);
export type CorrectionType = z.infer<typeof CorrectionTypeSchema>;

export const LeaveTypeSchema = z.enum([
  "CASUAL",
  "SICK",
  "EARNED",
  "UNPAID_LOP",
  "COMP_OFF",
]);
export type LeaveType = z.infer<typeof LeaveTypeSchema>;

export const ApprovalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const LeaveSessionSchema = z.enum(["FULL_DAY", "FIRST_HALF", "SECOND_HALF"]);
export type LeaveSession = z.infer<typeof LeaveSessionSchema>;

export const DocumentTypeSchema = z.enum([
  "PROFILE_PHOTO",
  "AADHAAR_CARD",
  "PAN_CARD",
  "EDUCATION_CERTIFICATE",
  "OFFER_LETTER",
  "EXPERIENCE_LETTER",
  "OTHER",
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const DocumentVerificationStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
]);
export type DocumentVerificationStatus = z.infer<typeof DocumentVerificationStatusSchema>;

export const PayrollStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "FINALIZED",
  "PAID",
  "REOPENED",
]);
export type PayrollStatus = z.infer<typeof PayrollStatusSchema>;

export const PaymentStatusSchema = z.enum([
  "NOT_PAID",
  "PROCESSING",
  "PAID",
  "PARTIALLY_PAID",
  "FAILED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const LopCalculationBasisSchema = z.enum(["CALENDAR_DAYS", "WORKING_DAYS"]);
export type LopCalculationBasis = z.infer<typeof LopCalculationBasisSchema>;

export const LoginCredentialsSchema = z.object({
  identifier: z.string().min(3, "Enter official email or Employee ID (e.g. VS-001)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  deviceId: z.string().optional(),
  deviceModel: z.string().optional(),
  isBiometric: z.boolean().optional(),
});
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;

export const OfficeLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Office name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive().default(100),
  isActive: z.boolean().default(true),
});
export type OfficeLocationInput = z.infer<typeof OfficeLocationSchema>;

export const DepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Department code must be 2-6 characters").max(6),
  description: z.string().optional(),
});
export type DepartmentInput = z.infer<typeof DepartmentSchema>;

export const DesignationSchema = z.object({
  id: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  title: z.string().min(2, "Designation title must be at least 2 characters"),
  code: z.string().optional(),
});
export type DesignationInput = z.infer<typeof DesignationSchema>;

// Step 1: Personal & Identity Schema
export const OnboardingStep1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid corporate email address"),
  phone: z.string().regex(/^\+91\s?[6-9]\d{9}$/, "Indian mobile number must be valid (+91 followed by 10 digits)"),
  dateOfBirth: z.string().min(10, "Date of birth is required (DD-MM-YYYY)"),
  gender: z.enum(["Male", "Female", "Non-Binary", "Prefer Not to Say"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
  emergencyContactName: z.string().min(2, "Emergency contact name required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact number required"),
  address: z.string().min(8, "Residential address required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid Indian PAN format (e.g. ABCDE1234F)").optional().or(z.literal("")),
  aadhaarNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhaar must be in format XXXX-XXXX-XXXX").optional().or(z.literal("")),
});
export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;

// Step 2: Employment & Role Schema
export const OnboardingStep2Schema = z.object({
  employeeCode: z.string().regex(/^VS-\d{3,5}$/, "Employee code format must be VS-001"),
  joiningDate: z.string().min(10, "Joining date is required (DD-MM-YYYY)"),
  departmentId: z.string().min(1, "Department selection is required"),
  designation: z.string().min(2, "Designation is required"),
  role: RoleSchema.default("EMPLOYEE"),
  reportingManagerId: z.string().nullable().optional(),
  officeLocationId: z.string().min(1, "Assigned office location is required"),
});
export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;

// Step 3: Compensation (INR) Schema
export const OnboardingStep3Schema = z.object({
  monthlyGrossINR: z.number().positive("Monthly gross CTC must be greater than 0"),
  basicSalaryINR: z.number().positive(),
  hraINR: z.number().nonnegative(),
  allowancesINR: z.number().nonnegative(),
  pfDeductionINR: z.number().nonnegative().default(1800),
  profTaxINR: z.number().nonnegative().default(200),
  pfApplicable: z.boolean().default(true),
  esiApplicable: z.boolean().default(false),
  bankName: z.string().min(2, "Bank name required"),
  bankAccountNumber: z.string().min(9, "Valid bank account number required"),
  bankIFSC: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid Indian IFSC format (e.g. HDFC0001234)"),
});
export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>;

// Full Employee Complete Onboarding Schema
export const EmployeeOnboardingSchema = OnboardingStep1Schema.merge(OnboardingStep2Schema).merge(
  OnboardingStep3Schema
);
export type EmployeeOnboardingInput = z.infer<typeof EmployeeOnboardingSchema>;

export const DeviceChangeRequestSchema = z.object({
  employeeId: z.string().min(1),
  newDeviceId: z.string().min(1, "Hardware Device ID is required"),
  newDeviceModel: z.string().min(1, "Device model name is required"),
  reason: z.string().min(10, "Please provide reason for device change (at least 10 characters)"),
});
export type DeviceChangeRequestInput = z.infer<typeof DeviceChangeRequestSchema>;

export const ClientSiteSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Client site name must be at least 2 characters"),
  clientName: z.string().min(2, "Client company name is required"),
  workOrderCode: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive().default(100),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});
export type ClientSiteInput = z.infer<typeof ClientSiteSchema>;

export const FieldVisitSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1),
  clientSiteId: z.string().optional(),
  clientName: z.string().min(2, "Client or Site name is required"),
  workOrderNumber: z.string().optional(),
  checkInTime: z.string().or(z.date()),
  checkOutTime: z.string().or(z.date()).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gpsAccuracyMeters: z.number().nonnegative().optional(),
  visitNotes: z.string().min(3, "Please record visit summary/notes"),
  sitePhotoUrl: z.string().optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("COMPLETED"),
});
export type FieldVisitInput = z.infer<typeof FieldVisitSchema>;

export const AttendanceCheckInSchema = z.object({
  employeeId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gpsAccuracyMeters: z.number().nonnegative(),
  deviceId: z.string().min(1, "Device ID required for validation"),
  attendanceType: AttendanceTypeSchema.default("OFFICE"),
  clientSiteId: z.string().optional(),
  selfieUrl: z.string().optional(),
  isMockLocation: z.boolean().default(false),
  remarks: z.string().optional(),
});
export type AttendanceCheckInInput = z.infer<typeof AttendanceCheckInSchema>;

export const AttendanceCheckOutSchema = z.object({
  employeeId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gpsAccuracyMeters: z.number().nonnegative(),
  deviceId: z.string().min(1, "Device ID required"),
  isMockLocation: z.boolean().default(false),
  remarks: z.string().optional(),
});
export type AttendanceCheckOutInput = z.infer<typeof AttendanceCheckOutSchema>;

export const AttendanceCorrectionSchema = z.object({
  employeeId: z.string().min(1),
  attendanceLogId: z.string().optional(),
  attendanceDate: z.string().min(10, "Date required in DD-MM-YYYY format"),
  requestType: CorrectionTypeSchema.default("MISSED_CHECK_IN"),
  requestedCheckInTime: z.string().min(5, "Requested check-in time (e.g. 09:30 AM) required"),
  requestedCheckOutTime: z.string().optional(),
  reason: z.string().min(10, "Please provide detailed justification (min 10 characters)"),
  supportingDocUrl: z.string().optional(),
});
export type AttendanceCorrectionInput = z.infer<typeof AttendanceCorrectionSchema>;

export const AttendancePolicySchema = z.object({
  defaultGeofenceRadiusMeters: z.number().int().min(20).max(1000).default(100),
  shiftStartTime: z.string().default("09:30"),
  shiftEndTime: z.string().default("18:30"),
  gracePeriodMinutes: z.number().int().min(0).max(60).default(15),
  minHoursFullDay: z.number().min(4).max(12).default(8.0),
  minHoursHalfDay: z.number().min(2).max(6).default(4.5),
  requireSelfie: z.boolean().default(false),
  blockMockLocation: z.boolean().default(true),
  allowFieldDutyCheckIn: z.boolean().default(true),
});
export type AttendancePolicyInput = z.infer<typeof AttendancePolicySchema>;

export interface AttendanceRecordItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  attendanceDate: string; // DD-MM-YYYY
  checkInTime: string;    // 12-hour IST (e.g. 09:28 AM)
  checkOutTime: string | null;
  totalDuration: string | null; // e.g. "8h 45m"
  status: AttendanceStatus;
  attendanceType: AttendanceType;
  checkInLat: number;
  checkInLng: number;
  checkOutLat: number | null;
  checkOutLng: number | null;
  gpsAccuracyMeters: number;
  distanceFromOfficeMeters: number;
  isWithinGeofence: boolean;
  isMockLocation: boolean;
  reviewStatus: AttendanceReviewStatus;
  rejectionReason: string | null;
  geofenceRadius: number;
  locationName: string;
  selfieUrl: string | null;
  fieldVisitsCount: number;
}

export interface AttendanceDashboardStats {
  totalActiveEmployees: number;
  presentToday: number;
  lateArrivals: number;
  onLeaveToday: number;
  fieldDutyToday: number;
  absentToday: number;
  pendingCorrections: number;
  locationExceptions: number;
}

export const LeaveApplicationSchema = z.object({
  employeeId: z.string().optional(),
  leaveType: LeaveTypeSchema,
  startDate: z.string().min(10, "Start date required in DD-MM-YYYY format"),
  endDate: z.string().min(10, "End date required in DD-MM-YYYY format"),
  isHalfDay: z.boolean().default(false),
  halfDaySession: LeaveSessionSchema.optional(),
  totalDays: z.number().positive("Total leave days must be greater than zero"),
  reason: z.string().min(5, "Please provide a valid reason (min 5 characters)"),
  supportingDocumentUrl: z.string().optional(),
});
export type LeaveApplicationInput = z.infer<typeof LeaveApplicationSchema>;

export const LeaveTypeConfigSchema = z.object({
  code: z.string().min(2).max(6),
  name: z.string().min(2),
  description: z.string().optional(),
  isPaid: z.boolean().default(true),
  annualQuota: z.number().nonnegative(),
  monthlyAccrual: z.number().nonnegative().default(1.0),
  carryForwardMax: z.number().nonnegative().default(0.0),
  minNoticeDays: z.number().int().nonnegative().default(1),
  maxConsecutiveDays: z.number().int().positive().default(7),
  allowHalfDay: z.boolean().default(true),
  requiresDocument: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type LeaveTypeConfigInput = z.infer<typeof LeaveTypeConfigSchema>;

export const LeavePolicyConfigSchema = z.object({
  excludeWeekends: z.boolean().default(true),
  excludeHolidays: z.boolean().default(true),
  managerApprovalRequired: z.boolean().default(true),
  hrApprovalRequired: z.boolean().default(false),
  allowNegativeBalance: z.boolean().default(false),
});
export type LeavePolicyConfigInput = z.infer<typeof LeavePolicyConfigSchema>;

export const PublicHolidaySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  date: z.string().min(10), // DD-MM-YYYY
  year: z.number().int(),
  isOptional: z.boolean().default(false),
});
export type PublicHolidayInput = z.infer<typeof PublicHolidaySchema>;

export interface LeaveBalanceItem {
  id?: string;
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  code: string;
  name: string;
  isPaid: boolean;
  allocated: number;
  accrued: number;
  carriedForward: number;
  used: number;
  pending: number;
  remaining: number; // available
}

export interface LeaveRecordItem {
  id: string;
  referenceId: string; // e.g. "LV-2026-001"
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  reportingManagerName: string;
  leaveType: LeaveType;
  leaveTypeName: string;
  isPaid: boolean;
  startDate: string; // DD-MM-YYYY
  endDate: string;   // DD-MM-YYYY
  isHalfDay: boolean;
  halfDaySession?: string | null;
  totalDays: number;
  reason: string;
  supportingDocumentUrl?: string | null;
  status: ApprovalStatus;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  actionedAt?: string | null;
  cancellationReason?: string | null;
  isCancelled: boolean;
  createdAt: string;
}

export interface LeaveTransactionItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  year: number;
  leaveType: LeaveType;
  transactionType: "ALLOCATION" | "DEBIT" | "CREDIT" | "ADJUSTMENT" | "CANCELLATION";
  days: number;
  balanceAfter: number;
  leaveRequestId?: string | null;
  remarks: string;
  actionedBy: string;
  createdAt: string;
}

export interface LeaveDashboardStats {
  totalLeaveRequests: number;
  pendingApprovals: number;
  approvedRequests: number;
  rejectedRequests: number;
  employeesOnLeaveToday: number;
  upcomingAbsences: number;
  unpaidLopDaysMonth: number;
}

export const LeaveRequestSchema = LeaveApplicationSchema;
export type LeaveRequestInput = LeaveApplicationInput;

export const PayrollSummarySchema = z.object({
  totalEmployees: z.number().int().nonnegative(),
  presentToday: z.number().int().nonnegative(),
  onLeaveToday: z.number().int().nonnegative(),
  monthlyPayrollEstimateINR: z.number().nonnegative(),
  activeGeofencesCount: z.number().int().nonnegative(),
});
export type PayrollSummary = z.infer<typeof PayrollSummarySchema>;

export interface SalaryComponentInput {
  basicSalaryINR: number;
  hraINR: number;
  conveyanceINR?: number;
  specialAllowanceINR?: number;
  overtimeHours?: number;
  overtimeHourlyRateINR?: number;
  incentivesINR?: number;
  bonusINR?: number;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
  profTaxINR?: number;
  otherDeductionsINR?: number;
}

export interface PayrollCalculationInput {
  employeeId: string;
  month: number; // 1-12
  year: number;
  calendarDays: number;
  workingDays: number;
  presentDays: number;
  lateArrivalDays?: number;
  halfDays?: number;
  paidLeaveDays: number;
  unpaidAbsenceDays: number;
  lopDays: number;
  lopBasis: LopCalculationBasis;
  salary: SalaryComponentInput;
}

export interface PayrollCalculationResult {
  calendarDays: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;
  dailyGrossINR: number;
  basicSalaryINR: number;
  hraINR: number;
  conveyanceINR: number;
  specialAllowanceINR: number;
  overtimePayINR: number;
  incentivesINR: number;
  bonusINR: number;
  grossEarningsINR: number;
  pfEmployeeINR: number;
  esiEmployeeINR: number;
  profTaxINR: number;
  lopDeductionINR: number;
  otherDeductionsINR: number;
  totalDeductions: number;
  pfEmployerINR: number;
  esiEmployerINR: number;
  totalEmployerCostINR: number;
  netPayableINR: number;
}

export interface PayrollRecordItem {
  id: string;
  payrollCycleId?: string | null;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string;
  departmentName: string;
  designation: string;
  joiningDate: string; // DD-MM-YYYY
  month: number;
  year: number;
  status: PayrollStatus;
  paymentStatus: PaymentStatus;
  calendarDays: number;
  workingDays: number;
  presentDays: number;
  lateArrivalDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidAbsenceDays: number;
  lopDays: number;
  overtimeHours: number;
  basicSalaryINR: number;
  hraINR: number;
  conveyanceINR: number;
  specialAllowanceINR: number;
  overtimePayINR: number;
  incentivesINR: number;
  bonusINR: number;
  grossEarningsINR: number;
  pfEmployeeINR: number;
  esiEmployeeINR: number;
  profTaxINR: number;
  lopDeductionINR: number;
  otherDeductionsINR: number;
  totalDeductions: number;
  pfEmployerINR: number;
  esiEmployerINR: number;
  totalEmployerCostINR: number;
  netPayableINR: number;
  isPaid: boolean;
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paidAmountINR?: number | null;
  paymentRemarks?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIFSC?: string | null;
  payslipPdfUrl?: string | null;
  payslipNumber?: string | null;
  processedBy?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollCycleItem {
  id: string;
  month: number;
  year: number;
  status: PayrollStatus;
  totalEmployees: number;
  totalGrossINR: number;
  totalDeductionsINR: number;
  totalEmployerContributionsINR: number;
  totalNetPayableINR: number;
  lopCalculationBasis: LopCalculationBasis;
  processedBy?: string | null;
  reviewedBy?: string | null;
  approvedBy?: string | null;
  finalizedAt?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  recordsCount?: number;
}

export interface PayrollDashboardStats {
  totalActiveEmployees: number;
  employeesIncluded: number;
  totalGrossEarningsINR: number;
  totalEmployeeDeductionsINR: number;
  totalEmployerContributionsINR: number;
  totalNetSalaryPayableINR: number;
  pendingReviewCount: number;
  pendingApprovalCount: number;
  finalizedCount: number;
  paidCount: number;
  exceptionsCount: number;
  currentCycleStatus: PayrollStatus;
  currentCycleId?: string | null;
}

export interface BankTransferExportItem {
  beneficiaryName: string;
  beneficiaryAccount: string;
  ifscCode: string;
  amountINR: number;
  paymentNarration: string;
  employeeCode: string;
  department: string;
  paymentReference: string;
}

