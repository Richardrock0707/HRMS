"use client";

import React, { useState } from "react";
import {
  LeaveRecordItem,
  LeaveTransactionItem,
  getLeaveTypeBadge,
  getLeaveApprovalBadge,
} from "@vsecure/shared";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Slash,
  Download,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

interface LeaveRequestsTableProps {
  requests: LeaveRecordItem[];
  transactions: LeaveTransactionItem[];
  currentUserId: string;
  currentUserRole: string;
  onReviewRequest: (req: LeaveRecordItem) => void;
  onCancelRequest: (req: LeaveRecordItem) => void;
  activeTab: "my" | "approvals" | "all" | "ledger";
  onTabChange: (tab: "my" | "approvals" | "all" | "ledger") => void;
  pendingApprovalsCount: number;
}

export function LeaveRequestsTable({
  requests,
  transactions,
  currentUserId,
  currentUserRole,
  onReviewRequest,
  onCancelRequest,
  activeTab,
  onTabChange,
  pendingApprovalsCount,
}: LeaveRequestsTableProps): React.ReactElement {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const isManagerOrAdmin =
    currentUserRole === "SUPER_ADMIN" ||
    currentUserRole === "HR_ADMIN" ||
    currentUserRole === "MANAGER";

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.leaveType !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.referenceId.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.employeeName.toLowerCase().includes(q) ||
        t.employeeCode.toLowerCase().includes(q) ||
        t.remarks.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      "Reference ID",
      "Employee Code",
      "Employee Name",
      "Department",
      "Leave Type",
      "Start Date",
      "End Date",
      "Total Days",
      "Status",
      "Reason",
      "Reviewer Remarks",
      "Submitted At",
    ];

    const rows = filteredRequests.map((r) => [
      r.referenceId,
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.departmentName}"`,
      r.leaveType,
      r.startDate,
      r.endDate,
      r.totalDays,
      r.status,
      `"${r.reason.replace(/"/g, '""')}"`,
      `"${(r.rejectionReason || r.approvedBy || "").replace(/"/g, '""')}"`,
      r.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vsecure-leave-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Tab Navigation & Toolbar */}
      <div className="px-5 pt-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => onTabChange("my")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === "my"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              My Leave Requests
            </button>

            {isManagerOrAdmin && (
              <button
                onClick={() => onTabChange("approvals")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === "approvals"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                Approval Queue
                {pendingApprovalsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === "approvals"
                        ? "bg-white text-blue-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {isManagerOrAdmin && (
              <button
                onClick={() => onTabChange("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                All Requests Directory
              </button>
            )}

            {(currentUserRole === "SUPER_ADMIN" || currentUserRole === "HR_ADMIN") && (
              <button
                onClick={() => onTabChange("ledger")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === "ledger"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                Audit Ledger
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {activeTab !== "ledger" && (
          <div className="flex flex-col sm:flex-row items-center gap-2.5 py-2.5 border-t border-slate-100">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search reference, employee, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-600"
              >
                <option value="ALL">All Categories</option>
                <option value="CASUAL">Casual Leave (CL)</option>
                <option value="SICK">Sick Leave (SL)</option>
                <option value="EARNED">Earned Leave (EL)</option>
                <option value="UNPAID_LOP">Loss of Pay (LOP)</option>
                <option value="COMP_OFF">Compensatory Off (COMP)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === "ledger" ? (
          // Ledger View
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4 text-right">Impact (Days)</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Audit Remarks</th>
                <th className="py-3 px-4">Actioned By</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No ledger transactions found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-600">{t.id}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{t.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{t.employeeCode}</div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">{t.leaveType}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {t.transactionType}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono font-bold ${
                        t.days > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.days > 0 ? `+${t.days}` : t.days} d
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {t.balanceAfter} d
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">{t.remarks}</td>
                    <td className="py-2.5 px-4 text-slate-600">{t.actionedBy}</td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{t.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          // Requests View
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Dates Requested</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4">Purpose / Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewer Remark</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="w-5 h-5 text-slate-300" />
                      <span>No leave requests match the current selection.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const typeBadge = getLeaveTypeBadge(r.leaveType);
                  const statusBadge = getLeaveApprovalBadge(r.status);
                  const canReview =
                    isManagerOrAdmin &&
                    r.status === "PENDING" &&
                    r.employeeId !== currentUserId;
                  const canCancel =
                    (r.employeeId === currentUserId || currentUserRole === "SUPER_ADMIN") &&
                    r.status !== "CANCELLED" &&
                    r.status !== "REJECTED";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {r.referenceId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.employeeName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.employeeCode} • {r.departmentName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border ${typeBadge.badgeClass}`}
                        >
                          {typeBadge.code} - {typeBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                        {r.startDate === r.endDate ? (
                          <span>{r.startDate}</span>
                        ) : (
                          <span>
                            {r.startDate} <span className="text-slate-400">➔</span> {r.endDate}
                          </span>
                        )}
                        {r.isHalfDay && (
                          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                            {r.halfDaySession === "FIRST_HALF" ? "Morning Half" : "Afternoon Half"}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {r.totalDays} d
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={r.reason}>
                        {r.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-[11px] border ${statusBadge.badgeClass}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                        {r.rejectionReason || r.approvedBy || "--"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canReview && (
                            <button
                              onClick={() => onReviewRequest(r)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs"
                            >
                              Review
                            </button>
                          )}
                          {!canReview && (
                            <button
                              onClick={() => onReviewRequest(r)}
                              className="p-1 text-slate-500 hover:text-slate-700 rounded hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => onCancelRequest(r)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Cancel Request"
                            >
                              <Slash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
