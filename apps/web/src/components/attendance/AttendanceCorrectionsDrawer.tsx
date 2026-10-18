"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { reviewAttendanceCorrectionAction } from "@/actions/attendanceActions";
import { AttendanceCorrectionItem } from "@/lib/attendanceData";

interface AttendanceCorrectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  corrections: AttendanceCorrectionItem[];
  onRefresh?: () => void;
}

export function AttendanceCorrectionsDrawer({
  isOpen,
  onClose,
  corrections,
  onRefresh,
}: AttendanceCorrectionsDrawerProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const pendingList = corrections.filter((c) => c.status === "PENDING");
  const historyList = corrections.filter((c) => c.status !== "PENDING");

  const displayedList = activeTab === "PENDING" ? pendingList : historyList;

  const handleAction = async (id: string, decision: "APPROVED" | "REJECTED") => {
    setActioningId(id);
    setFeedbackMsg(null);

    const notes = reviewerNotes[id] || (decision === "APPROVED" ? "Approved by HR Admin" : "Rejected");
    const res = await reviewAttendanceCorrectionAction(id, decision, notes);

    setActioningId(null);
    if (res.success) {
      setFeedbackMsg({ type: "success", text: res.message });
      onRefresh?.();
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Failed to action request." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Attendance Correction Queue
              </h3>
              <p className="text-xs text-slate-500">
                Review missed punches, GPS errors & off-site attendance requests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-white text-orange-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Pending Review</span>
            <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center justify-center">
              {pendingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "HISTORY"
                ? "bg-white text-slate-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Actioned History</span>
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
              {historyList.length}
            </span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`m-4 p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* List of Requests */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {displayedList.length > 0 ? (
            displayedList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                {/* Employee and Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {item.employeeName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.employeeName}
                        </span>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1 rounded font-bold border border-blue-200">
                          {item.employeeCode}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {item.departmentName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : item.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Date & Requested Values */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      ATTENDANCE DATE
                    </span>
                    <span className="font-bold text-slate-800">{item.attendanceDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      ISSUE TYPE
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.requestType.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      REQUESTED IN
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {item.requestedCheckInTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      REQUESTED OUT
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {item.requestedCheckOutTime || "--"}
                    </span>
                  </div>
                </div>

                {/* Reason / Explanation */}
                <div className="text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Employee Explanation
                  </span>
                  <p className="text-slate-700 bg-slate-50/70 p-2 rounded border border-slate-100 text-xs italic">
                    &ldquo;{item.reason}&rdquo;
                  </p>
                </div>

                {/* Action Form or Audit Trail */}
                {item.status === "PENDING" ? (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <input
                      type="text"
                      placeholder="Optional HR reviewer remarks..."
                      value={reviewerNotes[item.id] || ""}
                      onChange={(e) =>
                        setReviewerNotes({ ...reviewerNotes, [item.id]: e.target.value })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(item.id, "APPROVED")}
                        disabled={actioningId === item.id}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {actioningId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve Correction</span>
                      </button>

                      <button
                        onClick={() => handleAction(item.id, "REJECTED")}
                        disabled={actioningId === item.id}
                        className="flex-1 py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Reviewed by: {item.actionedBy || "HR Admin"}</span>
                    <span>{item.actionedAt}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">
                {activeTab === "PENDING"
                  ? "No pending corrections"
                  : "No past actioned corrections"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                All employee attendance punch requests have been processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
