import { Role, EmploymentStatus } from "@vsecure/shared";

export interface EmployeeDirectoryItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: EmploymentStatus;
  designation: string;
  departmentId: string;
  departmentName: string;
  joiningDate: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  address: string;
  pan: string;
  aadhaarNumber: string;
  basicSalaryINR: number | null;
  hraINR: number | null;
  allowancesINR: number | null;
  grossSalaryINR: number | null;
  netSalaryINR: number | null;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  boundDeviceId: string | null;
  deviceModel: string | null;
  deviceBoundAt: string | null;
  verifiedDocsCount: number;
}

/**
 * Initial 25-capacity workforce directory dataset
 */
export const INITIAL_STAFF_DIRECTORY: EmployeeDirectoryItem[] = [
  {
    id: "emp_vsecure_001",
    employeeCode: "VS-001",
    fullName: "Vishnu",
    email: "vishnu@vsecuretechnologies.com",
    phone: "+91 98765 43210",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    designation: "Founder & Chief Architect",
    departmentId: "dept_eng",
    departmentName: "Engineering & Architecture",
    joiningDate: "01-01-2026",
    dateOfBirth: "15-05-1990",
    gender: "Male",
    bloodGroup: "O+",
    emergencyContact: "+91 98765 00001 (Vijay)",
    address: "Villa 12, Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
    pan: "ABCDE1234F",
    aadhaarNumber: "1234-5678-9012",
    basicSalaryINR: 150000,
    hraINR: 60000,
    allowancesINR: 40000,
    grossSalaryINR: 250000,
    netSalaryINR: 248000,
    bankName: "HDFC Bank",
    bankAccountNumber: "50100234567890",
    bankIFSC: "HDFC0001234",
    boundDeviceId: "android_pixel9pro_vsecure_001",
    deviceModel: "Google Pixel 9 Pro",
    deviceBoundAt: "01-01-2026",
    verifiedDocsCount: 4,
  },
  {
    id: "emp_vsecure_002",
    employeeCode: "VS-002",
    fullName: "Priya Sharma",
    email: "priya.sharma@vsecuretechnologies.com",
    phone: "+91 98765 43211",
    role: "HR_ADMIN",
    status: "ACTIVE",
    designation: "Lead HR Business Partner",
    departmentId: "dept_hr",
    departmentName: "People & HR",
    joiningDate: "01-02-2026",
    dateOfBirth: "22-08-1994",
    gender: "Female",
    bloodGroup: "B+",
    emergencyContact: "+91 98765 11111 (Kunal)",
    address: "HSR Layout Sector 2, Bengaluru, Karnataka",
    pan: "PQRSK5678L",
    aadhaarNumber: "2345-6789-0123",
    basicSalaryINR: 70000,
    hraINR: 28000,
    allowancesINR: 12000,
    grossSalaryINR: 110000,
    netSalaryINR: 108000,
    bankName: "ICICI Bank",
    bankAccountNumber: "000105001234",
    bankIFSC: "ICIC0000001",
    boundDeviceId: "android_galaxy_s24_002",
    deviceModel: "Samsung Galaxy S24 Ultra",
    deviceBoundAt: "01-02-2026",
    verifiedDocsCount: 3,
  },
  {
    id: "emp_vsecure_003",
    employeeCode: "VS-003",
    fullName: "Arjun Mehta",
    email: "arjun.mehta@vsecuretechnologies.com",
    phone: "+91 98765 43212",
    role: "MANAGER",
    status: "ACTIVE",
    designation: "Senior Cloud Architect",
    departmentId: "dept_eng",
    departmentName: "Engineering & Architecture",
    joiningDate: "01-02-2026",
    dateOfBirth: "10-11-1991",
    gender: "Male",
    bloodGroup: "A+",
    emergencyContact: "+91 98765 22222 (Anita)",
    address: "Whitefield Main Road, Bengaluru, Karnataka",
    pan: "MNBVC9876P",
    aadhaarNumber: "3456-7890-1234",
    basicSalaryINR: 110000,
    hraINR: 44000,
    allowancesINR: 26000,
    grossSalaryINR: 180000,
    netSalaryINR: 178000,
    bankName: "Axis Bank",
    bankAccountNumber: "91201005678901",
    bankIFSC: "UTIB0000123",
    boundDeviceId: "android_oneplus12_003",
    deviceModel: "OnePlus 12 5G",
    deviceBoundAt: "01-02-2026",
    verifiedDocsCount: 3,
  },
  {
    id: "emp_vsecure_004",
    employeeCode: "VS-004",
    fullName: "Kavita Nair",
    email: "kavita.nair@vsecuretechnologies.com",
    phone: "+91 98765 43213",
    role: "EMPLOYEE",
    status: "ACTIVE",
    designation: "Site Reliability Engineer",
    departmentId: "dept_ops",
    departmentName: "Cloud & Operations",
    joiningDate: "15-02-2026",
    dateOfBirth: "30-03-1996",
    gender: "Female",
    bloodGroup: "AB+",
    emergencyContact: "+91 98765 33333 (Suresh)",
    address: "Koramangala 4th Block, Bengaluru, Karnataka",
    pan: "ZXCVB4321M",
    aadhaarNumber: "4567-8901-2345",
    basicSalaryINR: 65000,
    hraINR: 26000,
    allowancesINR: 14000,
    grossSalaryINR: 105000,
    netSalaryINR: 103000,
    bankName: "State Bank of India",
    bankAccountNumber: "201050607080",
    bankIFSC: "SBIN0000456",
    boundDeviceId: "android_motoedge_004",
    deviceModel: "Motorola Edge 50 Pro",
    deviceBoundAt: "15-02-2026",
    verifiedDocsCount: 2,
  },
];
