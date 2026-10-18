"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  PayrollRecordItem,
  formatINR,
  getPayrollStatusConfig,
  getPaymentStatusConfig,
  maskBankAccountNumber,
} from "@vsecure/shared";

interface PayrollRegisterTableProps {
  records: PayrollRecordItem[];
  userRole: string;
  onViewPayslip: (record: PayrollRecordItem) => void;
  onRecordPayment: (record: PayrollRecordItem) => void;
  isProcessing: boolean;
}

export function PayrollRegisterTable({
  records,
  userRole,
  onViewPayslip,
  onRecordPayment,
  isProcessing,
}: PayrollRegisterTableProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const canManagePayments = userRole === "SUPER_ADMIN" || userRole === "HR_ADMIN";

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === "ALL" || r.departmentName === deptFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(records.map((r) => r.departmentName)));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Salary Register & Deductions
          </h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-700 rounded-full">
            {filteredRecords.length} Employees
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 w-44 md:w-56"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="FINALIZED">Finalized</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5">Employee</th>
              <th className="py-3 px-3 text-center">Days (Pres / LOP)</th>
              <th className="py-3 px-3 text-right">Gross Earnings</th>
              <th className="py-3 px-3 text-right">PF (12%)</th>
              <th className="py-3 px-3 text-right">ESI (0.75%)</th>
              <th className="py-3 px-3 text-right">Prof Tax</th>
              <th className="py-3 px-3 text-right">LOP Deduction</th>
              <th className="py-3 px-3 text-right font-bold">Total Deduct</th>
              <th className="py-3 px-3.5 text-right font-bold text-blue-700">Net Payable</th>
              <th className="py-3 px-3 text-center">Payment Status</th>
              <th className="py-3 px-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No payroll records found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try adjusting search query or click "Calculate Payroll" to generate records.
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const payCfg = getPaymentStatusConfig(r.paymentStatus);
                const hasLop = r.lopDays > 0;

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Employee Profile */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                          {r.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                            <span>{r.employeeName}</span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                              {r.employeeCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {r.designation} • <span className="text-slate-400">{r.departmentName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attendance Days */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="font-medium text-slate-700">
                        {r.presentDays} / {r.workingDays}
                      </div>
                      {hasLop ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          {r.lopDays} LOP
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600">0 LOP</span>
                      )}
                    </td>

                    {/* Gross Earnings */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatINR(r.grossEarningsINR, false)}
                    </td>

                    {/* Statutory PF */}
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                      {r.pfEmployeeINR > 0 ? formatINR(r.pfEmployeeINR, false) : "—"}
                    </td>

                    {/* Statutory ESI */}
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                      {r.esiEmployeeINR > 0 ? formatINR(r.esiEmployeeINR, false) : "—"}
                    </td>

                    {/* Professional Tax */}
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                      {r.profTaxINR > 0 ? formatINR(r.profTaxINR, false) : "—"}
                    </td>

                    {/* LOP Deduction */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {r.lopDeductionINR > 0 ? (
                        <span className="font-semibold text-rose-600">
                          -{formatINR(r.lopDeductionINR, false)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    {/* Total Deductions */}
                    <td className="py-3 px-3 text-right font-bold text-amber-700 whitespace-nowrap">
                      {formatINR(r.totalDeductions, false)}
                    </td>

                    {/* Net Salary Payable */}
                    <td className="py-3 px-3.5 text-right font-extrabold text-blue-700 bg-blue-50/20 whitespace-nowrap text-sm">
                      {formatINR(r.netPayableINR, false)}
                    </td>

                    {/* Payment Status & Bank Details */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            backgroundColor: payCfg.bg,
                            color: payCfg.text,
                            borderColor: payCfg.border,
                          }}
                        >
                          {payCfg.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px] mx-auto" title={r.bankName || ""}>
                        {maskBankAccountNumber(r.bankAccountNumber)}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* View Payslip */}
                        <button
                          onClick={() => onViewPayslip(r)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 rounded-md shadow-2xs transition-all cursor-pointer"
                          title="Generate and view printable payslip"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Payslip</span>
                        </button>

                        {/* Record Payment (HR/Admin) */}
                        {canManagePayments && !r.isPaid && (
                          <button
                            onClick={() => onRecordPayment(r)}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md shadow-2xs transition-all cursor-pointer"
                            title="Record bank UTR / payment confirmation"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay</span>
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
      </div>

      {/* Table Footer with Summary Breakdown */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          Showing {filteredRecords.length} of {records.length} total staff payroll entries
        </div>
        <div className="flex items-center space-x-4 font-medium">
          <span>
            Total Gross: <strong className="text-slate-800">{formatINR(filteredRecords.reduce((s, r) => s + r.grossEarningsINR, 0))}</strong>
          </span>
          <span>
            Total Deductions: <strong className="text-amber-700">{formatINR(filteredRecords.reduce((s, r) => s + r.totalDeductions, 0))}</strong>
          </span>
          <span>
            Total Net Payable: <strong className="text-blue-700 font-bold">{formatINR(filteredRecords.reduce((s, r) => s + r.netPayableINR, 0))}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
