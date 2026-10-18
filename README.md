# VSecure Technologies HRMS (Monorepo)

Enterprise Human Resource Management System for **VSecure Technologies**, architected for 25 initial employees and horizontally scalable to 10,000+ employees.

## 🌟 Phase 1 Deliverables (Foundation)
- **Turborepo Monorepo**: Powered by Turborepo 2.11 and pnpm 10 workspaces.
- **Modern White-Theme UI Kit**: Pure `#FFFFFF` surfaces, `#F8FAFC` slate canvas, `#E2E8F0` hairline borders, and VSecure Royal Blue (`#2563EB`) accent across Web and Android.
- **Shared Regional Engine (`@vsecure/shared`)**:
  - Timezone: `Asia/Kolkata` (IST, UTC+05:30)
  - Date Format: `DD-MM-YYYY` (e.g. `18-10-2026`)
  - Time Format: `12-hour` with AM/PM (e.g. `09:30 AM`)
  - Currency: `INR` (₹) with `en-IN` Lakhs & Crores grouping
  - Haversine GPS Geofence Math (100m headquarters perimeter)
- **Cloud Database Schema (`@vsecure/database`)**:
  - PostgreSQL schema via Prisma ORM
  - Models: `Organization`, `OfficeLocation`, `Department`, `Designation`, `Employee`, `AttendanceLog`, `LeaveBalance`, `LeaveRequest`, `PayrollRecord`, `EmployeeDocument`, `DeviceChangeRequest`, `LoginSession`
  - Seed script: Pre-seeds Super Administrator **Vishnu** (`VS-001`), Bengaluru HQ office geofence (100m), and core departments.
- **Responsive Web Portal (`apps/web`)**: Next.js App Router, Tailwind CSS v4 Oxide engine, interactive geofence radar, live IST clock, and KPI cards.
- **Android Mobile App (`apps/mobile`)**: Expo SDK 57, React Native, NativeWind, GPS location permissions, and EAS build configuration for direct `.apk` and Play Store `.aab`.

## 🛡️ Phase 2 Deliverables (Security Perimeter & Workforce Core)
- **Multi-Platform Authentication**:
  - **Web Portal**: Split-panel White-Theme Login page (`/login`) with credential sign-in via Official Email or Employee ID (`VS-001`), HTTP-only encrypted session cookies, and 1-click RBAC role switcher.
  - **Android Mobile**: Native white-theme login screen with biometric quick-unlock (Fingerprint / Face ID) and 4-digit fallback PIN.
- **4-Tier Centralized RBAC Policy Engine (`@vsecure/shared/rbac`)**:
  - `SUPER_ADMIN` (Vishnu, `VS-001`): Full unrestricted authority across settings, geofences, staff, and payroll.
  - `HR_ADMIN`: Complete workforce onboarding, salary configuration, and document verification.
  - `MANAGER`: Scoped department read access.
  - `EMPLOYEE`: Self-service profile, digital ID card, personal documents, and INR salary breakdown.
- **Single-Device Hardware Binding & Anti-Spoofing**:
  - Automatically hardware-locks an employee's account to their physical Android device on first login.
  - Blocks buddy-punching from unauthorized handsets and triggers a "Device Change Approval Request" reviewable by Admin Vishnu and HR Admins.
- **Employee Management & Onboarding Module**:
  - Searchable, filterable Workforce Directory (`/employees`) with Dense Table and Card Grid toggles.
  - Guided 4-Step Onboarding Wizard (Personal Details, Employment Mapping with auto `VS-XXX` codes, INR Compensation breakdown, and Digital Document Vault).
  - Employee 360-Degree Profile View (`/employees/[id]`) with 5 dedicated tabs.
  - Department and Device Change Approval CRUD drawers.
- **Android Digital Employee ID & Self-Service**:
  - Mobile Digital ID Badge (`/id-card`) with corporate photo, employee code, blood group, emergency contact, and barcode.
  - Read-only employment and INR compensation summary.
  - Hardware device security status panel with remote unlinking.

---

## 🏗️ Monorepo Structure

```text
├── apps/
│   ├── web/                    # Next.js 16 Web Portal (App Router, Tailwind v4)
│   │   ├── src/app/
│   │   │   ├── page.tsx        # Executive Dashboard
│   │   │   ├── login/          # Split-panel White-Theme Login
│   │   │   └── employees/      # Workforce Directory & [id] 360° Profile
│   │   └── src/components/
│   │       ├── Sidebar.tsx
│   │       ├── TopHeader.tsx
│   │       └── employees/      # Onboarding Wizard, Device Drawer, Dept Drawer
│   └── mobile/                 # Expo SDK 57 Android App (React Native, NativeWind)
│       └── app/
│           ├── index.tsx       # Mobile Home & GPS Attendance
│           ├── login.tsx       # Biometric Mobile Login
│           └── id-card.tsx     # Digital Employee ID Card
├── packages/
│   ├── database/               # PostgreSQL schema, Prisma ORM & Phase 2 seed
│   ├── shared/                 # Regional IST/INR formatters, RBAC matrix, Zod schemas
│   └── ui-tokens/              # Enterprise Modern White-Theme design tokens
├── pnpm-workspace.yaml         # pnpm workspace definition
├── turbo.json                  # Turborepo task pipeline configuration
├── tsconfig.base.json          # Shared strict TypeScript configuration
└── .env                        # Database connection & regional environment variables
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Generate Prisma Client & Push Database Schema
```bash
pnpm --filter @vsecure/database db:generate
pnpm --filter @vsecure/database db:push
```

### 3. Seed Database (Creates Super Admin "Vishnu" - `VS-001`)
```bash
pnpm --filter @vsecure/database db:seed
```

### 4. Run Development Servers
```bash
# Starts Next.js Web Portal (port 3000)
pnpm --filter web dev --port 3000

# Or start both Web and Mobile
pnpm dev
```

### 5. Build Android APK
```bash
cd apps/mobile; eas build -p android --profile preview-apk
```

---

## 🔑 Demo RBAC Accounts (Password: `VSecure@2026`)

| Role | Employee Code | Name | Default Email | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `VS-001` | Vishnu | `vishnu@vsecuretechnologies.com` | Full root authority |
| **HR Admin** | `VS-002` | Priya Sharma | `priya.sharma@vsecuretechnologies.com` | Staff & salary manager |
| **Dept Manager** | `VS-003` | Arjun Mehta | `arjun.mehta@vsecuretechnologies.com` | Engineering department |
| **Employee** | `VS-004` | Kavita Nair | `kavita.nair@vsecuretechnologies.com` | Self-service & mobile ID |
