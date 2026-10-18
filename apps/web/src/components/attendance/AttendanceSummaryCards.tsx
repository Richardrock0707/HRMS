"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  ClockAlert,
  CalendarOff,
  Briefcase,
  UserX,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { AttendanceDashboardStats } from "@vsecure/shared";

interface AttendanceSummaryCardsProps {
  stats: AttendanceDashboardStats;
}

export function AttendanceSummaryCards({ stats }: AttendanceSummaryCardsProps): React.ReactElement {
  const cards = [
    {
      title: "Total Workforce",
      value: stats.totalActiveEmployees,
      subtext: "25 Slots Capacity",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      subtext: "On-time inside geofence",
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Late Arrivals",
      value: stats.lateArrivals,
      subtext: "Past 15m grace window",
      icon: ClockAlert,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      title: "Field Duty",
      value: stats.fieldDutyToday,
      subtext: "Client site visits",
      icon: Briefcase,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Absent",
      value: stats.absentToday,
      subtext: "Unmarked today",
      icon: UserX,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      title: "On Leave",
      value: stats.onLeaveToday,
      subtext: "Approved leaves",
      icon: CalendarOff,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      title: "Pending Corrections",
      value: stats.pendingCorrections,
      subtext: "Awaiting HR review",
      icon: FileSpreadsheet,
      color: "text-orange-700 bg-orange-50 border-orange-200",
    },
    {
      title: "Location Exceptions",
      value: stats.locationExceptions,
      subtext: "Degraded GPS / Flags",
      icon: AlertTriangle,
      color: "text-red-700 bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${card.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
