"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { formatDateDDMMYYYY, formatTime12HourIST } from "@vsecure/shared";

interface AttendanceRecord {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  department: string;
  checkInTime: string; // e.g. "09:28 AM"
  distanceFromHQ: number; // in meters
  isWithinGeofence: boolean;
  status: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT";
  deviceId: string;
}

const mockRecords: AttendanceRecord[] = [
  {
    id: "att_001",
    employeeCode: "VS-001",
    name: "Vishnu",
    role: "Super Administrator",
    department: "Engineering & Architecture",
    checkInTime: "09:28 AM",
    distanceFromHQ: 5,
    isWithinGeofence: true,
    status: "PRESENT",
    deviceId: "Pixel 9 Pro • SM-V001",
  },
  {
    id: "att_002",
    employeeCode: "VS-002",
    name: "Priya Sharma",
    role: "HR Admin",
    department: "People & HR",
    checkInTime: "09:34 AM",
    distanceFromHQ: 24,
    isWithinGeofence: true,
    status: "PRESENT",
    deviceId: "Galaxy S24 • SM-V002",
  },
  {
    id: "att_003",
    employeeCode: "VS-003",
    name: "Arjun Mehta",
    role: "Manager",
    department: "Engineering & Architecture",
    checkInTime: "09:48 AM",
    distanceFromHQ: 48,
    isWithinGeofence: true,
    status: "LATE",
    deviceId: "OnePlus 12 • SM-V003",
  },
  {
    id: "att_004",
    employeeCode: "VS-004",
    name: "Kavita Nair",
    role: "Employee",
    department: "Cloud & Operations",
    checkInTime: "09:15 AM",
    distanceFromHQ: 12,
    isWithinGeofence: true,
    status: "PRESENT",
    deviceId: "Moto Edge 50 • SM-V004",
  },
];

export function AttendancePreviewTable(): React.ReactElement {
  const getStatusBadge = (status: AttendanceRecord["status"], isWithin: boolean) => {
    if (!isWithin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Outside Geofence
        </span>
      );
    }

    switch (status) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Late (IST)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 shadow-sm overflow-hidden">
      <div className="pb-5 border-b border-white/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Today&apos;s Live Attendance Feed
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric and GPS geofence verifications from the VSecure Android app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 glass-pill px-3 py-1 rounded-full">
            Date: <span className="font-mono font-bold text-slate-900">{formatDateDDMMYYYY()}</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Check-In (IST)</th>
              <th className="py-3 px-4">GPS Accuracy & Distance</th>
              <th className="py-3 px-4">Geofence Status</th>
              <th className="py-3 px-4">Device Binding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 font-medium text-slate-700">
            {mockRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {record.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{record.name}</span>
                        {record.employeeCode === "VS-001" && (
                          <span className="text-[9px] font-bold px-1 rounded bg-blue-100 text-blue-800">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {record.employeeCode}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{record.department}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                  {record.checkInTime}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{record.distanceFromHQ}m from HQ</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Permitted: ≤ 100m
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {getStatusBadge(record.status, record.isWithinGeofence)}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[130px]">{record.deviceId}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between px-4">
        <span>Showing 4 active test attendances out of 25 capacity</span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
          View All Logs →
        </span>
      </div>
    </div>
  );
}
