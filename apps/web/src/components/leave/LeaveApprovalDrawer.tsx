"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Loader2,
  Building2,
} from "lucide-react";
import {
  LeaveRecordItem,
  getLeaveTypeBadge,
  getLeaveApprovalBadge,
} from "@vsecure/shared";
import { reviewLeaveRequestAction } from "@/actions/leaveActions";

interface LeaveApprovalDrawerProps {
  request: LeaveRecordItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserRole: string;
  currentUserName: string;
  onDecisionComplete?: () => void;
}

export function LeaveApprovalDrawer({
  request,
  isOpen,
  onClose,
  currentUserId,
  currentUserRole,
  currentUserName,
  onDecisionComplete,
}: LeaveApprovalDrawerProps): React.ReactElement | null {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const isApplicantSelf = request.employeeId === currentUserId;
  const isFinalized = request.status !== "PENDING";
  const typeBadge = getLeaveTypeBadge(request.leaveType);
  const statusBadge = getLeaveApprovalBadge(request.status);

  const handleDecision = async (decision: "APPROVE" | "REJECT") => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (decision === "REJECT" && (!remarks || remarks.trim().length < 3)) {
      setErrorMsg("Please provide a mandatory reason for declining this leave application.");
      return;
    }

    if (isApplicantSelf) {
      setErrorMsg("Anti-Self-Approval Violation: You cannot review or approve your own leave application.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reviewLeaveRequestAction(request.id, decision, remarks.trim() || undefined);
      setSuccessMsg(res.message);
      setTimeout(() => {
        onDecisionComplete?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              Review Leave Application
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {request.referenceId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
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

          {isApplicantSelf && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <div>
                <strong>Anti-Self-Approval Enforcement:</strong> This is your own leave application. You must have your reporting manager or HR Admin action it.
              </div>
            </div>
          )}

          {/* Applicant Info Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {request.employeeName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{request.employeeName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {request.employeeCode} • {request.designation}
                  </div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${typeBadge.badgeClass}`}>
                {typeBadge.code} - {typeBadge.label}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Dept: <strong>{request.departmentName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted: <strong>{request.createdAt}</strong></span>
              </div>
            </div>
          </div>

          {/* Leave Schedule Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Requested Period
              </span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {request.totalDays} Day(s) {request.isHalfDay && `(${request.halfDaySession || "Half Day"})`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium text-slate-800">
              <div>
                From: <strong>{request.startDate}</strong>
              </div>
              <div className="text-slate-400">➔</div>
              <div>
                To: <strong>{request.endDate}</strong>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-500 text-[11px]">Reason for Leave:</span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-50 text-slate-800 text-xs leading-relaxed border border-slate-100">
                {request.reason}
              </p>
            </div>

            {request.supportingDocumentUrl && (
              <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                <FileText className="w-3.5 h-3.5" />
                <a
                  href={request.supportingDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  View Supporting Document Attached
                </a>
              </div>
            )}
          </div>

          {/* Decision Remarks */}
          {!isFinalized && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reviewer Remarks / Feedback
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional approval notes or mandatory rejection explanation..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
              />
            </div>
          )}

          {isFinalized && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-1">Finalized Status: {request.status}</div>
              {request.approvedBy && (
                <div className="text-slate-600">Actioned by: <strong>{request.approvedBy}</strong></div>
              )}
              {request.rejectionReason && (
                <div className="text-rose-600 mt-1">Rejection Reason: {request.rejectionReason}</div>
              )}
            </div>
          )}

          {/* Actions */}
          {!isFinalized && (
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDecision("REJECT")}
                disabled={isSubmitting || isApplicantSelf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleDecision("APPROVE")}
                disabled={isSubmitting || isApplicantSelf}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Approve Leave
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
