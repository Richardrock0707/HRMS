import {
  PrismaClient,
  Role,
  EmploymentStatus,
  AttendanceStatus,
  LeaveType,
  DocumentType,
  DocumentVerificationStatus,
  ApprovalStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VSecure Technologies HRMS Phase 2 Database...");

  // 1. Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: "vsecure" },
    update: {},
    create: {
      name: "VSecure Technologies",
      slug: "vsecure",
      superAdminName: "Vishnu",
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
  });
  console.log(`✓ Organization: ${organization.name}`);

  // 2. Create HQ Geofenced Office Location
  const hqLocation = await prisma.officeLocation.upsert({
    where: { id: "loc_vsecure_hq" },
    update: {},
    create: {
      id: "loc_vsecure_hq",
      organizationId: organization.id,
      name: "VSecure Technologies HQ",
      address: "Tech Park Campus, Outer Ring Road, Bengaluru, Karnataka 560103",
      latitude: 12.9352,
      longitude: 77.6946,
      radiusMeters: 100, // 100m geo-fence perimeter
      isActive: true,
    },
  });
  console.log(`✓ Office Geofence: ${hqLocation.name}`);

  // 3. Create Core Departments
  const deptEngineering = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Engineering & Architecture",
      code: "ENG",
      description: "Cloud, mobile, security & infrastructure engineering",
    },
  });

  const deptHR = await prisma.department.upsert({
    where: { code: "HR" },
    update: {},
    create: {
      organizationId: organization.id,
      name: "People & Human Resources",
      code: "HR",
      description: "Talent acquisition, operations, payroll & compliance",
    },
  });

  const deptOperations = await prisma.department.upsert({
    where: { code: "OPS" },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Cloud & Operations",
      code: "OPS",
      description: "24/7 SRE, network reliability and platform support",
    },
  });

  const deptSales = await prisma.department.upsert({
    where: { code: "SBD" },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Enterprise Sales",
      code: "SBD",
      description: "Enterprise account management and sales",
    },
  });
  console.log("✓ Core Departments seeded: ENG, HR, OPS, SBD");

  // 4. Create Core Designations
  const desigChiefArchitect = await prisma.designation.upsert({
    where: {
      departmentId_title: {
        departmentId: deptEngineering.id,
        title: "Founder & Chief Architect",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptEngineering.id,
      title: "Founder & Chief Architect",
      code: "FND-01",
    },
  });

  const desigLeadHR = await prisma.designation.upsert({
    where: {
      departmentId_title: {
        departmentId: deptHR.id,
        title: "Lead HR Business Partner",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptHR.id,
      title: "Lead HR Business Partner",
      code: "HR-01",
    },
  });

  const desigCloudArchitect = await prisma.designation.upsert({
    where: {
      departmentId_title: {
        departmentId: deptEngineering.id,
        title: "Senior Cloud Architect",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptEngineering.id,
      title: "Senior Cloud Architect",
      code: "ENG-02",
    },
  });

  const desigSRE = await prisma.designation.upsert({
    where: {
      departmentId_title: {
        departmentId: deptOperations.id,
        title: "Site Reliability Engineer",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptOperations.id,
      title: "Site Reliability Engineer",
      code: "OPS-01",
    },
  });
  console.log("✓ Core Designations seeded");

  // Default hashed password for demo: "VSecure@2026"
  // Simulated SHA-256 / bcrypt hash
  const defaultPasswordHash = "$2b$12$k8Y1jE.P9uY9uU.X7sV.1eQ2w3e4r5t6y7u8i9o0p1a2s3d4f5g6";

  // 5. Seed Super Administrator "Vishnu" (VS-001)
  const superAdmin = await prisma.employee.upsert({
    where: { employeeCode: "VS-001" },
    update: {
      designationRefId: desigChiefArchitect.id,
      bloodGroup: "O+",
      emergencyContactName: "Vijay (Brother)",
      emergencyContactPhone: "+91 98765 00001",
      address: "Villa 12, Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
      pan: "ABCDE1234F",
      aadhaarNumber: "1234-5678-9012",
      bankName: "HDFC Bank",
      bankAccountNumber: "50100234567890",
      bankIFSC: "HDFC0001234",
      deviceModel: "Google Pixel 9 Pro",
      deviceBoundAt: new Date("2026-01-01T09:00:00Z"),
      lastLoginAt: new Date(),
    },
    create: {
      id: "emp_vsecure_001",
      organizationId: organization.id,
      employeeCode: "VS-001",
      fullName: "Vishnu",
      email: "vishnu@vsecuretechnologies.com",
      phone: "+91 98765 43210",
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      status: EmploymentStatus.ACTIVE,
      designation: "Founder & Chief Architect",
      designationRefId: desigChiefArchitect.id,
      joiningDate: new Date("2026-01-01T00:00:00Z"),
      dateOfBirth: new Date("1990-05-15T00:00:00Z"),
      gender: "Male",
      bloodGroup: "O+",
      emergencyContactName: "Vijay (Brother)",
      emergencyContactPhone: "+91 98765 00001",
      address: "Villa 12, Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
      pan: "ABCDE1234F",
      aadhaarNumber: "1234-5678-9012",
      basicSalaryINR: 150000.0,
      hraINR: 60000.0,
      allowancesINR: 40000.0,
      pfDeductionINR: 1800.0,
      profTaxINR: 200.0,
      pfApplicable: true,
      esiApplicable: false,
      bankName: "HDFC Bank",
      bankAccountNumber: "50100234567890",
      bankIFSC: "HDFC0001234",
      boundDeviceId: "android_pixel9pro_vsecure_001",
      deviceModel: "Google Pixel 9 Pro",
      deviceBoundAt: new Date("2026-01-01T09:00:00Z"),
      departmentId: deptEngineering.id,
      officeLocationId: hqLocation.id,
    },
  });
  console.log(`✓ Super Administrator: ${superAdmin.fullName} (${superAdmin.employeeCode})`);

  // 6. Seed Sample Initial Employees (VS-002, VS-003, VS-004)
  const initialStaff = [
    {
      code: "VS-002",
      name: "Priya Sharma",
      email: "priya.sharma@vsecuretechnologies.com",
      phone: "+91 98765 43211",
      role: Role.HR_ADMIN,
      deptId: deptHR.id,
      desigId: desigLeadHR.id,
      designation: "Lead HR Business Partner",
      basic: 70000.0,
      hra: 28000.0,
      allowance: 12000.0,
      pan: "PQRSK5678L",
      aadhaar: "2345-6789-0123",
      blood: "B+",
      dob: "1994-08-22",
      gender: "Female",
      device: "android_galaxy_s24_002",
      deviceModel: "Samsung Galaxy S24 Ultra",
    },
    {
      code: "VS-003",
      name: "Arjun Mehta",
      email: "arjun.mehta@vsecuretechnologies.com",
      phone: "+91 98765 43212",
      role: Role.MANAGER,
      deptId: deptEngineering.id,
      desigId: desigCloudArchitect.id,
      designation: "Senior Cloud Architect",
      basic: 110000.0,
      hra: 44000.0,
      allowance: 26000.0,
      pan: "MNBVC9876P",
      aadhaar: "3456-7890-1234",
      blood: "A+",
      dob: "1991-11-10",
      gender: "Male",
      device: "android_oneplus12_003",
      deviceModel: "OnePlus 12 5G",
    },
    {
      code: "VS-004",
      name: "Kavita Nair",
      email: "kavita.nair@vsecuretechnologies.com",
      phone: "+91 98765 43213",
      role: Role.EMPLOYEE,
      deptId: deptOperations.id,
      desigId: desigSRE.id,
      designation: "Site Reliability Engineer",
      basic: 65000.0,
      hra: 26000.0,
      allowance: 14000.0,
      pan: "ZXCVB4321M",
      aadhaar: "4567-8901-2345",
      blood: "AB+",
      dob: "1996-03-30",
      gender: "Female",
      device: "android_motoedge_004",
      deviceModel: "Motorola Edge 50 Pro",
    },
  ];

  for (const emp of initialStaff) {
    const createdEmp = await prisma.employee.upsert({
      where: { employeeCode: emp.code },
      update: {
        designationRefId: emp.desigId,
        bloodGroup: emp.blood,
        pan: emp.pan,
        aadhaarNumber: emp.aadhaar,
        deviceModel: emp.deviceModel,
        boundDeviceId: emp.device,
        reportingManagerId: superAdmin.id,
      },
      create: {
        organizationId: organization.id,
        employeeCode: emp.code,
        fullName: emp.name,
        email: emp.email,
        phone: emp.phone,
        passwordHash: defaultPasswordHash,
        role: emp.role,
        status: EmploymentStatus.ACTIVE,
        designation: emp.designation,
        designationRefId: emp.desigId,
        joiningDate: new Date("2026-02-01T00:00:00Z"),
        dateOfBirth: new Date(emp.dob),
        gender: emp.gender,
        bloodGroup: emp.blood,
        emergencyContactName: "Relative",
        emergencyContactPhone: "+91 98765 99999",
        address: "Koramangala, Bengaluru, Karnataka",
        pan: emp.pan,
        aadhaarNumber: emp.aadhaar,
        basicSalaryINR: emp.basic,
        hraINR: emp.hra,
        allowancesINR: emp.allowance,
        pfDeductionINR: 1800.0,
        profTaxINR: 200.0,
        pfApplicable: true,
        esiApplicable: false,
        bankName: "ICICI Bank",
        bankAccountNumber: "000105001234",
        bankIFSC: "ICIC0000001",
        boundDeviceId: emp.device,
        deviceModel: emp.deviceModel,
        deviceBoundAt: new Date("2026-02-01T10:00:00Z"),
        reportingManagerId: superAdmin.id,
        departmentId: emp.deptId,
        officeLocationId: hqLocation.id,
      },
    });

    // Seed Sample Document in Vault
    await prisma.employeeDocument.upsert({
      where: { id: `doc_${emp.code}_aadhaar` },
      update: {},
      create: {
        id: `doc_${emp.code}_aadhaar`,
        employeeId: createdEmp.id,
        documentType: DocumentType.AADHAAR_CARD,
        documentName: `${emp.name} - Aadhaar Verification.pdf`,
        fileUrl: `/vault/docs/${emp.code}_aadhaar.pdf`,
        fileSize: 1048576, // 1 MB
        mimeType: "application/pdf",
        verificationStatus: DocumentVerificationStatus.VERIFIED,
        verifiedBy: "Vishnu (Super Admin)",
        verifiedAt: new Date("2026-02-02T11:00:00Z"),
      },
    });

    await prisma.employeeDocument.upsert({
      where: { id: `doc_${emp.code}_pan` },
      update: {},
      create: {
        id: `doc_${emp.code}_pan`,
        employeeId: createdEmp.id,
        documentType: DocumentType.PAN_CARD,
        documentName: `${emp.name} - PAN Card.pdf`,
        fileUrl: `/vault/docs/${emp.code}_pan.pdf`,
        fileSize: 852000,
        mimeType: "application/pdf",
        verificationStatus: DocumentVerificationStatus.VERIFIED,
        verifiedBy: "Priya Sharma (HR Admin)",
        verifiedAt: new Date("2026-02-02T12:00:00Z"),
      },
    });
  }

  // 7. Seed Sample Device Change Request (for Testing Approval Workflow)
  const kavitaEmp = await prisma.employee.findUnique({ where: { employeeCode: "VS-004" } });
  if (kavitaEmp) {
    await prisma.deviceChangeRequest.upsert({
      where: { id: "dev_req_001" },
      update: {},
      create: {
        id: "dev_req_001",
        employeeId: kavitaEmp.id,
        oldDeviceId: kavitaEmp.boundDeviceId,
        newDeviceId: "android_pixel8a_new_kavita",
        newDeviceModel: "Google Pixel 8a (Upgraded)",
        reason: "Upgraded personal handset to Pixel 8a. Need attendance check-in device re-binding.",
        status: ApprovalStatus.PENDING,
      },
    });
    console.log("✓ Sample Device Change Request seeded (Pending review by Admin Vishnu)");
  }

  // 8. Seed Phase 3 Attendance Policy (100m geofence, 09:30 AM shift, 15m grace)
  await prisma.attendancePolicy.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      defaultGeofenceRadiusMeters: 100,
      shiftStartTime: "09:30",
      shiftEndTime: "18:30",
      gracePeriodMinutes: 15,
      minHoursFullDay: 8.0,
      minHoursHalfDay: 4.5,
      requireSelfie: false,
      blockMockLocation: true,
      allowFieldDutyCheckIn: true,
    },
  });
  console.log("✓ Phase 3 Attendance Policy seeded: 100m Geofence, 09:30 AM Shift, 15m Grace");

  // 9. Seed Phase 3 Client Sites for Field Engineers
  const clientSitesData = [
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
    },
  ];

  for (const site of clientSitesData) {
    await prisma.clientSite.upsert({
      where: { id: site.id },
      update: {},
      create: {
        ...site,
        organizationId: organization.id,
      },
    });
  }
  console.log("✓ Phase 3 Client Sites seeded (Infosys, Wipro, TCS)");

  // 10. Seed Today's Attendance Logs (Simulated Real-World Check-Ins)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // VS-001 (Vishnu): On-time Check-In at 09:24 AM (8m from HQ center)
  const vishnuCheckIn = new Date();
  vishnuCheckIn.setHours(9, 24, 0, 0);
  await prisma.attendanceLog.upsert({
    where: {
      employeeId_attendanceDate: {
        employeeId: superAdmin.id,
        attendanceDate: todayDate,
      },
    },
    update: {},
    create: {
      employeeId: superAdmin.id,
      attendanceDate: todayDate,
      checkInTime: vishnuCheckIn,
      checkInLat: 12.93524,
      checkInLng: 77.69465,
      gpsAccuracyMeters: 8.5,
      distanceFromHQ: 8,
      isWithinGeofence: true,
      isMockLocation: false,
      status: AttendanceStatus.PRESENT,
      attendanceType: "OFFICE" as any,
      workingHoursDisplay: "In Progress",
      reviewStatus: "AUTO_VERIFIED" as any,
      geofenceSnapshotRadius: 100,
      officeLocationId: hqLocation.id,
      remarks: "On-time arrival inside HQ perimeter.",
    },
  });

  // VS-002 (Priya Sharma): Early Check-In at 09:15 AM
  const priyaEmp = await prisma.employee.findUnique({ where: { employeeCode: "VS-002" } });
  if (priyaEmp) {
    const priyaCheckIn = new Date();
    priyaCheckIn.setHours(9, 15, 0, 0);
    await prisma.attendanceLog.upsert({
      where: {
        employeeId_attendanceDate: {
          employeeId: priyaEmp.id,
          attendanceDate: todayDate,
        },
      },
      update: {},
      create: {
        employeeId: priyaEmp.id,
        attendanceDate: todayDate,
        checkInTime: priyaCheckIn,
        checkInLat: 12.93530,
        checkInLng: 77.69472,
        gpsAccuracyMeters: 12.0,
        distanceFromHQ: 18,
        isWithinGeofence: true,
        isMockLocation: false,
        status: AttendanceStatus.PRESENT,
        attendanceType: "OFFICE" as any,
        workingHoursDisplay: "In Progress",
        reviewStatus: "AUTO_VERIFIED" as any,
        geofenceSnapshotRadius: 100,
        officeLocationId: hqLocation.id,
        remarks: "Punctual check-in via Android Galaxy S24.",
      },
    });
  }

  // VS-003 (Arjun Mehta): Late Check-In at 09:52 AM (Beyond 15-min grace period)
  const arjunEmp = await prisma.employee.findUnique({ where: { employeeCode: "VS-003" } });
  if (arjunEmp) {
    const arjunCheckIn = new Date();
    arjunCheckIn.setHours(9, 52, 0, 0);
    await prisma.attendanceLog.upsert({
      where: {
        employeeId_attendanceDate: {
          employeeId: arjunEmp.id,
          attendanceDate: todayDate,
        },
      },
      update: {},
      create: {
        employeeId: arjunEmp.id,
        attendanceDate: todayDate,
        checkInTime: arjunCheckIn,
        checkInLat: 12.93542,
        checkInLng: 77.69480,
        gpsAccuracyMeters: 14.2,
        distanceFromHQ: 32,
        isWithinGeofence: true,
        isMockLocation: false,
        status: AttendanceStatus.LATE,
        attendanceType: "OFFICE" as any,
        workingHoursDisplay: "In Progress",
        reviewStatus: "AUTO_VERIFIED" as any,
        geofenceSnapshotRadius: 100,
        officeLocationId: hqLocation.id,
        remarks: "Late arrival: checked in 22 mins after 09:30 AM shift start.",
      },
    });
  }

  // VS-004 (Kavita Nair): Field Duty at Client Site (Infosys Electronic City)
  if (kavitaEmp) {
    const kavitaCheckIn = new Date();
    kavitaCheckIn.setHours(9, 30, 0, 0);
    const attendanceKavita = await prisma.attendanceLog.upsert({
      where: {
        employeeId_attendanceDate: {
          employeeId: kavitaEmp.id,
          attendanceDate: todayDate,
        },
      },
      update: {},
      create: {
        employeeId: kavitaEmp.id,
        attendanceDate: todayDate,
        checkInTime: kavitaCheckIn,
        checkInLat: 12.84524,
        checkInLng: 77.66025,
        gpsAccuracyMeters: 11.0,
        distanceFromHQ: 14200, // Client site distance from HQ
        isWithinGeofence: true,
        isMockLocation: false,
        status: AttendanceStatus.FIELD_DUTY,
        attendanceType: "FIELD_DUTY" as any,
        clientSiteId: "site_client_001",
        workingHoursDisplay: "In Progress (Field Duty)",
        reviewStatus: "AUTO_VERIFIED" as any,
        geofenceSnapshotRadius: 150,
        officeLocationId: hqLocation.id,
        remarks: "Approved Field Assignment at Infosys Electronics City campus.",
      },
    });

    // Seed Field Visit for Kavita
    const visit1Start = new Date();
    visit1Start.setHours(9, 45, 0, 0);
    const visit1End = new Date();
    visit1End.setHours(12, 30, 0, 0);

    await prisma.fieldVisit.upsert({
      where: { id: "visit_kavita_001" },
      update: {},
      create: {
        id: "visit_kavita_001",
        employeeId: kavitaEmp.id,
        attendanceLogId: attendanceKavita.id,
        clientSiteId: "site_client_001",
        clientName: "Infosys Limited",
        workOrderNumber: "WO-INF-2026-09",
        checkInTime: visit1Start,
        checkOutTime: visit1End,
        checkInLat: 12.84525,
        checkInLng: 77.66022,
        checkOutLat: 12.84528,
        checkOutLng: 77.66020,
        gpsAccuracyMeters: 9.8,
        visitNotes: "Server rack health audit and router firmware upgrade completed at Building 3 Data Room.",
        status: "COMPLETED",
      },
    });

    // 11. Seed Sample Attendance Correction Request
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(0, 0, 0, 0);

    const yesterdayReqCheckIn = new Date(yesterdayDate);
    yesterdayReqCheckIn.setHours(9, 30, 0, 0);
    const yesterdayReqCheckOut = new Date(yesterdayDate);
    yesterdayReqCheckOut.setHours(18, 30, 0, 0);

    await prisma.attendanceCorrection.upsert({
      where: { id: "corr_req_001" },
      update: {},
      create: {
        id: "corr_req_001",
        employeeId: kavitaEmp.id,
        attendanceDate: yesterdayDate,
        requestType: "GPS_FAILURE" as any,
        requestedCheckInTime: yesterdayReqCheckIn,
        requestedCheckOutTime: yesterdayReqCheckOut,
        reason: "Basement parking location GPS satellite lock failed. Switched to client WiFi after entering datacenter.",
        status: ApprovalStatus.PENDING,
      },
    });
    console.log("✓ Phase 3 Field Visits & Correction Request seeded");
  }

  // =========================================================================
  // 12. PHASE 4: LEAVE MANAGEMENT & APPROVAL WORKFLOWS SEEDING
  // =========================================================================
  console.log("🌱 Seeding Phase 4 Leave Management Engine...");

  // 12.1. Seed Leave Type Configurations
  const leaveTypeConfigs = [
    {
      code: "CL",
      name: "Casual Leave",
      leaveType: LeaveType.CASUAL,
      description: "For personal errands, family commitments, and unplanned emergencies",
      isPaid: true,
      annualQuota: 12.0,
      monthlyAccrual: 1.0,
      carryForwardMax: 0.0,
      minNoticeDays: 1,
      maxConsecutiveDays: 3,
      allowHalfDay: true,
      requiresDocument: false,
    },
    {
      code: "SL",
      name: "Sick Leave",
      leaveType: LeaveType.SICK,
      description: "For medical ailments, doctor appointments, and recovery",
      isPaid: true,
      annualQuota: 10.0,
      monthlyAccrual: 0.83,
      carryForwardMax: 0.0,
      minNoticeDays: 0,
      maxConsecutiveDays: 5,
      allowHalfDay: true,
      requiresDocument: true,
    },
    {
      code: "EL",
      name: "Earned Leave",
      leaveType: LeaveType.EARNED,
      description: "Privilege leave for planned vacations and extended breaks",
      isPaid: true,
      annualQuota: 15.0,
      monthlyAccrual: 1.25,
      carryForwardMax: 10.0,
      minNoticeDays: 3,
      maxConsecutiveDays: 12,
      allowHalfDay: false,
      requiresDocument: false,
    },
    {
      code: "LOP",
      name: "Loss of Pay (Unpaid)",
      leaveType: LeaveType.UNPAID_LOP,
      description: "Approved unpaid absence subjected to daily gross salary deduction in Phase 5 Payroll",
      isPaid: false,
      annualQuota: 0.0,
      monthlyAccrual: 0.0,
      carryForwardMax: 0.0,
      minNoticeDays: 1,
      maxConsecutiveDays: 30,
      allowHalfDay: true,
      requiresDocument: false,
    },
    {
      code: "COMP",
      name: "Compensatory Off",
      leaveType: LeaveType.COMP_OFF,
      description: "Credit awarded for working on weekends or recognized public holidays",
      isPaid: true,
      annualQuota: 0.0,
      monthlyAccrual: 0.0,
      carryForwardMax: 5.0,
      minNoticeDays: 1,
      maxConsecutiveDays: 2,
      allowHalfDay: true,
      requiresDocument: false,
    },
  ];

  for (const cfg of leaveTypeConfigs) {
    await prisma.leaveTypeConfig.upsert({
      where: { code: cfg.code },
      update: {
        name: cfg.name,
        annualQuota: cfg.annualQuota,
        monthlyAccrual: cfg.monthlyAccrual,
        carryForwardMax: cfg.carryForwardMax,
        minNoticeDays: cfg.minNoticeDays,
        maxConsecutiveDays: cfg.maxConsecutiveDays,
        allowHalfDay: cfg.allowHalfDay,
        requiresDocument: cfg.requiresDocument,
      },
      create: {
        organizationId: organization.id,
        code: cfg.code,
        name: cfg.name,
        description: cfg.description,
        isPaid: cfg.isPaid,
        annualQuota: cfg.annualQuota,
        monthlyAccrual: cfg.monthlyAccrual,
        carryForwardMax: cfg.carryForwardMax,
        minNoticeDays: cfg.minNoticeDays,
        maxConsecutiveDays: cfg.maxConsecutiveDays,
        allowHalfDay: cfg.allowHalfDay,
        requiresDocument: cfg.requiresDocument,
        isActive: true,
      },
    });
  }
  console.log("✓ Leave Type Configurations seeded (CL, SL, EL, LOP, COMP)");

  // 12.2. Seed Organization Leave Policy
  await prisma.leavePolicyConfig.upsert({
    where: { organizationId: organization.id },
    update: {
      excludeWeekends: true,
      excludeHolidays: true,
      managerApprovalRequired: true,
      hrApprovalRequired: false,
      allowNegativeBalance: false,
    },
    create: {
      organizationId: organization.id,
      excludeWeekends: true,
      excludeHolidays: true,
      managerApprovalRequired: true,
      hrApprovalRequired: false,
      allowNegativeBalance: false,
    },
  });
  console.log("✓ Organization Leave Policy seeded (Excludes weekends & holidays)");

  // 12.3. Seed Public Holidays 2026
  const holidays2026 = [
    { name: "Republic Day", date: "26-01-2026", year: 2026 },
    { name: "Ugadi / Gudi Padwa", date: "19-03-2026", year: 2026 },
    { name: "May Day / International Labour Day", date: "01-05-2026", year: 2026 },
    { name: "Independence Day", date: "15-08-2026", year: 2026 },
    { name: "Mahatma Gandhi Jayanti", date: "02-10-2026", year: 2026 },
    { name: "Kannada Rajyotsava", date: "01-11-2026", year: 2026 },
    { name: "Deepavali (Diwali)", date: "08-11-2026", year: 2026 },
    { name: "Christmas Day", date: "25-12-2026", year: 2026 },
  ];

  for (const h of holidays2026) {
    const [d, m, y] = h.date.split("-").map(Number);
    const holidayDate = new Date(Date.UTC(y, m - 1, d));

    await prisma.publicHoliday.upsert({
      where: {
        date_name: {
          date: holidayDate,
          name: h.name,
        },
      },
      update: { year: h.year },
      create: {
        organizationId: organization.id,
        name: h.name,
        date: holidayDate,
        year: h.year,
        isOptional: false,
      },
    });
  }
  console.log("✓ Public Holidays 2026 seeded");

  // 12.4. Seed Employee Leave Balances (2026)
  const allStaffEmployees = await prisma.employee.findMany({
    where: { organizationId: organization.id },
  });

  for (const emp of allStaffEmployees) {
    // CL: 12, SL: 10, EL: 15
    const balances = [
      {
        type: LeaveType.CASUAL,
        allocated: 12.0,
        accrued: 10.0,
        used: emp.employeeCode === "VS-004" ? 2.0 : 0.0,
        pending: 0.0,
        remaining: emp.employeeCode === "VS-004" ? 10.0 : 12.0,
      },
      {
        type: LeaveType.SICK,
        allocated: 10.0,
        accrued: 8.3,
        used: 0.0,
        pending: emp.employeeCode === "VS-002" ? 0.5 : 0.0,
        remaining: 10.0,
      },
      {
        type: LeaveType.EARNED,
        allocated: 15.0,
        accrued: 12.5,
        used: 0.0,
        pending: emp.employeeCode === "VS-003" ? 3.0 : 0.0,
        remaining: 15.0,
      },
      {
        type: LeaveType.UNPAID_LOP,
        allocated: 0.0,
        accrued: 0.0,
        used: 0.0,
        pending: 0.0,
        remaining: 0.0,
      },
      {
        type: LeaveType.COMP_OFF,
        allocated: 0.0,
        accrued: 0.0,
        used: 0.0,
        pending: 0.0,
        remaining: 0.0,
      },
    ];

    for (const b of balances) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_year_leaveType: {
            employeeId: emp.id,
            year: 2026,
            leaveType: b.type,
          },
        },
        update: {
          allocated: b.allocated,
          accrued: b.accrued,
          used: b.used,
          pending: b.pending,
          remaining: b.remaining,
        },
        create: {
          employeeId: emp.id,
          year: 2026,
          leaveType: b.type,
          openingBalance: 0.0,
          allocated: b.allocated,
          accrued: b.accrued,
          carriedForward: 0.0,
          used: b.used,
          pending: b.pending,
          remaining: b.remaining,
        },
      });

      // Seed initial allocation ledger transaction
      if (b.allocated > 0) {
        await prisma.leaveTransaction.upsert({
          where: { id: `txn_init_${emp.employeeCode}_${b.type}` },
          update: {},
          create: {
            id: `txn_init_${emp.employeeCode}_${b.type}`,
            employeeId: emp.id,
            year: 2026,
            leaveType: b.type,
            transactionType: "ALLOCATION",
            days: b.allocated,
            balanceAfter: b.allocated,
            remarks: `Annual quota credit for year 2026 (${b.type})`,
            actionedBy: "System Policy Engine",
          },
        });
      }
    }
  }
  console.log("✓ Initial 2026 Leave Balances and Allocation Ledgers seeded for all employees");

  // 12.5. Seed Sample Leave Requests
  if (kavitaEmp) {
    // Request 1: Approved Casual Leave for Kavita (12-10-2026 to 13-10-2026)
    const approvedLeave = await prisma.leaveRequest.upsert({
      where: { referenceId: "LV-2026-001" },
      update: {},
      create: {
        id: "leave_req_kavita_001",
        referenceId: "LV-2026-001",
        employeeId: kavitaEmp.id,
        leaveType: LeaveType.CASUAL,
        startDate: new Date(Date.UTC(2026, 9, 12)),
        endDate: new Date(Date.UTC(2026, 9, 13)),
        isHalfDay: false,
        totalDays: 2.0,
        reason: "Family wedding in hometown (Thrissur, Kerala)",
        status: ApprovalStatus.APPROVED,
        approvedBy: "Arjun Mehta (Engineering Manager)",
        actionedAt: new Date("2026-10-08T11:30:00Z"),
      },
    });

    // Debit transaction for Kavita's approved leave
    await prisma.leaveTransaction.upsert({
      where: { id: "txn_kavita_debit_001" },
      update: {},
      create: {
        id: "txn_kavita_debit_001",
        employeeId: kavitaEmp.id,
        year: 2026,
        leaveType: LeaveType.CASUAL,
        transactionType: "DEBIT",
        days: -2.0,
        balanceAfter: 10.0,
        leaveRequestId: approvedLeave.id,
        remarks: "Approved Casual Leave debited (LV-2026-001: 12-10-2026 to 13-10-2026)",
        actionedBy: "Arjun Mehta (VS-003)",
      },
    });
  }

  // Find Arjun & Priya
  const staffArjun = allStaffEmployees.find((e) => e.employeeCode === "VS-003");
  const staffPriya = allStaffEmployees.find((e) => e.employeeCode === "VS-002");

  if (staffArjun) {
    // Request 2: Pending Earned Leave for Arjun Mehta (28-10-2026 to 30-10-2026)
    await prisma.leaveRequest.upsert({
      where: { referenceId: "LV-2026-002" },
      update: {},
      create: {
        id: "leave_req_arjun_002",
        referenceId: "LV-2026-002",
        employeeId: staffArjun.id,
        leaveType: LeaveType.EARNED,
        startDate: new Date(Date.UTC(2026, 9, 28)),
        endDate: new Date(Date.UTC(2026, 9, 30)),
        isHalfDay: false,
        totalDays: 3.0,
        reason: "Attending Cloud Architecture Summit in Hyderabad",
        status: ApprovalStatus.PENDING,
      },
    });
  }

  if (staffPriya) {
    // Request 3: Pending Half-Day Sick Leave for Priya Sharma (22-10-2026)
    await prisma.leaveRequest.upsert({
      where: { referenceId: "LV-2026-003" },
      update: {},
      create: {
        id: "leave_req_priya_003",
        referenceId: "LV-2026-003",
        employeeId: staffPriya.id,
        leaveType: LeaveType.SICK,
        startDate: new Date(Date.UTC(2026, 9, 22)),
        endDate: new Date(Date.UTC(2026, 9, 22)),
        isHalfDay: true,
        halfDaySession: "FIRST_HALF",
        totalDays: 0.5,
        reason: "Routine dental consultation at dental clinic",
        status: ApprovalStatus.PENDING,
      },
    });
  }

  console.log("✓ Sample Leave Requests seeded (LV-2026-001 Approved, LV-2026-002 Pending, LV-2026-003 Pending)");
  console.log("🎉 Phase 4 Database Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding Phase 2 database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
