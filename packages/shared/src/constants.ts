/**
 * VSecure Technologies HRMS - Global Constants & Regional Configurations
 */

export const COMPANY_NAME = "VSecure Technologies";
export const APP_NAME = "VSecure HRMS";
export const ADMIN_NAME = "Vishnu";
export const SUPER_ADMIN_CODE = "VS-001";
export const SUPER_ADMIN_EMAIL = "vishnu@vsecuretechnologies.com";
export const INITIAL_CAPACITY = 25;

export const TIMEZONE = "Asia/Kolkata";
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
export const LOCALE_IN = "en-IN";
export const DATE_FORMAT = "DD-MM-YYYY";
export const TIME_FORMAT = "12-hour";

export const VSECURE_CONFIG = {
  projectName: "VSecure Technologies HRMS",
  appName: APP_NAME,
  companyName: COMPANY_NAME,
  administrator: ADMIN_NAME,
  superAdminCode: SUPER_ADMIN_CODE,
  superAdminEmail: SUPER_ADMIN_EMAIL,
  currency: CURRENCY,
  currencySymbol: CURRENCY_SYMBOL,
  timezone: TIMEZONE,
  locale: LOCALE_IN,
  dateFormat: DATE_FORMAT,
  timeFormat: TIME_FORMAT,
  initialCapacity: INITIAL_CAPACITY,
  defaultGeofenceRadiusMeters: 100,
  defaultWorkShift: {
    startTime: "09:30 AM",
    endTime: "06:30 PM",
    gracePeriodMinutes: 15,
  },
} as const;

export const DEFAULT_OFFICE_COORDINATES = {
  id: "loc_vsecure_hq",
  name: "VSecure Technologies HQ",
  address: "Tech Park Campus, Outer Ring Road, Bengaluru, Karnataka 560103",
  latitude: 12.9352,
  longitude: 77.6946,
  radiusMeters: 100,
} as const;

export const DEFAULT_ATTENDANCE_POLICY = {
  defaultGeofenceRadiusMeters: 100,
  shiftStartTime: "09:30",
  shiftEndTime: "18:30",
  gracePeriodMinutes: 15,
  minHoursFullDay: 8.0,
  minHoursHalfDay: 4.5,
  requireSelfie: false,
  blockMockLocation: true,
  allowFieldDutyCheckIn: true,
} as const;

export const DEFAULT_CLIENT_SITES = [
  {
    id: "site_client_001",
    name: "Infosys Electronics City Campus",
    clientName: "Infosys Limited",
    workOrderCode: "WO-INF-2026-09",
    address: "Plot 44, Electronic City Phase 1, Hosur Road, Bengaluru 560100",
    latitude: 12.8452,
    longitude: 77.6602,
    radiusMeters: 150,
    contactPerson: "Rajesh Kannan (Site Manager)",
    contactPhone: "+91 98450 12345",
    isActive: true,
  },
  {
    id: "site_client_002",
    name: "Wipro Sarjapur Innovation Hub",
    clientName: "Wipro Technologies",
    workOrderCode: "WO-WIP-2026-14",
    address: "Doddakannelli, Sarjapur Road, Bengaluru 560035",
    latitude: 12.9081,
    longitude: 77.6874,
    radiusMeters: 120,
    contactPerson: "Deepa Narayanan (Client Lead)",
    contactPhone: "+91 98801 54321",
    isActive: true,
  },
  {
    id: "site_client_003",
    name: "TCS Whitefield Cloud Center",
    clientName: "Tata Consultancy Services",
    workOrderCode: "WO-TCS-2026-22",
    address: "Vydehi Campus, EPIP Zone, Whitefield, Bengaluru 560066",
    latitude: 12.9784,
    longitude: 77.7289,
    radiusMeters: 100,
    contactPerson: "Manoj Kumar (Infrastructure Head)",
    contactPhone: "+91 98452 98765",
    isActive: true,
  },
] as const;

export const DEMO_CREDENTIALS = [
  {
    role: "SUPER_ADMIN" as const,
    code: "VS-001",
    name: "Vishnu",
    email: "vishnu@vsecuretechnologies.com",
    title: "Super Administrator (Founder)",
    badge: "Full System Authority",
  },
  {
    role: "HR_ADMIN" as const,
    code: "VS-002",
    name: "Priya Sharma",
    email: "priya.sharma@vsecuretechnologies.com",
    title: "HR Admin (Lead HRBP)",
    badge: "Staff & Salary Management",
  },
  {
    role: "MANAGER" as const,
    code: "VS-003",
    name: "Arjun Mehta",
    email: "arjun.mehta@vsecuretechnologies.com",
    title: "Department Manager (Engineering)",
    badge: "Team-Scoped Access",
  },
  {
    role: "EMPLOYEE" as const,
    code: "VS-004",
    name: "Kavita Nair",
    email: "kavita.nair@vsecuretechnologies.com",
    title: "Employee (SRE)",
    badge: "Self-Service Only",
  },
];

export const DEFAULT_LEAVE_TYPES = [
  {
    code: "CL",
    name: "Casual Leave",
    leaveType: "CASUAL" as const,
    description: "For personal errands, family commitments, and unplanned emergencies",
    isPaid: true,
    annualQuota: 12,
    monthlyAccrual: 1.0,
    carryForwardMax: 0,
    minNoticeDays: 1,
    maxConsecutiveDays: 3,
    allowHalfDay: true,
    requiresDocument: false,
    isActive: true,
  },
  {
    code: "SL",
    name: "Sick Leave",
    leaveType: "SICK" as const,
    description: "For medical ailments, doctor appointments, and recovery",
    isPaid: true,
    annualQuota: 10,
    monthlyAccrual: 0.83,
    carryForwardMax: 0,
    minNoticeDays: 0,
    maxConsecutiveDays: 5,
    allowHalfDay: true,
    requiresDocument: true, // required if > 2 days
    isActive: true,
  },
  {
    code: "EL",
    name: "Earned Leave",
    leaveType: "EARNED" as const,
    description: "Privilege leave for planned vacations and extended breaks",
    isPaid: true,
    annualQuota: 15,
    monthlyAccrual: 1.25,
    carryForwardMax: 10,
    minNoticeDays: 3,
    maxConsecutiveDays: 12,
    allowHalfDay: false,
    requiresDocument: false,
    isActive: true,
  },
  {
    code: "LOP",
    name: "Loss of Pay (Unpaid)",
    leaveType: "UNPAID_LOP" as const,
    description: "Approved unpaid absence subjected to daily gross salary deduction in Phase 5 Payroll",
    isPaid: false,
    annualQuota: 0,
    monthlyAccrual: 0,
    carryForwardMax: 0,
    minNoticeDays: 1,
    maxConsecutiveDays: 30,
    allowHalfDay: true,
    requiresDocument: false,
    isActive: true,
  },
  {
    code: "COMP",
    name: "Compensatory Off",
    leaveType: "COMP_OFF" as const,
    description: "Credit awarded for working on weekends or recognized public holidays",
    isPaid: true,
    annualQuota: 0,
    monthlyAccrual: 0,
    carryForwardMax: 5,
    minNoticeDays: 1,
    maxConsecutiveDays: 2,
    allowHalfDay: true,
    requiresDocument: false,
    isActive: true,
  },
] as const;

export const DEFAULT_LEAVE_POLICY = {
  excludeWeekends: true,
  excludeHolidays: true,
  managerApprovalRequired: true,
  hrApprovalRequired: false,
  allowNegativeBalance: false,
} as const;

export const DEFAULT_2026_HOLIDAYS = [
  { name: "Republic Day", date: "26-01-2026", year: 2026, isOptional: false },
  { name: "Ugadi / Gudi Padwa", date: "19-03-2026", year: 2026, isOptional: false },
  { name: "May Day / International Labour Day", date: "01-05-2026", year: 2026, isOptional: false },
  { name: "Independence Day", date: "15-08-2026", year: 2026, isOptional: false },
  { name: "Mahatma Gandhi Jayanti", date: "02-10-2026", year: 2026, isOptional: false },
  { name: "Kannada Rajyotsava", date: "01-11-2026", year: 2026, isOptional: false },
  { name: "Deepavali (Diwali)", date: "08-11-2026", year: 2026, isOptional: false },
  { name: "Christmas Day", date: "25-12-2026", year: 2026, isOptional: false },
] as const;
