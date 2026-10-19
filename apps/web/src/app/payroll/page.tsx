import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { PayrollClientView } from "./PayrollClientView";
import {
  getPayrollDashboardStatsAction,
  getPayrollCycleAction,
  getPayrollRecordsAction,
} from "@/actions/payrollActions";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Automated Payroll & Salary Management | VSecure HRMS",
  description:
    "Automated monthly salary calculation, Loss of Pay (LOP) deductions, PF/ESI/PT statutory compliance, digital payslip generation, and corporate bank transfer exports for VSecure Technologies.",
};

export default async function PayrollPage() {
  const session = await getSession();
  const userRole = session?.role || "SUPER_ADMIN";
  const userId = session?.id || "emp_vsecure_001";
  const userCode = session?.employeeCode || "VS-001";
  const userName = session?.fullName || "Vishnu";

  const [stats, cycle, recordsRes] = await Promise.all([
    getPayrollDashboardStatsAction(10, 2026),
    getPayrollCycleAction(10, 2026),
    getPayrollRecordsAction(10, 2026),
  ]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <Sidebar currentPath="/payroll" />

      {/* Main Content Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PayrollClientView
            initialStats={stats}
            initialCycle={cycle}
            initialRecords={recordsRes.data || []}
            userRole={userRole}
            userId={userId}
            userCode={userCode}
            userName={userName}
          />
        </main>
      </div>
    </div>
  );
}
