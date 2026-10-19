"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  TrendingUp,
  Activity,
  Sparkles,
  Plus,
  Compass,
  CheckCircle2,
  Globe,
  Sliders,
  ChevronRight,
  Maximize2,
  Layers,
  ArrowUpRight,
  Eye,
  Briefcase,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { VSECURE_CONFIG, formatDateDDMMYYYY, formatTime12HourIST } from "@vsecure/shared";

interface SpatialDashboardViewProps {
  onOpenQuickAction?: () => void;
}

export function SpatialDashboardView({ onOpenQuickAction }: SpatialDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "employees" | "attendance" | "leave" | "payroll">("dashboard");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [activeDayIndex, setActiveDayIndex] = useState(2); // Wednesday (Wed in reference image)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(formatDateDDMMYYYY(now));
      setCurrentTime(formatTime12HourIST(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const weekDays = [
    { label: "Mon", code: "Пн", hours: 8.5, height: "45%" },
    { label: "Tue", code: "Вт", hours: 9.0, height: "60%" },
    { label: "Wed", code: "Ср", hours: 9.5, height: "92%", active: true },
    { label: "Thu", code: "Чт", hours: 8.0, height: "55%" },
    { label: "Fri", code: "Пт", hours: 7.5, height: "40%" },
    { label: "Sat", code: "Сб", hours: 4.0, height: "25%" },
    { label: "Sun", code: "Вс", hours: 0.0, height: "15%" },
  ];

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 1. Top Iconic Floating Arch Capsule: "Dashboard" */}
      <div className="relative -mb-6 z-20 flex justify-center">
        <div className="px-10 sm:px-14 py-3 sm:py-4 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.1),inset_0_1px_2px_white] rounded-t-[36px] rounded-b-[20px] flex items-center gap-3">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-sans select-none">
            Dashboard
          </span>
        </div>
      </div>

      {/* 2. Main Spatial Floating Glass Board */}
      <div className="w-full glass-main-board p-5 sm:p-7 lg:p-9 relative z-10 transition-all">
        {/* Top Floating Glass Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900/90 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">VSecure Technologies</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800 border border-slate-900/10">
                  {VSECURE_CONFIG.superAdminCode}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Enterprise HRMS • {VSECURE_CONFIG.timezone} (IST) • ₹ INR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="glass-pill px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentTime || "12:00:00 PM"}</span>
            </div>
            <div className="glass-pill px-4 py-1.5 rounded-full text-xs font-medium text-slate-700 hidden sm:flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentDate || "19-10-2026"}</span>
            </div>
            <div className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50/60 border-emerald-200/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100m HQ Radar</span>
            </div>
          </div>
        </div>

        {/* 3. Grid of Widgets Matching the Reference Image Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Card 1: Top-Left Dark Obsidian - Security Perimeter & 3D Knot Sculpture */}
          <div className="lg:col-span-3 glass-card-dark flex flex-col justify-between overflow-hidden relative group">
            <div className="flex items-start justify-between z-10">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Security Perimeter</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">100m HQ Geofence • Anti-Spoof</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ACTIVE
              </span>
            </div>

            {/* Central 3D Liquid Chrome Sculpture Vignette */}
            <div className="my-3 py-2 flex items-center justify-center relative">
              <div className="w-32 h-32 relative rounded-full overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-500">
                <Image
                  src="/chrome-knot.jpg"
                  alt="Liquid Chrome Security Token"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 z-10">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Pixel 9 Pro bound</span>
              </span>
              <span className="text-emerald-400 font-mono font-semibold">0 mock GPS</span>
            </div>
          </div>

          {/* Card 2: Weekly Activity ("Неделя в работе" style) */}
          <div className="lg:col-span-3 glass-card flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Weekly Activity</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Attendance logs & hours</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">42h</span>
                <span className="block text-[10px] text-slate-500 font-medium">Logged</span>
              </div>
            </div>

            {/* Minimalist Vertical Pill Bar Chart */}
            <div className="h-28 flex items-end justify-between px-2 pt-4">
              {weekDays.map((d, idx) => (
                <div key={d.label} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer" onClick={() => setActiveDayIndex(idx)}>
                  <div className="relative w-4 sm:w-5 flex items-end justify-center h-full">
                    <div
                      className={`w-2.5 sm:w-3 rounded-full transition-all duration-300 ${
                        idx === activeDayIndex
                          ? "bg-slate-900 shadow-md ring-2 ring-slate-900/20"
                          : "bg-slate-300/80 group-hover:bg-slate-400"
                      }`}
                      style={{ height: d.height }}
                    />
                    {idx === activeDayIndex && (
                      <span className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-slate-900" />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold ${idx === activeDayIndex ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Avg: 8.4h / day</span>
              <span className="font-semibold text-emerald-700">100% Punctual</span>
            </div>
          </div>

          {/* Card 3: Workforce Turnout Dials ("Уровень заряда" style) */}
          <div className="lg:col-span-3 glass-card flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Workforce Turnout</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time attendance capacity</p>
            </div>

            {/* Circular Gauge Meters */}
            <div className="my-2 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#0F172A"
                      strokeWidth="4.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - 0.90)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-900 font-mono">90%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1">Present</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#2563EB"
                      strokeWidth="4.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - 0.72)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-blue-700 font-mono">72%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1">In Office</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>HQ Verified Office</span>
                  <span className="font-bold">80%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-1.5 rounded-full w-[80%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>Field Client Duty</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 & 5 (Right Column Stack): Analytics Pills & Engine Controls */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Top Analytics Pills */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Workforce Analytics
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900 text-white rounded-2xl p-2.5 text-center shadow-xs">
                  <span className="block text-base font-extrabold font-mono leading-none">25</span>
                  <span className="text-[9px] text-slate-300 font-medium mt-1 block">Staff</span>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-2.5 text-center shadow-xs">
                  <span className="block text-base font-extrabold leading-none">∞</span>
                  <span className="text-[9px] text-slate-300 font-medium mt-1 block">Scale</span>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-2.5 text-center shadow-xs">
                  <span className="block text-base font-extrabold font-mono leading-none">100m</span>
                  <span className="text-[9px] text-slate-300 font-medium mt-1 block">HQ Radius</span>
                </div>
              </div>
            </div>

            {/* Bottom Dark Obsidian Engine Controls */}
            <div className="glass-card-dark p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white tracking-tight">Engine Controls</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>

              <div className="space-y-2 text-[10px] text-slate-300">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>Geofence Radar</span>
                    <span className="font-mono text-white">100%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-1.5 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>Leave Ledger</span>
                    <span className="font-mono text-white">80%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-1.5 rounded-full w-[80%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>Payroll Engine (INR)</span>
                    <span className="font-mono text-white">100%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-1.5 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Card 6: Middle-Left Dark Obsidian - Turnout Velocity Wave */}
          <div className="lg:col-span-3 glass-card-dark p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-tight">Turnout Velocity</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">+92%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Attendance frequency curve</p>
            </div>

            {/* Sinusoidal Wave SVG Chart */}
            <div className="my-3 relative h-28 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 C30,75 50,25 90,40 C130,55 150,15 200,20 L200,100 L0,100 Z"
                  fill="url(#waveGrad)"
                />
                <path
                  d="M0,80 C30,75 50,25 90,40 C130,55 150,15 200,20"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Float markers */}
              <div className="absolute top-2 right-4 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-xs">
                +90%
              </div>
              <div className="absolute top-8 left-16 text-[9px] font-mono text-slate-400">
                +40%
              </div>
              <div className="absolute bottom-6 left-2 text-[9px] font-mono text-slate-400">
                -15%
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-white/10">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span className="text-white font-bold">May</span>
            </div>
          </div>

          {/* Row 2: Card 7: Center Wide Light Glass - Shift & Duty Schedule Matrix ("Май 2025" style) */}
          <div className="lg:col-span-9 glass-card p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-slate-800">
                  October 2026
                </div>
                <span className="text-xs text-slate-500 font-medium">Duty & Shift Matrix (IST)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <span>Scheduled Events</span>
              </div>
            </div>

            {/* Time Grid with Days Header */}
            <div className="my-2 overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 pb-2">
                  <span>Mon (19)</span>
                  <span>Tue (20)</span>
                  <span className="text-slate-900 bg-slate-100 rounded-md py-0.5">Wed (21)</span>
                  <span>Thu (22)</span>
                  <span>Fri (23)</span>
                  <span>Sat (24)</span>
                  <span>Sun (25)</span>
                </div>

                {/* Time Slots rows with floating dark pills */}
                <div className="space-y-2.5 pt-2">
                  {/* Slot 1: 09:00 */}
                  <div className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="font-mono text-slate-500 font-semibold text-[11px]">09:00</span>
                    <div className="col-span-3 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center justify-between shadow-xs">
                      <span className="truncate">Morning Geofence Punch (HQ)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">18 Present</span>
                    </div>
                    <div className="col-span-3" />
                  </div>

                  {/* Slot 2: 11:30 */}
                  <div className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="font-mono text-slate-500 font-semibold text-[11px]">11:30</span>
                    <div className="col-span-2" />
                    <div className="col-span-3 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center justify-between shadow-xs">
                      <span className="truncate">Field Engineer Onsite Audit</span>
                      <span className="text-[10px] text-blue-300 font-mono">Koramangala</span>
                    </div>
                    <div className="col-span-1" />
                  </div>

                  {/* Slot 3: 14:00 */}
                  <div className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="font-mono text-slate-500 font-semibold text-[11px]">14:00</span>
                    <div className="col-span-1" />
                    <div className="col-span-3 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center justify-between shadow-xs">
                      <span className="truncate">Leave Ledger & Approvals</span>
                      <span className="text-[10px] text-amber-300 font-mono">2 Requests</span>
                    </div>
                    <div className="col-span-2" />
                  </div>

                  {/* Slot 4: 16:30 */}
                  <div className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="font-mono text-slate-500 font-semibold text-[11px]">16:30</span>
                    <div className="col-span-3" />
                    <div className="col-span-3 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center justify-between shadow-xs">
                      <span className="truncate">Payroll Run & Payslip Release</span>
                      <span className="text-[10px] text-emerald-400 font-mono">₹18,45,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Current Timezone: Asia/Kolkata (UTC +05:30)</span>
              <Link href="/attendance" className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                <span>View Full Attendance Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Row 3: Card 8: Working Hours VS Energy Mountain ("Рабочее время VS Энергия") */}
          <div className="lg:col-span-4 glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Working Hours vs Capacity
              </span>
              <span className="text-[10px] font-mono text-slate-500">12h Scale</span>
            </div>

            {/* Mountain Fill SVG Chart */}
            <div className="my-2 h-24 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <path
                  d="M0,80 L20,70 L50,50 L80,20 L110,35 L140,10 L170,45 L200,80 Z"
                  fill="#0F172A"
                  fillOpacity="0.88"
                />
                <path
                  d="M0,80 L30,65 L70,30 L100,55 L130,25 L160,50 L200,80 Z"
                  fill="#64748B"
                  fillOpacity="0.35"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200/60">
              <span>09:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
              <span>21:00</span>
            </div>
          </div>

          {/* Row 3: Card 9: Big Double Circular Gauges ("Правки" 20% & "Анализ" 93%) */}
          <div className="lg:col-span-4 glass-card p-5 flex items-center justify-around">
            {/* Gauge 1 */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#0F172A"
                    strokeWidth="6"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 * (1 - 0.20)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-slate-900 font-mono">20%</span>
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2">Leave Quota</span>
              <span className="text-[10px] text-slate-500">2 on leave</span>
            </div>

            {/* Gauge 2 */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#0F172A"
                    strokeWidth="6"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 * (1 - 0.93)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-slate-900 font-mono">93%</span>
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2">On-Time Arrival</span>
              <span className="text-[10px] text-emerald-600 font-semibold">15m grace OK</span>
            </div>
          </div>

          {/* Row 3: Card 10: Geography / Nodes Map ("География работы" style) */}
          <div className="lg:col-span-4 glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Office Nodes & Geofencing
                </span>
                <p className="text-[10px] text-slate-500">Bengaluru HQ & Satellite Nodes</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                IST: +05:30
              </span>
            </div>

            {/* Stylized World & India Node Map Representation */}
            <div className="my-2 h-24 relative flex items-center justify-center bg-slate-100/50 rounded-2xl p-2 border border-slate-200/60 overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:10px_10px]" />
              
              {/* HQ Node */}
              <div className="relative flex flex-col items-center z-10">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-xs" />
                </span>
                <span className="text-[10px] font-bold text-slate-900 mt-1 bg-white/90 px-1.5 py-0.2 rounded shadow-2xs">
                  Bengaluru HQ (100m)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
              <span>Latency: 12ms</span>
              <span className="font-semibold text-blue-600">Active Perimeter</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Floating Dark Obsidian Bottom Dock / Pill Bar */}
      <div className="sticky bottom-6 z-30 mt-6 flex justify-center">
        <div className="glass-dock rounded-full px-5 py-2.5 flex items-center gap-2 sm:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-white/20 text-white shadow-inner"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Link>
          <Link
            href="/employees"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Employees
          </Link>
          <Link
            href="/attendance"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Attendance
          </Link>
          <Link
            href="/leave"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Leave
          </Link>
          <Link
            href="/payroll"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Payroll
          </Link>

          <button
            onClick={onOpenQuickAction}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-xs ml-1"
            title="Quick Action"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
