"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { logFieldVisitAction } from "@/actions/attendanceActions";
import { LIVE_CLIENT_SITES } from "@/lib/attendanceData";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";
import { formatTime12HourIST } from "@vsecure/shared";

interface FieldDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FieldDutyModal({
  isOpen,
  onClose,
  onSuccess,
}: FieldDutyModalProps): React.ReactElement | null {
  const [selectedEmpId, setSelectedEmpId] = useState("emp_vsecure_004"); // Default: Kavita Nair (SRE)
  const [selectedSiteId, setSelectedSiteId] = useState(LIVE_CLIENT_SITES[0]?.id || "site_client_001");
  const [workOrder, setWorkOrder] = useState("WO-INF-2026-19");
  const [visitNotes, setVisitNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const currentSite = LIVE_CLIENT_SITES.find((s) => s.id === selectedSiteId) || LIVE_CLIENT_SITES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitNotes.trim()) {
      setMessage({ type: "error", text: "Please enter brief field visit notes." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const now = new Date();
    const res = await logFieldVisitAction({
      employeeId: selectedEmpId,
      clientSiteId: selectedSiteId,
      clientName: currentSite?.clientName || "Client Site",
      workOrderNumber: workOrder,
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hrs ago
      checkOutTime: now,
      latitude: currentSite?.latitude || 12.8452,
      longitude: currentSite?.longitude || 77.6602,
      gpsAccuracyMeters: 8.5,
      visitNotes,
      status: "COMPLETED",
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to log field visit." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Field Engineer Client Visit
              </h3>
              <p className="text-xs text-slate-500">
                Record site dispatch, client tasks, and work order completion
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Engineer Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Field Engineer / Staff
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
            >
              {INITIAL_STAFF_DIRECTORY.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) • {emp.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Client Site Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Assigned Client Location
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
            >
              {LIVE_CLIENT_SITES.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Site Geofence Details Badge */}
          {currentSite && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{currentSite.name}</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {currentSite.radiusMeters}m Geofence
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{currentSite.address}</p>
              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                <span>Contact: {currentSite.contactPerson}</span>
                <span>GPS: {currentSite.latitude.toFixed(4)}°, {currentSite.longitude.toFixed(4)}°</span>
              </div>
            </div>
          )}

          {/* Work Order Number */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Work Order / Ticket Number
            </label>
            <input
              type="text"
              value={workOrder}
              onChange={(e) => setWorkOrder(e.target.value)}
              placeholder="e.g. WO-INF-2026-09"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
            />
          </div>

          {/* Visit Notes */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Visit Summary & Tasks Completed
            </label>
            <textarea
              rows={3}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="Describe work completed at client site (e.g. Datacenter server rack health audit, router firmware upgrade, security patch deployment)..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 placeholder:text-slate-400"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm & Record Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
