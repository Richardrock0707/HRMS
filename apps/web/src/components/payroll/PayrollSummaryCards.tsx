"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Building2,
  Wallet,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import {
  PayrollDashboardStats,
  formatINR,
  formatINRExecutive,
  getPayrollStatusConfig,
} from "@vsecure/shared";

interface PayrollSummaryCardsProps {
  stats: PayrollDashboardStats;
}

export function PayrollSummaryCards({ stats }: PayrollSummaryCardsProps): React.ReactElement {
  const statusCfg = getPayrollStatusConfig(stats.currentCycleStatus);

  const cards = [
    {
      title: "Total Active Staff",
      value: `${stats.totalActiveEmployees}`,
      subtext: "Eligible for payroll",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Staff in Current Run",
      value: `${stats.employeesIncluded}`,
      subtext: "Attendance & leave linked",
      icon: FileCheck,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Total Gross Earnings",
      value: formatINRExecutive(stats.totalGrossEarningsINR),
      subtext: formatINR(stats.totalGrossEarningsINR, true),
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Employee Deductions",
      value: formatINRExecutive(stats.totalEmployeeDeductionsINR),
      subtext: `PF, ESI, PT, LOP: ${formatINR(stats.totalEmployeeDeductionsINR, false)}`,
      icon: Receipt,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Net Salary Payable",
      value: formatINRExecutive(stats.totalNetSalaryPayableINR),
      subtext: formatINR(stats.totalNetSalaryPayableINR, true),
      icon: Wallet,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      borderColor: "border-blue-200 bg-blue-50/10",
      isPrimary: true,
    },
    {
      title: "Employer Contributions",
      value: formatINRExecutive(stats.totalEmployerContributionsINR),
      subtext: "EPF + EPS + ESI (CTC)",
      icon: Building2,
      iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Cycle Workflow Status",
      value: statusCfg.label,
      subtext: "Authoritative server state",
      icon: ShieldCheck,
      iconBg: "bg-slate-50 text-slate-700 border-slate-200",
      borderColor: "border-slate-200",
      isBadge: true,
      badgeStyle: statusCfg,
    },
    {
      title: "Finalized & Disbursed",
      value: `${stats.paidCount} / ${stats.employeesIncluded}`,
      subtext: stats.paidCount > 0 ? "Bank transfer reconciled" : "Awaiting disbursement",
      icon: CheckCircle2,
      iconBg: "bg-green-50 text-green-600 border-green-200",
      borderColor: "border-slate-200",
    },
    {
      title: "Payroll Exceptions",
      value: `${stats.exceptionsCount}`,
      subtext: stats.exceptionsCount === 0 ? "All bank details verified" : "Missing IFSC/Bank info",
      icon: AlertTriangle,
      iconBg: stats.exceptionsCount > 0 ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-400 border-slate-200",
      borderColor: stats.exceptionsCount > 0 ? "border-rose-200 bg-rose-50/20" : "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white shadow-xs transition-all hover:shadow-sm ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            {card.isBadge && card.badgeStyle ? (
              <div className="my-1">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: card.badgeStyle.bg,
                    color: card.badgeStyle.text,
                    borderColor: card.badgeStyle.border,
                  }}
                >
                  {card.value}
                </span>
              </div>
            ) : (
              <div
                className={`text-xl font-bold tracking-tight ${
                  card.isPrimary ? "text-blue-600 font-extrabold" : "text-slate-900"
                }`}
              >
                {card.value}
              </div>
            )}

            <div className="text-[11px] text-slate-500 mt-1 truncate" title={card.subtext}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
