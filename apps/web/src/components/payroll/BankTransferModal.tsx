"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  BankTransferExportItem,
  formatINR,
  maskBankAccountNumber,
} from "@vsecure/shared";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BankTransferExportItem[];
  month: number;
  year: number;
}

export function BankTransferModal({
  isOpen,
  onClose,
  items,
  month,
  year,
}: BankTransferModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, i) => sum + i.amountINR, 0);
  const missingAccounts = items.filter(
    (i) => !i.beneficiaryAccount || i.beneficiaryAccount.includes("MISSING")
  );

  const handleDownloadCsv = () => {
    const headers = [
      "Beneficiary Name",
      "Account Number",
      "IFSC Code",
      "Amount (INR)",
      "Narration",
      "Employee Code",
      "Department",
      "Reference",
    ];

    const rows = items.map((i) => [
      `"${i.beneficiaryName}"`,
      `"${i.beneficiaryAccount}"`,
      `"${i.ifscCode}"`,
      i.amountINR.toFixed(2),
      `"${i.paymentNarration}"`,
      `"${i.employeeCode}"`,
      `"${i.department}"`,
      `"${i.paymentReference}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VSecure_Bank_Salary_Transfer_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Corporate Bank Transfer Export
              </h3>
              <p className="text-[11px] text-slate-500">
                Period: {month}-{year} • Compatible with HDFC, ICICI, SBI Netbanking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase font-bold text-blue-900">
                Batch Transfer Total
              </div>
              <div className="text-xl font-black text-blue-700">
                {formatINR(totalAmount, true)}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                {items.length} Beneficiaries
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">Ready for upload</p>
            </div>
          </div>

          {missingAccounts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Warning: {missingAccounts.length} staff member(s) have incomplete bank account details.
              </span>
            </div>
          )}

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Beneficiary</th>
                  <th className="py-2 px-3">Account Number</th>
                  <th className="py-2 px-3">IFSC</th>
                  <th className="py-2 px-3 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {i.beneficiaryName}{" "}
                      <span className="text-[10px] text-slate-400 font-mono">({i.employeeCode})</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {maskBankAccountNumber(i.beneficiaryAccount)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">{i.ifscCode}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatINR(i.amountINR, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            * Bank account numbers are masked for security on screen and will be exported in full to the encrypted Netbanking CSV.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Netbanking CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
