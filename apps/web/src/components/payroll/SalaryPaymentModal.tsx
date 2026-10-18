"use client";

import React, { useState } from "react";
import { X, CreditCard, CheckCircle2, Building, AlertCircle } from "lucide-react";
import { PayrollRecordItem, formatINR } from "@vsecure/shared";

interface SalaryPaymentModalProps {
  record: PayrollRecordItem | null;
  onClose: () => void;
  onSubmit: (recordId: string, paymentData: {
    paymentMethod: string;
    paymentReference: string;
    paidAmountINR: number;
    paymentRemarks?: string;
  }) => Promise<void>;
  isProcessing: boolean;
}

export function SalaryPaymentModal({
  record,
  onClose,
  onSubmit,
  isProcessing,
}: SalaryPaymentModalProps): React.ReactElement | null {
  if (!record) return null;

  const [paymentMethod, setPaymentMethod] = useState("NEFT");
  const [paymentReference, setPaymentReference] = useState("");
  const [paidAmountINR, setPaidAmountINR] = useState(record.netPayableINR);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReference.trim()) {
      setError("Payment Reference / Bank UTR is required.");
      return;
    }
    setError(null);
    await onSubmit(record.id, {
      paymentMethod,
      paymentReference: paymentReference.trim(),
      paidAmountINR,
      paymentRemarks: remarks.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Record Salary Disbursement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Overview Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">{record.employeeName}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {record.employeeCode} • {record.designation}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Net Payable</div>
              <div className="font-extrabold text-blue-700 text-sm">
                {formatINR(record.netPayableINR, false)}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
              <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
              <option value="IMPS">IMPS (Immediate Payment Service)</option>
              <option value="ACH">ACH Direct Deposit</option>
              <option value="CHEQUE">Corporate Cheque</option>
            </select>
          </div>

          {/* UTR / Transaction Reference */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Bank Reference / UTR Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CMS984712039 or UTR2026101899"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono outline-none focus:border-blue-500"
            />
          </div>

          {/* Disbursed Amount */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Disbursed Amount (INR ₹)
            </label>
            <input
              type="number"
              step="1"
              value={paidAmountINR}
              onChange={(e) => setPaidAmountINR(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold outline-none focus:border-blue-500"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Authorized Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. October 2026 monthly payroll disbursed via HDFC Corporate Netbanking"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Recording..." : "Confirm Disbursement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
