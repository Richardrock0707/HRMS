import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { AttendanceClientView } from "./AttendanceClientView";
import {
  getAttendanceDashboardStatsAction,
  getAttendanceRecordsAction,
  getAttendancePolicyAction,
} from "@/actions/attendanceActions";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Live GPS Attendance Hub | VSecure HRMS",
  description:
    "Real-time GPS coordinates, 100m geofence validation, and field engineer duty tracking for VSecure Technologies.",
};

export default async function AttendancePage() {
  const session = await getSession();
  const userRole = session?.role || "SUPER_ADMIN";

  const [stats, records, policy] = await Promise.all([
    getAttendanceDashboardStatsAction(),
    getAttendanceRecordsAction(),
    getAttendancePolicyAction(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar currentPath="/attendance" />

      {/* Main Content Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AttendanceClientView
            initialStats={stats}
            initialRecords={records}
            initialPolicy={policy}
            userRole={userRole}
          />
        </main>
      </div>
    </div>
  );
}
