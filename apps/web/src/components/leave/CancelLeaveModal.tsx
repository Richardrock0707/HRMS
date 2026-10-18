"use client";

import React, { useState } from "react";
import {
  X,
  Slash,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { LeaveRecordItem } from "@vsecure/shared";
import { cancelLeaveRequestAction } from "@/actions/leaveActions";

interface CancelLeaveModalProps {
  request: LeaveRecordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelLeaveModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: CancelLeaveModalProps): React.ReactElement | null {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!reason || reason.trim().length < 3) {
      setErrorMsg("Please specify the reason for cancellation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await cancelLeaveRequestAction(request.id, reason.trim());
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Slash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Cancel Leave Request
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {request.referenceId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCancel} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>{request.leaveType}</span>
              <span>{request.totalDays} day(s)</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Dates: {request.startDate} to {request.endDate}
            </div>
            {request.status === "APPROVED" && (
              <div className="text-emerald-700 text-[11px] font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Deducted days will be automatically refunded back to your available balance.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Travel plans postponed, attending office..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Slash className="w-3.5 h-3.5" />
              )}
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
