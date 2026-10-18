"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Compass,
  MapPin,
  Settings,
  Briefcase,
  FileSpreadsheet,
  Smartphone,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import {
  AttendanceRecordItem,
  AttendanceDashboardStats,
  AttendancePolicyInput,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  VSECURE_CONFIG,
} from "@vsecure/shared";
import { AttendanceSummaryCards } from "@/components/attendance/AttendanceSummaryCards";
import { LiveAttendanceTable } from "@/components/attendance/LiveAttendanceTable";
import { AttendanceMapVisualizer } from "@/components/attendance/AttendanceMapVisualizer";
import { AttendanceCorrectionsDrawer } from "@/components/attendance/AttendanceCorrectionsDrawer";
import { AttendancePolicyModal } from "@/components/attendance/AttendancePolicyModal";
import { FieldDutyModal } from "@/components/attendance/FieldDutyModal";
import { PunchSimulatorModal } from "@/components/attendance/PunchSimulatorModal";
import { INITIAL_CORRECTION_REQUESTS, INITIAL_FIELD_VISITS } from "@/lib/attendanceData";

interface AttendanceClientViewProps {
  initialStats: AttendanceDashboardStats;
  initialRecords: AttendanceRecordItem[];
  initialPolicy: AttendancePolicyInput;
  userRole: string;
}

export function AttendanceClientView({
  initialStats,
  initialRecords,
  initialPolicy,
  userRole,
}: AttendanceClientViewProps): React.ReactElement {
  const [stats, setStats] = useState(initialStats);
  const [records, setRecords] = useState(initialRecords);
  const [policy, setPolicy] = useState(initialPolicy);

  // Active View Tab: "TABLE" | "MAP" | "FIELD_DUTY"
  const [activeTab, setActiveTab] = useState<"TABLE" | "MAP" | "FIELD_DUTY">("TABLE");

  // Modals & Drawers state
  const [isCorrectionsOpen, setIsCorrectionsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isFieldDutyOpen, setIsFieldDutyOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordItem | null>(null);

  // Live IST Clock
  const [liveTime, setLiveTime] = useState(formatTime12HourIST(new Date()));
  const [liveDate, setLiveDate] = useState(formatDateDDMMYYYY(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(formatTime12HourIST(now));
      setLiveDate(formatDateDDMMYYYY(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Regional IST Clock Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Live Attendance & Geofence Hub
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Phase 3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS coordinates, 100m geofence validation & field engineer tracking across Karnataka
          </p>
        </div>

        {/* Live IST Clock Card */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-blue-700 font-mono tracking-tight">
                {liveTime}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">IST</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {liveDate} • Asia/Kolkata
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test GPS Punch Simulator */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test GPS Punch</span>
          </button>

          {/* Log Field Duty Visit */}
          <button
            onClick={() => setIsFieldDutyOpen(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Log Field Duty</span>
          </button>

          {/* Review Corrections Queue */}
          <button
            onClick={() => setIsCorrectionsOpen(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Corrections ({stats.pendingCorrections})</span>
          </button>

          {/* Attendance Policy Settings */}
          {(userRole === "SUPER_ADMIN" || userRole === "HR_ADMIN") && (
            <button
              onClick={() => setIsPolicyOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Policy (100m)</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-xs"
            title="Refresh Attendance Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 KPI Attendance Summary Cards */}
      <AttendanceSummaryCards stats={stats} />

      {/* Main Content Area with View Tabs */}
      <div className="space-y-4">
        {/* Navigation View Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("TABLE")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "TABLE"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📋 Live Attendance Table
            </button>

            <button
              onClick={() => setActiveTab("MAP")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "MAP"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GPS Geofence Radar Map</span>
            </button>

            <button
              onClick={() => setActiveTab("FIELD_DUTY")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "FIELD_DUTY"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Field Engineer Visits ({INITIAL_FIELD_VISITS.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Geofence: <strong>{policy.defaultGeofenceRadiusMeters}m</strong> • Shift:{" "}
            <strong>{policy.shiftStartTime} - {policy.shiftEndTime}</strong> (15m grace)
          </span>
        </div>

        {/* Tab 1: Dense Live Attendance Table */}
        {activeTab === "TABLE" && (
          <LiveAttendanceTable
            records={records}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />
        )}

        {/* Tab 2: GPS Geofence Radar Map */}
        {activeTab === "MAP" && <AttendanceMapVisualizer records={records} />}

        {/* Tab 3: Field Duty Visits Log */}
        {activeTab === "FIELD_DUTY" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Field Engineer Client Site Visit History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track client locations, work order numbers, and verified on-site service duration
                </p>
              </div>

              <button
                onClick={() => setIsFieldDutyOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>+ Log New Visit</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {INITIAL_FIELD_VISITS.map((visit) => (
                <div key={visit.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                        FE
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {visit.employeeName}
                          </span>
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1 rounded font-bold border border-blue-200">
                            {visit.employeeCode}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                            {visit.workOrderNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {visit.clientName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-800 block">
                        {visit.checkInTime} &rarr; {visit.checkOutTime || "In Progress"}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                        {visit.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <p className="italic">&ldquo;{visit.visitNotes}&rdquo;</p>
                    <div className="mt-1 pt-1 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Coordinates: {visit.latitude.toFixed(4)}° N, {visit.longitude.toFixed(4)}° E</span>
                      <span>GPS Accuracy: &plusmn;{visit.gpsAccuracyMeters}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Punch Security & GPS Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    {selectedRecord.employeeName}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedRecord.employeeCode} • {selectedRecord.designation}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedRecord.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">DATE</span>
                  <span className="font-bold text-slate-800">{selectedRecord.attendanceDate}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">PUNCH TIME (IST)</span>
                  <span className="font-mono font-bold text-blue-700">{selectedRecord.checkInTime}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">DISTANCE FROM HQ</span>
                  <span className="font-bold text-slate-800">{selectedRecord.distanceFromOfficeMeters} meters</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">GPS ACCURACY</span>
                  <span className="font-bold text-slate-800">&plusmn;{Math.round(selectedRecord.gpsAccuracyMeters)}m precision</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Geofence Status:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedRecord.isWithinGeofence ? "Valid Inside Perimeter" : "Outside Geofence"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Mock Location Check:</span>
                  <span className="font-bold text-slate-800">
                    {selectedRecord.isMockLocation ? "Flagged (Spoofed)" : "Clean (Hardware Sensor)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Premises / Location:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.locationName}</span>
                </div>
              </div>

              {selectedRecord.rejectionReason && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <strong>Notice:</strong> {selectedRecord.rejectionReason}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close Audit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawers and Modals */}
      <AttendanceCorrectionsDrawer
        isOpen={isCorrectionsOpen}
        onClose={() => setIsCorrectionsOpen(false)}
        corrections={INITIAL_CORRECTION_REQUESTS}
        onRefresh={handleRefresh}
      />

      <AttendancePolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        currentPolicy={policy}
        onSuccess={handleRefresh}
      />

      <FieldDutyModal
        isOpen={isFieldDutyOpen}
        onClose={() => setIsFieldDutyOpen(false)}
        onSuccess={handleRefresh}
      />

      <PunchSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
