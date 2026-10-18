"use client";

import React from "react";
import { LeaveBalanceItem, getLeaveTypeBadge } from "@vsecure/shared";
import { PlusCircle, Sliders } from "lucide-react";

interface LeaveBalanceCardsProps {
  balances: LeaveBalanceItem[];
  employeeName?: string;
  employeeCode?: string;
  onApplyLeaveClick?: (leaveType?: string) => void;
  onAdjustBalanceClick?: () => void;
  canAdjust?: boolean;
}

export function LeaveBalanceCards({
  balances,
  employeeName,
  employeeCode,
  onApplyLeaveClick,
  onAdjustBalanceClick,
  canAdjust = false,
}: LeaveBalanceCardsProps): React.ReactElement {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Leave Balances (CY 2026)
            </h2>
            {employeeCode && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {employeeName ? `${employeeName} (${employeeCode})` : employeeCode}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Accruals and quota deductions governed by VSecure Technologies Leave Policy
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAdjust && (
            <button
              onClick={onAdjustBalanceClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Adjust Quota
            </button>
          )}
          <button
            onClick={() => onApplyLeaveClick?.()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Apply Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {balances.map((b) => {
          const badgeMeta = getLeaveTypeBadge(b.leaveType);
          const totalQuota = b.allocated || (b.used + b.remaining);
          const usedPercent = totalQuota > 0 ? Math.min(100, Math.round((b.used / totalQuota) * 100)) : 0;

          return (
            <div
              key={b.leaveType}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeMeta.badgeClass}`}
                  >
                    {badgeMeta.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {badgeMeta.isPaid ? "Paid Leave" : "Unpaid (LOP)"}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 tracking-tight">
                  {b.name}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {badgeMeta.desc}
                </div>

                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {b.remaining}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {totalQuota} days
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Available
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      b.leaveType === "UNPAID_LOP"
                        ? "bg-rose-500"
                        : b.remaining <= 2 && totalQuota > 0
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${totalQuota > 0 ? usedPercent : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-400">Used:</span>{" "}
                  <span className="font-semibold text-slate-700">{b.used} d</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Pending:</span>{" "}
                  <span className="font-semibold text-amber-600">{b.pending} d</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
