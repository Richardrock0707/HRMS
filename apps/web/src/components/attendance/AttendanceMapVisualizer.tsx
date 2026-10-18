"use client";

import React, { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Building,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  DEFAULT_OFFICE_COORDINATES,
  AttendanceRecordItem,
  calculateDistanceMeters,
} from "@vsecure/shared";
import { LIVE_CLIENT_SITES } from "@/lib/attendanceData";

interface AttendanceMapVisualizerProps {
  records: AttendanceRecordItem[];
}

export function AttendanceMapVisualizer({ records }: AttendanceMapVisualizerProps): React.ReactElement {
  const [selectedLocation, setSelectedLocation] = useState<string>("loc_vsecure_hq");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordItem | null>(null);

  const office = DEFAULT_OFFICE_COORDINATES;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Live GPS Geofence Perimeter Map
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              100m Active Radius
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time satellite coordinates & Haversine distance tracking against authorized premises
          </p>
        </div>

        {/* Site Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setSelectedLocation("loc_vsecure_hq")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedLocation === "loc_vsecure_hq"
                ? "bg-white text-blue-700 shadow-xs font-bold border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🏢 VSecure HQ (100m)
          </button>
          {LIVE_CLIENT_SITES.map((site) => (
            <button
              key={site.id}
              onClick={() => setSelectedLocation(site.id)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedLocation === site.id
                  ? "bg-white text-blue-700 shadow-xs font-bold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📍 {site.clientName}
            </button>
          ))}
        </div>
      </div>

      {/* Map Radar Canvas & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Visual Geofence Radar Canvas */}
        <div className="lg:col-span-2 p-6 bg-slate-50 flex flex-col items-center justify-center relative min-h-[420px]">
          {/* Circular Geofence Rings */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-xs">
            {/* Outer Geofence Perimeter (100m / configured radius) */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-blue-500 bg-blue-50/40 flex items-center justify-center">
              {/* Inner High Precision Boundary (50m) */}
              <div className="absolute inset-16 rounded-full border border-emerald-300 bg-emerald-50/30 flex items-center justify-center">
                {/* Center HQ Office Icon */}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ring-4 ring-blue-100 z-10">
                  <Building className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Radar Sweep Animation Line */}
            <div className="absolute inset-0 rounded-full border border-blue-400/20 pointer-events-none" />

            {/* Legend Labels on Radar */}
            <span className="absolute top-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              North (Bangalore ORR)
            </span>
            <span className="absolute right-2 text-[10px] font-bold text-slate-400">
              100m Geofence
            </span>
            <span className="absolute bottom-2 text-[10px] font-bold text-slate-400">
              Tech Park Campus
            </span>

            {/* Plotted Employee Punch Pins */}
            {records.map((rec, idx) => {
              // Calculate visual offset based on index and distance
              const angle = idx * 65 + 30;
              const rad = (angle * Math.PI) / 180;
              // Normalize distance to radius percentage (max 100m -> 130px)
              const distScale = Math.min(150, Math.max(25, rec.distanceFromOfficeMeters * 1.4));
              const x = Math.cos(rad) * (rec.isWithinGeofence ? distScale : 160);
              const y = Math.sin(rad) * (rec.isWithinGeofence ? distScale : 160);

              const isSelected = selectedRecord?.id === rec.id;

              return (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute group z-20 transition-transform ${
                    isSelected ? "scale-125 ring-4 ring-blue-400" : "hover:scale-110"
                  }`}
                  title={`${rec.employeeName} (${rec.employeeCode}) - ${rec.distanceFromOfficeMeters}m`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md ${
                      rec.status === "PRESENT"
                        ? "bg-emerald-600 ring-2 ring-emerald-200"
                        : rec.status === "LATE"
                        ? "bg-amber-600 ring-2 ring-amber-200"
                        : rec.status === "FIELD_DUTY"
                        ? "bg-indigo-600 ring-2 ring-indigo-200"
                        : "bg-rose-600 ring-2 ring-rose-200"
                    }`}
                  >
                    {rec.employeeCode.replace("VS-", "")}
                  </div>

                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-30">
                    <p className="font-bold">{rec.employeeName}</p>
                    <p className="text-slate-300">
                      {rec.distanceFromOfficeMeters}m from center • ±{Math.round(rec.gpsAccuracyMeters)}m
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Map Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>Present (&le; 100m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
              <span>Late Arrival</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-700" />
              <span>Field Duty / Client Site</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700" />
              <span>Outside Geofence / Rejected</span>
            </div>
          </div>
        </div>

        {/* Selected Point Inspector & Geofence Details */}
        <div className="p-5 flex flex-col justify-between bg-white space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Geofence Parameters
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Perimeter
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Primary Office Center</p>
                <p className="font-bold text-slate-900 mt-0.5">{office.name}</p>
                <p className="text-slate-500 text-[11px]">{office.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">LATITUDE</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {office.latitude.toFixed(4)}° N
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">LONGITUDE</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {office.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">
                    Allowable Radius
                  </span>
                  <span className="text-sm font-extrabold text-blue-900">
                    {office.radiusMeters} Meters
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Selected Punch Inspection */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block mb-2">
              Inspected Punch Event
            </span>

            {selectedRecord ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {selectedRecord.employeeName}
                    </span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1 rounded font-bold">
                      {selectedRecord.employeeCode}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      selectedRecord.status === "PRESENT"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedRecord.status === "LATE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PUNCH TIME</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.checkInTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRecord.distanceFromOfficeMeters}m from center
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">GPS ACCURACY</span>
                    <span className="font-semibold text-slate-800">
                      &plusmn;{Math.round(selectedRecord.gpsAccuracyMeters)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">VERIFICATION</span>
                    <span className="font-semibold text-emerald-700">
                      {selectedRecord.isWithinGeofence ? "Valid Geofence" : "Outside Perimeter"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Coordinates: {selectedRecord.checkInLat.toFixed(4)}, {selectedRecord.checkInLng.toFixed(4)}</span>
                  <span className="text-blue-600 font-semibold">{selectedRecord.locationName}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Click any numbered pin on the radar to inspect employee distance and satellite GPS fix.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
