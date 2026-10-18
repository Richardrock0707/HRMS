"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  CalendarCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  Loader2,
  Info,
} from "lucide-react";
import {
  LeaveType,
  LeaveSession,
  LeaveBalanceItem,
  calculateLeaveDuration,
  detectLeaveConflicts,
  formatDateDDMMYYYY,
  getLeaveTypeBadge,
  DEFAULT_LEAVE_TYPES,
  DEFAULT_2026_HOLIDAYS,
} from "@vsecure/shared";
import { applyLeaveAction } from "@/actions/leaveActions";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: LeaveBalanceItem[];
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  designation: string;
  reportingManagerName: string;
  existingLeaves?: any[];
  onSuccess?: () => void;
}

export function ApplyLeaveModal({
  isOpen,
  onClose,
  balances,
  employeeName,
  employeeCode,
  departmentName,
  designation,
  reportingManagerName,
  existingLeaves = [],
  onSuccess,
}: ApplyLeaveModalProps): React.ReactElement | null {
  const todayStr = useMemo(() => formatDateDDMMYYYY(new Date()), []);

  const [leaveType, setLeaveType] = useState<LeaveType>("CASUAL");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<LeaveSession>("FIRST_HALF");
  const [reason, setReason] = useState("");
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Available balance for currently selected leave type
  const selectedBalance = useMemo(() => {
    return balances.find((b) => b.leaveType === leaveType);
  }, [balances, leaveType]);

  // Real-time Centralized Leave Duration Engine Calculation
  const durationResult = useMemo(() => {
    const effectiveEnd = isHalfDay ? startDate : endDate;
    return calculateLeaveDuration({
      startDate,
      endDate: effectiveEnd,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      excludeWeekends: true,
      excludeHolidays: true,
      holidays: DEFAULT_2026_HOLIDAYS,
    });
  }, [startDate, endDate, isHalfDay, halfDaySession]);

  // Real-time Conflict Detection
  const conflictResult = useMemo(() => {
    const effectiveEnd = isHalfDay ? startDate : endDate;
    return detectLeaveConflicts(
      existingLeaves,
      startDate,
      effectiveEnd,
      isHalfDay,
      halfDaySession
    );
  }, [existingLeaves, startDate, endDate, isHalfDay, halfDaySession]);

  // Balance insufficiency validation
  const isInsufficient = useMemo(() => {
    if (leaveType === "UNPAID_LOP") return false;
    if (!selectedBalance) return false;
    return durationResult.isValid && durationResult.totalDays > selectedBalance.remaining;
  }, [leaveType, selectedBalance, durationResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!reason || reason.trim().length < 5) {
      setErrorMsg("Please provide a valid leave reason (minimum 5 characters).");
      return;
    }

    if (!durationResult.isValid) {
      setErrorMsg(durationResult.errorMessage || "Please select a valid date range.");
      return;
    }

    if (durationResult.totalDays <= 0) {
      setErrorMsg(
        "The selected period falls entirely on weekends or recognized public holidays (0 working days to debit)."
      );
      return;
    }

    if (conflictResult.hasConflict) {
      setErrorMsg(conflictResult.reason || "Conflicting leave dates detected.");
      return;
    }

    if (isInsufficient) {
      setErrorMsg(
        `Insufficient balance. You have ${selectedBalance?.remaining} days available, but requested ${durationResult.totalDays} day(s).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applyLeaveAction({
        leaveType,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession : undefined,
        totalDays: durationResult.totalDays,
        reason: reason.trim(),
        supportingDocumentUrl: supportingDocumentUrl.trim() || undefined,
      });

      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit leave application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Apply for Leave
              </h2>
              <p className="text-xs text-slate-500">
                Self-service submission with real-time duration & balance calculation
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

        {/* Applicant Context Bar */}
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-100 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900">{employeeName}</span>
            <span className="text-blue-700 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px]">
              {employeeCode}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{departmentName}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Manager: <span className="font-semibold text-slate-800">{reportingManagerName}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
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

          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Leave Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_LEAVE_TYPES.map((lt) => {
                const bal = balances.find((b) => b.leaveType === lt.leaveType);
                const isSelected = leaveType === lt.leaveType;
                return (
                  <button
                    key={lt.leaveType}
                    type="button"
                    onClick={() => {
                      setLeaveType(lt.leaveType as LeaveType);
                      if (!lt.allowHalfDay && isHalfDay) {
                        setIsHalfDay(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-blue-900"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{lt.code}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {bal ? `${bal.remaining} left` : "--"}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium truncate">{lt.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD-MM-YYYY (e.g. 24-10-2026)"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (isHalfDay) setEndDate(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  disabled={isHalfDay}
                  value={isHalfDay ? startDate : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full text-xs px-3 py-2 border rounded-lg text-slate-900 font-medium focus:outline-hidden ${
                    isHalfDay
                      ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                      : "border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  }`}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Half Day Options */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => {
                  setIsHalfDay(e.target.checked);
                  if (e.target.checked) {
                    setEndDate(startDate);
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Request Half-Day Leave (0.5 day)
              </span>
            </label>

            {isHalfDay && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHalfDaySession("FIRST_HALF")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                    halfDaySession === "FIRST_HALF"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  First Half (Morning)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDaySession("SECOND_HALF")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                    halfDaySession === "SECOND_HALF"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Second Half (Afternoon)
                </button>
              </div>
            )}
          </div>

          {/* Real-Time Duration Calculation Breakdown Badge */}
          {durationResult.isValid && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Calculated Duration:
                </span>
                <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {durationResult.totalDays} Working Day(s)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="text-slate-600">
                  Working Days: <strong className="text-slate-900">{durationResult.eligibleWorkingDays}</strong>
                </div>
                <div className="text-slate-600">
                  Weekends Excluded: <strong className="text-slate-900">{durationResult.weekendDays}</strong>
                </div>
                <div className="text-slate-600">
                  Holidays Excluded: <strong className="text-slate-900">{durationResult.holidayDays}</strong>
                </div>
              </div>

              {conflictResult.hasConflict && (
                <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {conflictResult.reason}
                </div>
              )}

              {isInsufficient && (
                <div className="text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Insufficient balance! Remaining: {selectedBalance?.remaining} days.
                </div>
              )}
            </div>
          )}

          {/* Reason for Leave */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the purpose of leave (e.g. medical appointment, family wedding, personal errand)..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Optional Supporting Document URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Supporting Document (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                PDF / JPG medical certificate or approval doc
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://docs.vsecure.internal/medical-cert-001.pdf"
                value={supportingDocumentUrl}
                onChange={(e) => setSupportingDocumentUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isInsufficient || conflictResult.hasConflict}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Submit Leave Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
