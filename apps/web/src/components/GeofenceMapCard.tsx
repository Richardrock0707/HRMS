"use client";

import React, { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Navigation,
  Compass,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  DEFAULT_OFFICE_COORDINATES,
  calculateDistanceMeters,
  evaluateGeofenceStatus,
} from "@vsecure/shared";

export function GeofenceMapCard(): React.ReactElement {
  const office = DEFAULT_OFFICE_COORDINATES;

  // State for simulated employee coordinates
  const [empLat, setEmpLat] = useState<number>(12.93522);
  const [empLng, setEmpLng] = useState<number>(77.69463);
  const [locationPreset, setLocationPreset] = useState<string>("reception");

  const evaluation = evaluateGeofenceStatus(
    empLat,
    empLng,
    office.latitude,
    office.longitude,
    office.radiusMeters
  );

  const presets = [
    {
      id: "reception",
      label: "HQ Reception (5m)",
      lat: 12.93522,
      lng: 77.69463,
      desc: "Inside main entrance",
    },
    {
      id: "cafeteria",
      label: "HQ Cafeteria (42m)",
      lat: 12.93552,
      lng: 77.69488,
      desc: "Level 2 Dining area",
    },
    {
      id: "boundary",
      label: "Campus Boundary (92m)",
      lat: 12.93585,
      lng: 77.69518,
      desc: "Borderline perimeter",
    },
    {
      id: "outside",
      label: "Outside Geofence (480m)",
      lat: 12.9385,
      lng: 77.6975,
      desc: "Near Outer Ring Road",
    },
  ];

  const handleSelectPreset = (preset: (typeof presets)[0]) => {
    setLocationPreset(preset.id);
    setEmpLat(preset.lat);
    setEmpLng(preset.lng);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Office Geofence & GPS Anti-Spoof Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Haversine formula validates Android mobile check-ins within {office.radiusMeters}m of headquarters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            HQ Geofence Active (100m)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left: Office HQ Details & Visual Radar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">{office.name}</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{office.address}</p>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                HQ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">HQ Latitude</span>
                <span className="font-semibold text-slate-800">{office.latitude.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">HQ Longitude</span>
                <span className="font-semibold text-slate-800">{office.longitude.toFixed(4)}° E</span>
              </div>
            </div>
          </div>

          {/* Interactive Radar Illustration */}
          <div className="relative h-44 rounded-xl border border-slate-200 bg-linear-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden">
            {/* Concentric Geofence Rings */}
            <div className="absolute w-36 h-36 rounded-full border border-dashed border-blue-300 bg-blue-50/30 flex items-center justify-center">
              <span className="text-[9px] font-bold text-blue-500 tracking-wider absolute -top-3 px-1 bg-white rounded border border-blue-200">
                100m Perimeter
              </span>
              <div className="w-20 h-20 rounded-full border border-blue-200 bg-blue-100/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
              </div>
            </div>

            {/* Simulated Ping Pin */}
            <div
              className={`absolute flex flex-col items-center transition-all duration-300 ${
                evaluation.isWithin ? "text-emerald-600" : "text-rose-600"
              }`}
              style={{
                transform: `translate(${
                  evaluation.distanceMeters > 100
                    ? 80
                    : Math.min(65, (evaluation.distanceMeters / 100) * 60)
                }px, ${
                  evaluation.distanceMeters > 100
                    ? -50
                    : -Math.min(50, (evaluation.distanceMeters / 100) * 45)
                }px)`,
              }}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md ${
                  evaluation.isWithin ? "bg-emerald-600" : "bg-rose-600 animate-bounce"
                }`}
              >
                ●
              </div>
              <span className="text-[10px] font-bold font-mono px-1 py-0.5 rounded bg-white border shadow-2xs mt-0.5">
                {evaluation.distanceMeters}m
              </span>
            </div>

            <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-medium">
              HQ Center: (12.9352, 77.6946)
            </div>
          </div>
        </div>

        {/* Right: Real-time Haversine Test Console */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Coordinate Simulator (Haversine Tester)
              </span>
              <span className="text-xs text-slate-500">Preset Scenarios:</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    locationPreset === preset.id
                      ? "bg-blue-50 border-blue-300 text-blue-900 shadow-2xs ring-1 ring-blue-300"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{preset.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{preset.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Employee GPS Latitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={empLat}
                  onChange={(e) => {
                    setEmpLat(parseFloat(e.target.value) || 0);
                    setLocationPreset("custom");
                  }}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Employee GPS Longitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={empLng}
                  onChange={(e) => {
                    setEmpLng(parseFloat(e.target.value) || 0);
                    setLocationPreset("custom");
                  }}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Real-time Math Output Result Box */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              evaluation.isWithin
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                : "bg-rose-50/60 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {evaluation.isWithin ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-bold tracking-tight">
                    {evaluation.isWithin ? "Valid Attendance Check-In" : "Check-In Rejected (Outside Perimeter)"}
                  </div>
                  <p className="text-xs font-medium mt-0.5 opacity-90">{evaluation.message}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-bold">
                  {evaluation.distanceMeters}
                  <span className="text-xs font-normal ml-0.5">meters</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-75">
                  Calculated Distance
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-mono">
                Formula: Haversine(Δlat, Δlon, R=6371km)
              </span>
              <span className="font-semibold">
                Status: {evaluation.accuracyStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
