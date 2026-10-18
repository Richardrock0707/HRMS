"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { checkInAttendanceAction, checkOutAttendanceAction } from "@/actions/attendanceActions";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";
import { DEFAULT_OFFICE_COORDINATES } from "@vsecure/shared";

interface PunchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PunchSimulatorModal({
  isOpen,
  onClose,
  onSuccess,
}: PunchSimulatorModalProps): React.ReactElement | null {
  const [selectedEmpId, setSelectedEmpId] = useState("emp_vsecure_001");
  const [simulationPreset, setSimulationPreset] = useState<
    "INSIDE_HQ" | "OUTSIDE_PERIMETER" | "MOCK_GPS" | "WEAK_ACCURACY"
  >("INSIDE_HQ");
  const [punchMode, setPunchMode] = useState<"IN" | "OUT">("IN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsSubmitting(true);
    setResult(null);

    let lat: number = DEFAULT_OFFICE_COORDINATES.latitude;
    let lng: number = DEFAULT_OFFICE_COORDINATES.longitude;
    let accuracy = 10.0;
    let isMock = false;

    if (simulationPreset === "INSIDE_HQ") {
      lat = 12.93524; // 8 meters from HQ center
      lng = 77.69465;
      accuracy = 8.5;
    } else if (simulationPreset === "OUTSIDE_PERIMETER") {
      lat = 12.93850; // 380 meters away from HQ center
      lng = 77.69700;
      accuracy = 12.0;
    } else if (simulationPreset === "MOCK_GPS") {
      lat = 12.93520;
      lng = 77.69460;
      accuracy = 5.0;
      isMock = true;
    } else if (simulationPreset === "WEAK_ACCURACY") {
      lat = 12.93522;
      lng = 77.69462;
      accuracy = 95.0; // 95m weak accuracy
    }

    let res;
    if (punchMode === "IN") {
      res = await checkInAttendanceAction({
        employeeId: selectedEmpId,
        latitude: lat,
        longitude: lng,
        gpsAccuracyMeters: accuracy,
        deviceId: `android_simulated_${selectedEmpId}`,
        attendanceType: "OFFICE",
        isMockLocation: isMock,
        remarks: `Simulated ${simulationPreset} GPS punch`,
      });
    } else {
      res = await checkOutAttendanceAction({
        employeeId: selectedEmpId,
        latitude: lat,
        longitude: lng,
        gpsAccuracyMeters: accuracy,
        deviceId: `android_simulated_${selectedEmpId}`,
        isMockLocation: isMock,
        remarks: "Simulated Check-Out",
      });
    }

    setIsSubmitting(false);
    setResult(res);

    if (res.success) {
      onSuccess?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                GPS Attendance Test Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Test 100m geofence, anti-spoofing & punch calculations
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Result Alert */}
          {result && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
                result.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{result.message || result.error}</span>
            </div>
          )}

          {/* Punch Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setPunchMode("IN")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                punchMode === "IN"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🟢 Punch In (Check-In)
            </button>
            <button
              onClick={() => setPunchMode("OUT")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                punchMode === "OUT"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔴 Punch Out (Check-Out)
            </button>
          </div>

          {/* Employee Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Select Employee Account
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
            >
              {INITIAL_STAFF_DIRECTORY.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) • {emp.role}
                </option>
              ))}
            </select>
          </div>

          {/* Geofence Scenarios Presets */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              GPS Signal & Location Scenario
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "INSIDE_HQ",
                  title: "Inside HQ Geofence (8m from center)",
                  desc: "Valid coordinates: 12.93524° N, 77.69465° E • ±8.5m accuracy. (Expected: ACCEPTED)",
                  badge: "Valid Geofence",
                  badgeColor: "bg-emerald-100 text-emerald-800",
                },
                {
                  id: "OUTSIDE_PERIMETER",
                  title: "Outside 100m Perimeter (380m away)",
                  desc: "Coordinates: 12.93850° N, 77.69700° E • Exceeds 100m radius. (Expected: REJECTED)",
                  badge: "Outside Radius",
                  badgeColor: "bg-rose-100 text-rose-800",
                },
                {
                  id: "MOCK_GPS",
                  title: "Android Mock GPS Spoofing Provider",
                  desc: "Spoofed signal flag reported by Android Location API. (Expected: FLAGGED/BLOCKED)",
                  badge: "Anti-Spoofing Alert",
                  badgeColor: "bg-red-100 text-red-800",
                },
                {
                  id: "WEAK_ACCURACY",
                  title: "Degraded GPS Accuracy (±95m Weak Fix)",
                  desc: "Satellite lock degraded by indoor obstruction. (Expected: PENDING REVIEW)",
                  badge: "Low Accuracy",
                  badgeColor: "bg-amber-100 text-amber-800",
                },
              ].map((scenario) => (
                <label
                  key={scenario.id}
                  onClick={() => setSimulationPreset(scenario.id as any)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    simulationPreset === scenario.id
                      ? "border-blue-500 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="scenario"
                    checked={simulationPreset === scenario.id}
                    onChange={() => setSimulationPreset(scenario.id as any)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {scenario.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${scenario.badgeColor}`}
                      >
                        {scenario.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{scenario.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSimulate}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Execute GPS Punch Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
