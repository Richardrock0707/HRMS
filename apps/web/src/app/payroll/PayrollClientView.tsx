"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Receipt,
  FileSpreadsheet,
  RefreshCw,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  User,
} from "lucide-react";
import {
  PayrollDashboardStats,
  PayrollCycleItem,
  PayrollRecordItem,
  BankTransferExportItem,
  LopCalculationBasis,
  PayrollStatus,
  DEMO_CREDENTIALS,
  formatTime12HourIST,
  formatDateDDMMYYYY,
  formatINR,
} from "@vsecure/shared";
import { PayrollSummaryCards } from "@/components/payroll/PayrollSummaryCards";
import { PayrollControlsBar } from "@/components/payroll/PayrollControlsBar";
import { PayrollRegisterTable } from "@/components/payroll/PayrollRegisterTable";
import { PayslipModal } from "@/components/payroll/PayslipModal";
import { SalaryPaymentModal } from "@/components/payroll/SalaryPaymentModal";
import { BankTransferModal } from "@/components/payroll/BankTransferModal";
import { ReopenModal } from "@/components/payroll/ReopenModal";
import {
  getPayrollDashboardStatsAction,
  getPayrollCycleAction,
  getPayrollRecordsAction,
  calculateMonthlyPayrollAction,
  submitPayrollForApprovalAction,
  approvePayrollCycleAction,
  finalizePayrollCycleAction,
  reopenPayrollCycleAction,
  recordSalaryPaymentAction,
  getBankTransferExportAction,
} from "@/actions/payrollActions";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";

interface PayrollClientViewProps {
  initialStats: PayrollDashboardStats;
  initialCycle: PayrollCycleItem | null;
  initialRecords: PayrollRecordItem[];
  userRole: string;
  userId: string;
  userCode: string;
  userName: string;
}

export function PayrollClientView({
  initialStats,
  initialCycle,
  initialRecords,
  userRole: initialRole,
  userId: initialId,
  userCode: initialCode,
  userName: initialName,
}: PayrollClientViewProps): React.ReactElement {
  const [stats, setStats] = useState(initialStats);
  const [cycle, setCycle] = useState(initialCycle);
  const [records, setRecords] = useState(initialRecords);

  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [lopBasis, setLopBasis] = useState<LopCalculationBasis>(
    (initialCycle?.lopCalculationBasis as LopCalculationBasis) || "CALENDAR_DAYS"
  );

  // Active User Persona
  const [activeUser, setActiveUser] = useState({
    id: initialId,
    code: initialCode,
    name: initialName,
    role: initialRole,
  });

  // Modals
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecordItem | null>(null);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<PayrollRecordItem | null>(null);
  const [isBankExportOpen, setIsBankExportOpen] = useState(false);
  const [bankExportItems, setBankExportItems] = useState<BankTransferExportItem[]>([]);
  const [isReopenOpen, setIsReopenOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Live IST Clock
  const [liveTime, setLiveTime] = useState(formatTime12HourIST(new Date()));
  const [liveDate, setLiveDate] = useState(formatDateDDMMYYYY(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(formatTime12HourIST(now));
      setLiveDate(formatDateDDMMYYYY(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshPayrollData = async (month = selectedMonth, year = selectedYear) => {
    setIsProcessing(true);
    try {
      const [newStats, newCycle, recordsRes] = await Promise.all([
        getPayrollDashboardStatsAction(month, year),
        getPayrollCycleAction(month, year),
        getPayrollRecordsAction(month, year),
      ]);
      setStats(newStats);
      setCycle(newCycle);
      if (recordsRes.success) {
        setRecords(recordsRes.data);
      }
    } catch (err) {
      console.error("Failed to refresh payroll:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMonthYearChange = async (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    await refreshPayrollData(month, year);
  };

  const handlePersonaChange = async (cred: (typeof DEMO_CREDENTIALS)[number]) => {
    const staff = INITIAL_STAFF_DIRECTORY.find((s) => s.employeeCode === cred.code);
    const newPersona = {
      id: staff?.id || "emp_vsecure_001",
      code: cred.code,
      name: cred.name,
      role: cred.role,
    };
    setActiveUser(newPersona);
    setNotification({
      type: "info",
      message: `Switched view to ${cred.name} (${cred.title}). Permissions adjusted to ${cred.role}.`,
    });
    await refreshPayrollData(selectedMonth, selectedYear);
  };

  const handleCalculate = async () => {
    setIsProcessing(true);
    setNotification(null);
    try {
      const res = await calculateMonthlyPayrollAction(selectedMonth, selectedYear, lopBasis);
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to calculate payroll" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!cycle) return;
    setIsProcessing(true);
    try {
      const res = await submitPayrollForApprovalAction(cycle.id);
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!cycle) return;
    setIsProcessing(true);
    try {
      const res = await approvePayrollCycleAction(cycle.id, "APPROVE");
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!cycle) return;
    setIsProcessing(true);
    try {
      const res = await approvePayrollCycleAction(cycle.id, "REJECT", "Salary calculation discrepancy requiring HR review");
      if (res.success) {
        setNotification({ type: "info", message: res.message });
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = async () => {
    if (!cycle) return;
    setIsProcessing(true);
    try {
      const res = await finalizePayrollCycleAction(cycle.id);
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopenSubmit = async (reason: string) => {
    if (!cycle) return;
    setIsProcessing(true);
    try {
      const res = await reopenPayrollCycleAction(cycle.id, reason);
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        setIsReopenOpen(false);
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordPaymentSubmit = async (
    recordId: string,
    paymentData: {
      paymentMethod: string;
      paymentReference: string;
      paidAmountINR: number;
      paymentRemarks?: string;
    }
  ) => {
    setIsProcessing(true);
    try {
      const res = await recordSalaryPaymentAction(recordId, paymentData);
      if (res.success) {
        setNotification({ type: "success", message: res.message });
        setSelectedPaymentRecord(null);
        await refreshPayrollData();
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenBankExport = async () => {
    setIsProcessing(true);
    try {
      const res = await getBankTransferExportAction(selectedMonth, selectedYear);
      if (res.success) {
        setBankExportItems(res.data);
        setIsBankExportOpen(true);
      } else {
        setNotification({ type: "error", message: res.error || "Failed to generate bank export" });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Regional Context & Persona Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
              Phase 5
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Automated Payroll & Salary Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic Indian payroll engine • Loss of Pay (LOP) proration • PF/ESI/PT statutory compliance • Secure PDF payslips
          </p>
        </div>

        {/* Live IST Clock & Persona Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {liveDate}, {liveTime} IST
            </span>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {DEMO_CREDENTIALS.map((cred) => {
              const isActive = activeUser.code === cred.code;
              return (
                <button
                  key={cred.code}
                  onClick={() => handlePersonaChange(cred)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={`${cred.title} (${cred.badge})`}
                >
                  {cred.name.split(" ")[0]} ({cred.role === "SUPER_ADMIN" ? "Super Admin" : cred.role === "HR_ADMIN" ? "HR Admin" : cred.role === "MANAGER" ? "Mgr" : "Emp"})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : notification.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <PayrollSummaryCards stats={stats} />

      {/* Controls & Workflow Trigger Bar */}
      <PayrollControlsBar
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthYearChange={handleMonthYearChange}
        lopBasis={lopBasis}
        onLopBasisChange={(b) => setLopBasis(b)}
        cycleStatus={stats.currentCycleStatus}
        userRole={activeUser.role}
        onCalculate={handleCalculate}
        onSubmitForApproval={handleSubmitForApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onFinalize={handleFinalize}
        onReopen={() => setIsReopenOpen(true)}
        onOpenBankExport={handleOpenBankExport}
        isProcessing={isProcessing}
      />

      {/* Salary Register & Deductions Table */}
      <PayrollRegisterTable
        records={records}
        userRole={activeUser.role}
        onViewPayslip={(rec) => setSelectedPayslipRecord(rec)}
        onRecordPayment={(rec) => setSelectedPaymentRecord(rec)}
        isProcessing={isProcessing}
      />

      {/* Modals */}
      <PayslipModal
        record={selectedPayslipRecord}
        onClose={() => setSelectedPayslipRecord(null)}
      />

      <SalaryPaymentModal
        record={selectedPaymentRecord}
        onClose={() => setSelectedPaymentRecord(null)}
        onSubmit={handleRecordPaymentSubmit}
        isProcessing={isProcessing}
      />

      <BankTransferModal
        isOpen={isBankExportOpen}
        onClose={() => setIsBankExportOpen(false)}
        items={bankExportItems}
        month={selectedMonth}
        year={selectedYear}
      />

      <ReopenModal
        isOpen={isReopenOpen}
        onClose={() => setIsReopenOpen(false)}
        onSubmit={handleReopenSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
}
