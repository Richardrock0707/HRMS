"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Clock,
  Calendar,
  Globe2,
  Database,
  Bell,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  VSECURE_CONFIG,
  formatDateDDMMYYYY,
  formatTime12HourIST,
} from "@vsecure/shared";

interface TopHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function TopHeader({ onToggleMobileMenu }: TopHeaderProps): React.ReactElement {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

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

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/60 backdrop-blur-2xl border-b border-white/70 px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(15,23,42,0.03)]">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-white/80 focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              {VSECURE_CONFIG.projectName}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800 border border-slate-900/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Phase 6 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Enterprise Spatial Glass Architecture
          </p>
        </div>
      </div>

      {/* Center: Live Regional Clock (DD-MM-YYYY & 12-hour IST) */}
      <div className="flex items-center gap-2 sm:gap-4 glass-pill px-3.5 py-1.5 rounded-full shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono font-semibold tracking-tight">
            {currentDate || formatDateDDMMYYYY(new Date())}
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-300/80" />

        <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono tracking-tight text-slate-900">
            {currentTime || formatTime12HourIST(new Date())}
          </span>
          <span className="text-[10px] text-slate-500 font-sans font-normal hidden lg:inline">
            IST
          </span>
        </div>
      </div>

      {/* Right: Status Pills & Super Admin Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PostgreSQL Database Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs text-slate-700 font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Prisma 6 / PG</span>
        </div>

        {/* Currency Pill */}
        <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full glass-pill text-xs font-bold text-slate-800">
          <span>₹ INR</span>
        </div>

        {/* Super Administrator Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/60">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center ring-2 ring-white shadow-xs">
              V
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {VSECURE_CONFIG.administrator}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-900/10 text-slate-800 rounded">
                {VSECURE_CONFIG.superAdminCode}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
