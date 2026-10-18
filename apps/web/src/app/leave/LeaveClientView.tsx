"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Sliders,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  LeaveRecordItem,
  LeaveBalanceItem,
  LeaveTransactionItem,
  LeaveDashboardStats,
  formatDateDDMMYYYY,
  formatTime12HourIST,
  DEMO_CREDENTIALS,
} from "@vsecure/shared";
import { LeaveSummaryCards } from "@/components/leave/LeaveSummaryCards";
import { LeaveBalanceCards } from "@/components/leave/LeaveBalanceCards";
import { LeaveRequestsTable } from "@/components/leave/LeaveRequestsTable";
import { LeaveCalendarView } from "@/components/leave/LeaveCalendarView";
import { ApplyLeaveModal } from "@/components/leave/ApplyLeaveModal";
import { LeaveApprovalDrawer } from "@/components/leave/LeaveApprovalDrawer";
import { AdjustBalanceModal } from "@/components/leave/AdjustBalanceModal";
import { CancelLeaveModal } from "@/components/leave/CancelLeaveModal";
import {
  getLeaveDashboardStatsAction,
  getLeaveBalancesAction,
  getLeaveRequestsAction,
  getLeaveTransactionsAction,
} from "@/actions/leaveActions";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";

interface LeaveClientViewProps {
  initialStats: LeaveDashboardStats;
  initialBalances: LeaveBalanceItem[];
  initialRequests: LeaveRecordItem[];
  initialTransactions: LeaveTransactionItem[];
  userRole: string;
  userId: string;
  userCode: string;
  userName: string;
  userDeptId: string;
}

export function LeaveClientView({
  initialStats,
  initialBalances,
  initialRequests,
  initialTransactions,
  userRole: initialRole,
  userId: initialId,
  userCode: initialCode,
  userName: initialName,
  userDeptId: initialDeptId,
}: LeaveClientViewProps): React.ReactElement {
  const [stats, setStats] = useState(initialStats);
  const [balances, setBalances] = useState(initialBalances);
  const [requests, setRequests] = useState(initialRequests);
  const [transactions, setTransactions] = useState(initialTransactions);

  // Active persona
  const [activeUser, setActiveUser] = useState({
    id: initialId,
    code: initialCode,
    name: initialName,
    role: initialRole,
    deptId: initialDeptId,
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<"my" | "approvals" | "all" | "ledger">("my");
  const [viewMode, setViewMode] = useState<"TABLE" | "CALENDAR">("TABLE");

  // Modals & Drawers
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState<LeaveRecordItem | null>(null);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<LeaveRecordItem | null>(null);

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

  const refreshData = async () => {
    try {
      const [newStats, newBals, newReqs, newTxns] = await Promise.all([
        getLeaveDashboardStatsAction(),
        getLeaveBalancesAction(activeUser.id),
        getLeaveRequestsAction({ tab: activeTab }),
        getLeaveTransactionsAction(activeUser.id),
      ]);
      setStats(newStats);
      setBalances(newBals);
      setRequests(newReqs);
      setTransactions(newTxns);
    } catch (err) {
      console.error("Failed to refresh leave data:", err);
    }
  };

  const handlePersonaChange = async (cred: (typeof DEMO_CREDENTIALS)[number]) => {
    const staff = INITIAL_STAFF_DIRECTORY.find((s) => s.employeeCode === cred.code);
    const newPersona = {
      id: staff?.id || `emp_${cred.code}`,
      code: cred.code,
      name: cred.name,
      role: cred.role,
      deptId: staff?.departmentId || "dept_eng",
    };
    setActiveUser(newPersona);

    try {
      const [newBals, newReqs, newTxns] = await Promise.all([
        getLeaveBalancesAction(newPersona.id),
        getLeaveRequestsAction({ tab: activeTab }),
        getLeaveTransactionsAction(newPersona.id),
      ]);
      setBalances(newBals);
      setRequests(newReqs);
      setTransactions(newTxns);
    } catch (err) {
      console.error("Error switching persona:", err);
    }
  };

  const canAdjust = activeUser.role === "SUPER_ADMIN" || activeUser.role === "HR_ADMIN";

  return (
    <div className="space-y-6">
      {/* Top Header & Regional IST Clock Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Leave Management & Approval Workflows
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Phase 4 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Leave duration engine, weekend & holiday exclusions, multi-tier approvals, and Loss of Pay (LOP)
          </p>
        </div>

        {/* Live IST Clock Card */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{liveTime} IST</span>
              <span className="text-[10px] text-blue-700 bg-blue-100 font-semibold px-1 rounded">
                Asia/Kolkata
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{liveDate}</div>
          </div>
          <button
            onClick={refreshData}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Interactive Persona Switcher */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Interactive RBAC Persona Switcher:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {DEMO_CREDENTIALS.map((cred) => {
            const isSelected = activeUser.code === cred.code;
            return (
              <button
                key={cred.code}
                onClick={() => handlePersonaChange(cred)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <span>{cred.name}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {cred.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <LeaveSummaryCards stats={stats} />

      {/* Leave Balance Quota Cards */}
      <LeaveBalanceCards
        balances={balances}
        employeeName={activeUser.name}
        employeeCode={activeUser.code}
        canAdjust={canAdjust}
        onApplyLeaveClick={() => setIsApplyOpen(true)}
        onAdjustBalanceClick={() => setIsAdjustOpen(true)}
      />

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("TABLE")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === "TABLE"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Leave Requests Directory
          </button>
          <button
            onClick={() => setViewMode("CALENDAR")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === "CALENDAR"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Interactive Leave Calendar
          </button>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Apply for Leave
        </button>
      </div>

      {/* Dynamic View Display */}
      {viewMode === "TABLE" ? (
        <LeaveRequestsTable
          requests={requests}
          transactions={transactions}
          currentUserId={activeUser.id}
          currentUserRole={activeUser.role}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            getLeaveRequestsAction({ tab }).then(setRequests);
          }}
          pendingApprovalsCount={stats.pendingApprovals}
          onReviewRequest={(req) => setSelectedReviewRequest(req)}
          onCancelRequest={(req) => setSelectedCancelRequest(req)}
        />
      ) : (
        <LeaveCalendarView requests={requests} />
      )}

      {/* Modals & Drawers */}
      <ApplyLeaveModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        balances={balances}
        employeeName={activeUser.name}
        employeeCode={activeUser.code}
        departmentName="Engineering & Architecture"
        designation="Specialist"
        reportingManagerName="Super Admin Vishnu"
        existingLeaves={requests}
        onSuccess={refreshData}
      />

      <LeaveApprovalDrawer
        isOpen={!!selectedReviewRequest}
        request={selectedReviewRequest}
        onClose={() => setSelectedReviewRequest(null)}
        currentUserId={activeUser.id}
        currentUserRole={activeUser.role}
        currentUserName={activeUser.name}
        onDecisionComplete={refreshData}
      />

      <AdjustBalanceModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        onSuccess={refreshData}
      />

      <CancelLeaveModal
        isOpen={!!selectedCancelRequest}
        request={selectedCancelRequest}
        onClose={() => setSelectedCancelRequest(null)}
        onSuccess={refreshData}
      />
    </div>
  );
}
