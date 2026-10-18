"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatTime12HourIST, formatDateDDMMYYYY } from "@vsecure/shared";

interface DeviceRequest {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  oldDeviceId: string;
  newDeviceId: string;
  newDeviceModel: string;
  reason: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const mockRequests: DeviceRequest[] = [
  {
    id: "dev_req_001",
    employeeCode: "VS-004",
    employeeName: "Kavita Nair",
    department: "Cloud & Operations",
    oldDeviceId: "android_motoedge_004 (Motorola Edge 50 Pro)",
    newDeviceId: "android_pixel8a_new_kavita",
    newDeviceModel: "Google Pixel 8a (Upgraded)",
    reason: "Upgraded personal handset to Pixel 8a. Need attendance check-in device re-binding.",
    requestedAt: "18-10-2026 • 09:12 AM IST",
    status: "PENDING",
  },
];

interface DeviceRequestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceRequestsDrawer({
  isOpen,
  onClose,
}: DeviceRequestsDrawerProps): React.ReactElement | null {
  const [requests, setRequests] = useState<DeviceRequest[]>(mockRequests);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    setFeedback(
      action === "APPROVED"
        ? "Hardware device binding updated. Employee can now mark attendance from their new Pixel 8a."
        : "Device change request rejected."
    );
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Android Hardware Change Approvals
                </h3>
                <p className="text-[11px] text-slate-500">Anti-spoofing single-device perimeter</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {feedback && (
            <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Requests List */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
              Pending Authorization ({requests.filter((r) => r.status === "PENDING").length})
            </div>

            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{req.employeeName}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        {req.employeeCode}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{req.department}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      req.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : req.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Current Bound Device
                    </span>
                    <span className="font-mono text-slate-600 text-[11px] line-through">
                      {req.oldDeviceId}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-blue-600 block font-semibold uppercase">
                      Requested New Handset
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{req.newDeviceModel}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block">
                      ID: {req.newDeviceId}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Employee Justification
                    </span>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">&quot;{req.reason}&quot;</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Submitted: {req.requestedAt}</span>
                </div>

                {req.status === "PENDING" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAction(req.id, "APPROVED")}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Rebind</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "REJECTED")}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Enforced by Administrator Vishnu & HR Admins
        </div>
      </div>
    </div>
  );
}
