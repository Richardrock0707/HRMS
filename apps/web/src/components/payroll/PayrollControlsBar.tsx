"use client";

import React, { useState } from "react";
import {
  Calendar,
  Calculator,
  Send,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Download,
  Sliders,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  PayrollStatus,
  LopCalculationBasis,
  MONTH_NAMES,
  getPayrollStatusConfig,
} from "@vsecure/shared";

interface PayrollControlsBarProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (month: number, year: number) => void;
  lopBasis: LopCalculationBasis;
  onLopBasisChange: (basis: LopCalculationBasis) => void;
  cycleStatus: PayrollStatus;
  userRole: string;
  onCalculate: () => void;
  onSubmitForApproval: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFinalize: () => void;
  onReopen: () => void;
  onOpenBankExport: () => void;
  isProcessing: boolean;
}

export function PayrollControlsBar({
  selectedMonth,
  selectedYear,
  onMonthYearChange,
  lopBasis,
  onLopBasisChange,
  cycleStatus,
  userRole,
  onCalculate,
  onSubmitForApproval,
  onApprove,
  onReject,
  onFinalize,
  onReopen,
  onOpenBankExport,
  isProcessing,
}: PayrollControlsBarProps): React.ReactElement {
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isHrAdmin = userRole === "HR_ADMIN";
  const canManage = isSuperAdmin || isHrAdmin;
  const statusCfg = getPayrollStatusConfig(cycleStatus);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Left: Month/Year selector & LOP Basis */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-600">Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthYearChange(Number(e.target.value), selectedYear)}
            className="bg-transparent font-bold text-slate-900 border-none outline-none cursor-pointer focus:ring-0"
            disabled={isProcessing}
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => onMonthYearChange(selectedMonth, Number(e.target.value))}
            className="bg-transparent font-bold text-slate-900 border-none outline-none cursor-pointer focus:ring-0"
            disabled={isProcessing}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        {/* LOP Calculation Basis Configuration */}
        {canManage && (
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">LOP Basis:</span>
            <select
              value={lopBasis}
              onChange={(e) => onLopBasisChange(e.target.value as LopCalculationBasis)}
              className="bg-transparent font-medium text-slate-900 border-none outline-none cursor-pointer focus:ring-0"
              disabled={isProcessing || cycleStatus === "FINALIZED" || cycleStatus === "PAID"}
            >
              <option value="CALENDAR_DAYS">Calendar Days (31 Days)</option>
              <option value="WORKING_DAYS">Working Days (22 Days)</option>
            </select>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center space-x-1.5">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: statusCfg.bg,
              color: statusCfg.text,
              borderColor: statusCfg.border,
            }}
          >
            ● {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Right: Role-Based Workflow Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Recalculate Payroll (HR / Super Admin) */}
        {canManage && cycleStatus !== "FINALIZED" && cycleStatus !== "PAID" && (
          <button
            onClick={onCalculate}
            disabled={isProcessing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate gross, LOP deductions and statutory contributions"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Calculate Payroll</span>
          </button>
        )}

        {/* Submit for Approval (HR Admin / Preparer) */}
        {canManage &&
          (cycleStatus === "DRAFT" || cycleStatus === "PENDING_REVIEW") && (
            <button
              onClick={onSubmitForApproval}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Super Admin Approval</span>
            </button>
          )}

        {/* Super Admin Approval Actions (Separation of duties) */}
        {isSuperAdmin && cycleStatus === "PENDING_APPROVAL" && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve Payroll</span>
            </button>
          </div>
        )}

        {/* Finalize & Lock Payroll (Super Admin Vishnu) */}
        {isSuperAdmin && cycleStatus === "APPROVED" && (
          <button
            onClick={onFinalize}
            disabled={isProcessing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Finalize & Lock Payroll</span>
          </button>
        )}

        {/* Reopen Cycle for Authorized Correction (Super Admin Vishnu) */}
        {isSuperAdmin && (cycleStatus === "FINALIZED" || cycleStatus === "PAID") && (
          <button
            onClick={onReopen}
            disabled={isProcessing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Authorized override with mandatory audit reason"
          >
            <Unlock className="w-3.5 h-3.5 text-rose-600" />
            <span>Reopen for Correction</span>
          </button>
        )}

        {/* Bank Salary Transfer Export */}
        {canManage && (
          <button
            onClick={onOpenBankExport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
            <span>Bank Transfer File</span>
          </button>
        )}
      </div>
    </div>
  );
}
