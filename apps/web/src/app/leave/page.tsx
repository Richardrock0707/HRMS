import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { LeaveClientView } from "./LeaveClientView";
import {
  getLeaveDashboardStatsAction,
  getLeaveBalancesAction,
  getLeaveRequestsAction,
  getLeaveTransactionsAction,
} from "@/actions/leaveActions";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Leave Management & Approval Workflows | VSecure HRMS",
  description:
    "Employee leave applications, multi-tier manager approvals, leave balance quotas, Loss of Pay (LOP), and team leave calendars for VSecure Technologies.",
};

export default async function LeavePage() {
  const session = await getSession();
  const userRole = session?.role || "SUPER_ADMIN";
  const userId = session?.id || "emp_vsecure_001";
  const userCode = session?.employeeCode || "VS-001";
  const userName = session?.fullName || "Vishnu";
  const userDeptId = session?.departmentId || "dept_eng";

  const [stats, balances, requests, transactions] = await Promise.all([
    getLeaveDashboardStatsAction(),
    getLeaveBalancesAction(userId),
    getLeaveRequestsAction({ tab: "my" }),
    getLeaveTransactionsAction(userId),
  ]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <Sidebar currentPath="/leave" />

      {/* Main Content Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <LeaveClientView
            initialStats={stats}
            initialBalances={balances}
            initialRequests={requests}
            initialTransactions={transactions}
            userRole={userRole}
            userId={userId}
            userCode={userCode}
            userName={userName}
            userDeptId={userDeptId}
          />
        </main>
      </div>
    </div>
  );
}
