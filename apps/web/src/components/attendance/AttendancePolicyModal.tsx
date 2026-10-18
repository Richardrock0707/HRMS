"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Clock,
  Compass,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AttendancePolicyInput } from "@vsecure/shared";
import { updateAttendancePolicyAction } from "@/actions/attendanceActions";

interface AttendancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPolicy: AttendancePolicyInput;
  onSuccess?: () => void;
}

export function AttendancePolicyModal({
  isOpen,
  onClose,
  currentPolicy,
  onSuccess,
}: AttendancePolicyModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState<AttendancePolicyInput>({
    ...currentPolicy,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await updateAttendancePolicyAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update policy." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Attendance & Geofence Policy
              </h3>
              <p className="text-xs text-slate-500">
                Configure shift schedules, 100m geofence & anti-spoofing controls
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* 1. Geofence Perimeter Radius */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Default Office Geofence Radius (Meters)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={20}
                max={1000}
                value={formData.defaultGeofenceRadiusMeters}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultGeofenceRadiusMeters: parseInt(e.target.value, 10) || 100,
                  })
                }
                className="w-32 text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
              <span className="text-xs text-slate-500">
                Default: <strong>100m</strong>. Allowable GPS distance radius around VSecure HQ.
              </span>
            </div>
          </div>

          {/* 2. Shift Timing & Grace Period */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Shift Start (IST)
              </label>
              <input
                type="text"
                value={formData.shiftStartTime}
                onChange={(e) =>
                  setFormData({ ...formData, shiftStartTime: e.target.value })
                }
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                placeholder="09:30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Shift End (IST)
              </label>
              <input
                type="text"
                value={formData.shiftEndTime}
                onChange={(e) =>
                  setFormData({ ...formData, shiftEndTime: e.target.value })
                }
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                placeholder="18:30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Grace Period
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={formData.gracePeriodMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gracePeriodMinutes: parseInt(e.target.value, 10) || 15,
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                />
                <span className="text-xs text-slate-500">min</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Check-ins arriving after <strong>09:45 AM</strong> (09:30 + 15m) are automatically classified as <strong>Late Arrival</strong>.
          </p>

          {/* 3. Working Duration Thresholds */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Full-Day Minimum Hours
              </label>
              <input
                type="number"
                step="0.5"
                min={4}
                max={12}
                value={formData.minHoursFullDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minHoursFullDay: parseFloat(e.target.value) || 8.0,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold"
              />
              <span className="text-[10px] text-slate-400">Typically 8.0 hours</span>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Half-Day Minimum Hours
              </label>
              <input
                type="number"
                step="0.5"
                min={2}
                max={6}
                value={formData.minHoursHalfDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minHoursHalfDay: parseFloat(e.target.value) || 4.5,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold"
              />
              <span className="text-[10px] text-slate-400">Typically 4.5 hours</span>
            </div>
          </div>

          {/* 4. Security & Anti-Spoofing Toggles */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Security & Anti-Spoofing Enforcements
            </span>

            {/* Block Mock Location */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Block Mock GPS & Location Spoofing Apps
                </span>
                <span className="text-[11px] text-slate-500">
                  Instantly reject punches using mock providers on Android
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.blockMockLocation}
                onChange={(e) =>
                  setFormData({ ...formData, blockMockLocation: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* Require Selfie Verification */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Mandatory Selfie Camera Capture
                </span>
                <span className="text-[11px] text-slate-500">
                  Require real-time snapshot when punching on Android
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireSelfie}
                onChange={(e) =>
                  setFormData({ ...formData, requireSelfie: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Policy Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
