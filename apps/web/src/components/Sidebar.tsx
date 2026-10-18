"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  MapPin,
  Settings,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { VSECURE_CONFIG } from "@vsecure/shared";

interface SidebarProps {
  currentPath?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentPath = "/", isOpenMobile, onCloseMobile }: SidebarProps): React.ReactElement {
  const navItems = [
    {
      name: "Executive Dashboard",
      icon: LayoutDashboard,
      href: "/",
      badge: "Phase 1",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      name: "Employee Directory",
      icon: Users,
      href: "/employees",
      badge: `${VSECURE_CONFIG.initialCapacity} Slots`,
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      name: "GPS & Geofence Logs",
      icon: MapPin,
      href: "#geofence",
      badge: "100m HQ",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      name: "Attendance Tracker",
      icon: Clock,
      href: "/attendance",
      badge: "Live GPS",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      name: "Leave Management",
      icon: CalendarCheck,
      href: "/leave",
      badge: "Phase 4",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      name: "Payroll (INR ₹)",
      icon: IndianRupee,
      href: "/payroll",
      badge: "Phase 5",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      name: "Office Locations",
      icon: Building2,
      href: "#locations",
    },
    {
      name: "System Settings",
      icon: Settings,
      href: "#settings",
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpenMobile ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">VSecure</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                HRMS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Technologies Pvt Ltd
            </p>
          </div>
        </div>

        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Core Workspaces
        </div>

        {navItems.map((item) => {
          const isActive = item.href === currentPath || (item.href === "/" && currentPath === "/");
          const Icon = item.icon;

          return (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-blue-600 border border-slate-200 shadow-xs"
                  : "text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    item.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}

        {/* Phase 1 Regional Engine Notice */}
        <div className="mt-6 mx-1 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Regional Engine IST</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Locked to Asia/Kolkata timezone, DD-MM-YYYY dates, 12-hour clock, and INR (₹) payroll.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Capacity: 25 / 10k</span>
            <span className="text-emerald-700 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* Super Administrator Badge Footer */}
      <div className="p-3 border-t border-slate-200 bg-white space-y-2">
        <Link
          href="/employees/emp_vsecure_001"
          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">{VSECURE_CONFIG.administrator}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                  {VSECURE_CONFIG.superAdminCode}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Super Administrator</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <div className="flex items-center justify-between px-1 text-[11px]">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Switch Role / Sign In
          </Link>
          <span className="text-slate-400 font-mono text-[10px]">Phase 2 Live</span>
        </div>
      </div>
    </aside>
  );
}
