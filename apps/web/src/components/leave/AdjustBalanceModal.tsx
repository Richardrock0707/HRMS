"use client";

import React, { useState } from "react";
import {
  X,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import { LeaveType, DEFAULT_LEAVE_TYPES } from "@vsecure/shared";
import { adjustLeaveBalanceAction } from "@/actions/leaveActions";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdjustBalanceModal({
  isOpen,
  onClose,
  onSuccess,
}: AdjustBalanceModalProps): React.ReactElement | null {
  const [employeeId, setEmployeeId] = useState("emp_vsecure_004"); // Default Kavita
  const [leaveType, setLeaveType] = useState<LeaveType>("CASUAL");
  const [adjustmentDays, setAdjustmentDays] = useState<number>(1);
  const [reason, setReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (adjustmentDays === 0 || isNaN(adjustmentDays)) {
      setErrorMsg("Adjustment days must be a non-zero value (+ to credit, - to debit).");
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setErrorMsg("A detailed audit reason (min 5 characters) is required by HR compliance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustLeaveBalanceAction(
        employeeId,
        leaveType,
        Number(adjustmentDays),
        reason.trim()
      );
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust balance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Adjust Leave Quota
              </h2>
              <p className="text-xs text-slate-500">
                Audited balance adjustment for HR Admin & Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Employee Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Staff Member
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:border-purple-600"
            >
              {INITIAL_STAFF_DIRECTORY.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.employeeCode}) — {s.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:border-purple-600"
            >
              {DEFAULT_LEAVE_TYPES.map((lt) => (
                <option key={lt.leaveType} value={lt.leaveType}>
                  {lt.code} - {lt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Days Adjustment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Days (+ to credit, - to debit)
            </label>
            <input
              type="number"
              step="0.5"
              value={adjustmentDays}
              onChange={(e) => setAdjustmentDays(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-purple-600"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Example: enter <strong>2.0</strong> to credit 2 days, or <strong>-1.0</strong> to deduct 1 day.
            </span>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensatory credit for emergency weekend server maintenance at Infosys campus..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-purple-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sliders className="w-3.5 h-3.5" />
              )}
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
