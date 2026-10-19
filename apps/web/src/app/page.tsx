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
  LayoutGrid,
  Radio,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { SpatialDashboardView } from "@/components/SpatialDashboardView";
import { GeofenceMapCard } from "@/components/GeofenceMapCard";
import { AttendancePreviewTable } from "@/components/AttendancePreviewTable";
import { SystemHealthBadge } from "@/components/SystemHealthBadge";
import { VSECURE_CONFIG } from "@vsecure/shared";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"spatial" | "modules">("spatial");

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900">
      {/* Sidebar Navigation with Frosted Glass Styling */}
      <Sidebar
        currentPath="/"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px] w-full mx-auto">
          {/* Spatial Glass Dashboard - Master Reference View */}
          <section id="spatial-hero" className="w-full">
            <SpatialDashboardView onOpenQuickAction={() => setActiveTab(activeTab === "spatial" ? "modules" : "spatial")} />
          </section>

          {/* View Mode Toggle Pill Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Detailed Operations
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800">
                Live Data Feeds
              </span>
            </div>

            <div className="flex items-center gap-2 glass-pill px-2 py-1 rounded-full shadow-2xs">
              <button
                onClick={() => setActiveTab("spatial")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "spatial"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Spatial View
              </button>
              <button
                onClick={() => setActiveTab("modules")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "modules"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Feeds
              </button>
            </div>
          </div>

          {/* Operational Feeds (Geofence Radar, Live Attendance, Infrastructure Health) */}
          <div className={`space-y-8 transition-opacity duration-300 ${activeTab === "spatial" ? "opacity-95" : "opacity-100"}`}>
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
          </div>
        </main>
      </div>
    </div>
  );
}
