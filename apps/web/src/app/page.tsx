"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { KpiCard } from "@/components/KpiCard";
import { GeofenceMapCard } from "@/components/GeofenceMapCard";
import { AttendancePreviewTable } from "@/components/AttendancePreviewTable";
import { SystemHealthBadge } from "@/components/SystemHealthBadge";
import { VSECURE_CONFIG, formatINR, formatINRExecutive } from "@vsecure/shared";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Phase 1 KPI Metrics for 25 initial employees capacity
  const kpiData = {
    totalCapacity: 25,
    activeEmployees: 25,
    presentToday: 18,
    onLeaveToday: 2,
    monthlyPayrollEstimate: 1845000, // ₹18,45,000 INR
    averageSalary: 73800,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath="/"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Phase 2 Active: Security Perimeter & Workforce Core
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Asia/Kolkata • IST • ₹ INR
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {VSECURE_CONFIG.administrator}!
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                VSecure Technologies HRMS is active with 4-Tier RBAC authorization, single-device
                Android hardware binding, employee onboarding wizard, and digital ID vault.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <Link
                href="/employees"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Workforce Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
              >
                Switch Role / Sign In
              </Link>
            </div>
          </div>

          {/* Top 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Employee Capacity"
              value={`${kpiData.activeEmployees} / ${kpiData.totalCapacity}`}
              subtitle="Indexed schema scales to 10,000+"
              icon={Users}
              badge="100% Filled"
              badgeType="brand"
            />
            <KpiCard
              title="Present Today (IST)"
              value={kpiData.presentToday}
              subtitle="Verified within 100m HQ geofence"
              icon={Clock}
              badge="72.0% Turnout"
              badgeType="positive"
            />
            <KpiCard
              title="On Leave Today"
              value={kpiData.onLeaveToday}
              subtitle="1 Casual • 1 Sick Leave"
              icon={CalendarCheck}
              badge="Approved"
              badgeType="warning"
            />
            <KpiCard
              title="Monthly Payroll (INR)"
              value={formatINRExecutive(kpiData.monthlyPayrollEstimate)}
              subtitle={`Exact: ${formatINR(kpiData.monthlyPayrollEstimate)}`}
              icon={IndianRupee}
              badge="en-IN Locale"
              badgeType="neutral"
            />
          </div>

          {/* Section: GPS Geofence Radar & Interactive Haversine Calculator */}
          <section id="geofence">
            <GeofenceMapCard />
          </section>

          {/* Section: Today's Attendance Feed */}
          <section id="attendance">
            <AttendancePreviewTable />
          </section>

          {/* Section: Infrastructure & Engine Status */}
          <section id="status">
            <SystemHealthBadge />
          </section>
        </main>
      </div>
    </div>
  );
}
