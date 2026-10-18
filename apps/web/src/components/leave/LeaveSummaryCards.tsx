"use client";

import React from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  UserMinus,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { LeaveDashboardStats } from "@vsecure/shared";

interface LeaveSummaryCardsProps {
  stats: LeaveDashboardStats;
}

export function LeaveSummaryCards({ stats }: LeaveSummaryCardsProps): React.ReactElement {
  const cards = [
    {
      title: "Total Requests",
      value: stats.totalLeaveRequests,
      subtext: "Year 2026 to date",
      icon: CalendarCheck,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      subtext: "Awaiting review",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      borderColor: stats.pendingApprovals > 0 ? "border-amber-200 bg-amber-50/20" : "border-slate-200",
    },
    {
      title: "Approved Requests",
      value: stats.approvedRequests,
      subtext: "Deducted from balance",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Rejected / Declined",
      value: stats.rejectedRequests,
      subtext: "Reasons logged",
      icon: XCircle,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      borderColor: "border-slate-200",
    },
    {
      title: "On Leave Today",
      value: stats.employeesOnLeaveToday,
      subtext: "Active approved leaves",
      icon: UserMinus,
      iconBg: "bg-purple-50 text-purple-600 border-purple-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Upcoming Absences",
      value: stats.upcomingAbsences,
      subtext: "Next 14 days",
      icon: CalendarDays,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Unpaid LOP Days",
      value: stats.unpaidLopDaysMonth,
      subtext: "Loss of Pay (Payroll)",
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      borderColor: "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-white border ${card.borderColor} shadow-xs transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
