"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Building,
} from "lucide-react";
import {
  AttendanceRecordItem,
  getAttendanceStatusBadge,
  getReviewStatusBadge,
} from "@vsecure/shared";

interface LiveAttendanceTableProps {
  records: AttendanceRecordItem[];
  onSelectRecord?: (record: AttendanceRecordItem) => void;
}

export function LiveAttendanceTable({
  records,
  onSelectRecord,
}: LiveAttendanceTableProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"name" | "time" | "distance">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            rec.employeeName.toLowerCase().includes(q) ||
            rec.employeeCode.toLowerCase().includes(q) ||
            rec.designation.toLowerCase().includes(q) ||
            rec.departmentName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Status filter
        if (selectedStatus !== "ALL") {
          if (selectedStatus === "FLAGGED") {
            if (!rec.isMockLocation && rec.reviewStatus !== "FLAGGED_SUSPICIOUS") {
              return false;
            }
          } else if (rec.status !== selectedStatus) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== "ALL" && rec.attendanceType !== selectedType) {
          return false;
        }

        // Department filter
        if (selectedDept !== "ALL" && rec.departmentId !== selectedDept) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortOrder === "asc"
            ? a.employeeName.localeCompare(b.employeeName)
            : b.employeeName.localeCompare(a.employeeName);
        }
        if (sortField === "distance") {
          return sortOrder === "asc"
            ? a.distanceFromOfficeMeters - b.distanceFromOfficeMeters
            : b.distanceFromOfficeMeters - a.distanceFromOfficeMeters;
        }
        // time sort
        return sortOrder === "asc"
          ? a.checkInTime.localeCompare(b.checkInTime)
          : b.checkInTime.localeCompare(a.checkInTime);
      });
  }, [records, searchQuery, selectedStatus, selectedType, selectedDept, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const departments = useMemo(() => {
    const set = new Map<string, string>();
    records.forEach((r) => set.set(r.departmentId, r.departmentName));
    return Array.from(set.entries());
  }, [records]);

  const handleExportCSV = () => {
    const headers = [
      "Employee Code",
      "Full Name",
      "Department",
      "Designation",
      "Date",
      "Check-In (IST)",
      "Check-Out (IST)",
      "Duration",
      "Status",
      "Type",
      "Distance (m)",
      "Accuracy (m)",
      "Geofence Status",
      "Location Name",
    ];

    const rows = filteredRecords.map((r) => [
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.departmentName}"`,
      `"${r.designation}"`,
      r.attendanceDate,
      r.checkInTime,
      r.checkOutTime || "--",
      r.totalDuration || "--",
      r.status,
      r.attendanceType,
      r.distanceFromOfficeMeters,
      Math.round(r.gpsAccuracyMeters),
      r.isWithinGeofence ? "INSIDE" : "OUTSIDE",
      `"${r.locationName}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VSecure_Attendance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID (VS-001), or Designation..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* Action buttons: Export CSV & Count */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredRecords.length}</strong> logs
            </span>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {[
              { id: "ALL", label: "All Logs" },
              { id: "PRESENT", label: "Present" },
              { id: "LATE", label: "Late Arrival" },
              { id: "FIELD_DUTY", label: "Field Duty" },
              { id: "HALF_DAY", label: "Half Day" },
              { id: "FLAGGED", label: "⚠️ Flagged GPS" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setSelectedStatus(pill.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedStatus === pill.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Department Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Dept:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Departments</option>
              {departments.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department & Role</th>
              <th className="py-3 px-4">Attendance Type</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => {
                    setSortField("time");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  <span>Check In / Out (IST)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => {
                    setSortField("distance");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  <span>Geofence & Accuracy</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((rec) => {
                const statusBadge = getAttendanceStatusBadge(rec.status);
                const reviewBadge = getReviewStatusBadge(rec.reviewStatus);

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectRecord?.(rec)}
                  >
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {rec.employeeName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">
                              {rec.employeeName}
                            </span>
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-bold border border-blue-200">
                              {rec.employeeCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                            {rec.designation}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {rec.departmentName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rec.locationName}
                      </span>
                    </td>

                    {/* Attendance Type */}
                    <td className="py-3.5 px-4">
                      {rec.attendanceType === "FIELD_DUTY" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Briefcase className="w-3 h-3" />
                          Field Duty ({rec.fieldVisitsCount} Visits)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Building className="w-3 h-3 text-slate-400" />
                          Office Branch
                        </span>
                      )}
                    </td>

                    {/* Check In / Out Time in 12-Hour IST */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1 text-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{rec.checkInTime}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Out: {rec.checkOutTime || "Pending Punch-Out"}
                      </div>
                    </td>

                    {/* Working Duration */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {rec.totalDuration || "In Progress"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Shift: 09:30 - 18:30
                      </span>
                    </td>

                    {/* Attendance Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.badgeClass}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Geofence Verification & GPS Accuracy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {rec.isWithinGeofence ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-800">
                          {rec.distanceFromOfficeMeters}m
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          of {rec.geofenceRadius}m limit
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-mono">
                          GPS: &plusmn;{Math.round(rec.gpsAccuracyMeters)}m
                        </span>
                        {rec.isMockLocation && (
                          <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1 rounded">
                            MOCK GPS
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quick Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord?.(rec);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-xs"
                        title="View GPS Punch Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No attendance logs found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria or filter pills.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 text-xs">
        <span className="text-slate-500 font-medium">
          Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
          <strong className="text-slate-800">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
