"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  PayrollRecordItem,
  formatINR,
  formatINRInWords,
  getMonthName,
  maskBankAccountNumber,
} from "@vsecure/shared";

interface PayslipModalProps {
  record: PayrollRecordItem | null;
  onClose: () => void;
}

export function PayslipModal({ record, onClose }: PayslipModalProps): React.ReactElement | null {
  if (!record) return null;

  const monthName = getMonthName(record.month);
  const netInWords = formatINRInWords(record.netPayableINR);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-6 animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Top Action Bar (Hidden during print) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Official Employee Payslip Preview
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payslip Document Body (Standard Indian Letterhead Format) */}
        <div id="payslip-document" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
          {/* Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm tracking-tighter">
                  VS
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  VSecure Technologies Pvt Ltd
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Tech Park Campus, Outer Ring Road, Bengaluru, Karnataka 560103
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                CIN: U72200KA2024PTC184920 • PAN: AABCV1234F • GSTIN: 29AABCV1234F1Z5
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-900 font-extrabold text-xs tracking-wider uppercase border border-slate-300">
                Payslip: {monthName} {record.year}
              </span>
              <p className="text-[11px] font-mono text-slate-500 mt-1.5">
                Ref: {record.payslipNumber || `VS-PAY-${record.year}${record.month}-${record.employeeCode}`}
              </p>
              <p className="text-[11px] text-slate-400">
                Generated: {record.createdAt}
              </p>
            </div>
          </div>

          {/* Employee & Bank Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Employee Name</div>
              <div className="font-bold text-slate-900 mt-0.5">{record.employeeName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Employee ID</div>
              <div className="font-mono font-bold text-blue-700 mt-0.5">{record.employeeCode}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Designation</div>
              <div className="font-medium text-slate-800 mt-0.5">{record.designation}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Department</div>
              <div className="font-medium text-slate-800 mt-0.5">{record.departmentName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Date of Joining</div>
              <div className="font-medium text-slate-800 mt-0.5">{record.joiningDate}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Bank Name</div>
              <div className="font-medium text-slate-800 mt-0.5">{record.bankName || "HDFC Bank"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Account Number</div>
              <div className="font-mono font-medium text-slate-800 mt-0.5">
                {maskBankAccountNumber(record.bankAccountNumber)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</div>
              <div className="font-mono font-medium text-slate-800 mt-0.5">{record.bankIFSC || "HDFC0001234"}</div>
            </div>
          </div>

          {/* Attendance & Leave Working Days Summary */}
          <div className="flex flex-wrap items-center justify-between bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-slate-700 mb-5">
            <span>
              Total Month Days: <strong>{record.calendarDays}</strong>
            </span>
            <span>
              Working Days: <strong>{record.workingDays}</strong>
            </span>
            <span>
              Present Days: <strong>{record.presentDays}</strong>
            </span>
            <span>
              Paid Leaves: <strong>{record.paidLeaveDays}</strong>
            </span>
            <span>
              Loss of Pay (LOP):{" "}
              <strong className={record.lopDays > 0 ? "text-rose-600" : "text-slate-800"}>
                {record.lopDays}
              </strong>
            </span>
          </div>

          {/* Dual Column: Earnings vs Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-xl overflow-hidden mb-5">
            {/* Left: Earnings */}
            <div className="border-b sm:border-b-0 sm:border-r border-slate-200">
              <div className="bg-slate-100 px-4 py-2 font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-200 flex justify-between">
                <span>Earnings Breakdown</span>
                <span>Amount (INR)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold text-slate-900">{formatINR(record.basicSalaryINR, false)}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">{formatINR(record.hraINR, false)}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Conveyance Allowance</span>
                  <span className="font-semibold text-slate-900">{formatINR(record.conveyanceINR, false)}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Special Allowance</span>
                  <span className="font-semibold text-slate-900">{formatINR(record.specialAllowanceINR, false)}</span>
                </div>
                {record.overtimePayINR > 0 && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Overtime Pay ({record.overtimeHours} hrs)</span>
                    <span className="font-semibold text-slate-900">{formatINR(record.overtimePayINR, false)}</span>
                  </div>
                )}
                {record.incentivesINR > 0 && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Performance Incentives</span>
                    <span className="font-semibold text-slate-900">{formatINR(record.incentivesINR, false)}</span>
                  </div>
                )}
                {record.bonusINR > 0 && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Bonus</span>
                    <span className="font-semibold text-slate-900">{formatINR(record.bonusINR, false)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-emerald-50/40 font-bold border-t border-slate-200 text-slate-900">
                  <span>Total Gross Earnings (A)</span>
                  <span className="text-emerald-700">{formatINR(record.grossEarningsINR, false)}</span>
                </div>
              </div>
            </div>

            {/* Right: Deductions */}
            <div>
              <div className="bg-slate-100 px-4 py-2 font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-200 flex justify-between">
                <span>Deductions Breakdown</span>
                <span>Amount (INR)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Provident Fund (Employee 12%)</span>
                  <span className="font-semibold text-slate-900">
                    {record.pfEmployeeINR > 0 ? formatINR(record.pfEmployeeINR, false) : "—"}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">ESI (Employee 0.75%)</span>
                  <span className="font-semibold text-slate-900">
                    {record.esiEmployeeINR > 0 ? formatINR(record.esiEmployeeINR, false) : "—"}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-semibold text-slate-900">
                    {record.profTaxINR > 0 ? formatINR(record.profTaxINR, false) : "—"}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">
                    Loss of Pay (LOP: {record.lopDays} {record.lopDays === 1 ? "day" : "days"})
                  </span>
                  <span className={record.lopDeductionINR > 0 ? "font-bold text-rose-600" : "font-semibold text-slate-900"}>
                    {record.lopDeductionINR > 0 ? formatINR(record.lopDeductionINR, false) : "—"}
                  </span>
                </div>
                {record.otherDeductionsINR > 0 && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Other Authorized Deductions</span>
                    <span className="font-semibold text-slate-900">{formatINR(record.otherDeductionsINR, false)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-amber-50/40 font-bold border-t border-slate-200 text-slate-900">
                  <span>Total Deductions (B)</span>
                  <span className="text-amber-800">{formatINR(record.totalDeductions, false)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Payable Highlight Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Net Salary Payable (A - B)
              </div>
              <div className="text-xs text-slate-600 font-medium italic mt-0.5">
                Amount in Words: <strong className="text-slate-900 not-italic">{netInWords}</strong>
              </div>
            </div>
            <div className="text-2xl font-black text-blue-700 tracking-tight shrink-0">
              {formatINR(record.netPayableINR, true)}
            </div>
          </div>

          {/* Employer Statutory Cost Contribution (CTC Transparency) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 mb-6">
            <span className="font-semibold text-slate-700">Employer Statutory Contributions (CTC):</span>
            <span>EPF Employer: <strong>{formatINR(record.pfEmployerINR, false)}</strong></span>
            <span>ESI Employer: <strong>{formatINR(record.esiEmployerINR, false)}</strong></span>
            <span>Total Employer Cost: <strong className="text-slate-900">{formatINR(record.totalEmployerCostINR, false)}</strong></span>
          </div>

          {/* Signatures & System Verification Seal */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs text-slate-500">
            <div>
              <div className="flex items-center space-x-1 text-slate-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Authorized by VSecure Technologies</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prepared by: {record.processedBy || "Priya Sharma (HR Admin)"}
                <br />
                Approved by: {record.approvedBy || "Vishnu (Super Admin)"}
              </p>
            </div>

            <div className="text-right">
              <div className="font-mono text-[10px] text-slate-400 uppercase">
                DIGITALLY VERIFIED DOCUMENT
              </div>
              <div className="text-[11px] font-bold text-slate-800">
                VSecure HRMS • Core Payroll Module
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
