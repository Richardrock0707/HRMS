"use client";

import React, { useState } from "react";
import { X, Unlock, AlertTriangle } from "lucide-react";

interface ReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isProcessing: boolean;
}

export function ReopenModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
}: ReopenModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 8) {
      setError("Please provide a specific justification (at least 8 characters).");
      return;
    }
    setError(null);
    await onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center space-x-2">
            <Unlock className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Reopen Finalized Payroll Cycle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Reopening unlocks immutable payroll records for authorized adjustments. This action and the reason will be permanently recorded in the financial audit log.
            </p>
          </div>

          {error && <div className="text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Audit Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Approved retroactive attendance correction for Arjun Mehta or revised tax deduction slab."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
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
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Reopening..." : "Authorize Reopening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
