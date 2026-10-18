"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Smartphone,
  ShieldCheck,
  Building,
  MoreVertical,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { OnboardingWizardModal } from "@/components/employees/OnboardingWizardModal";
import { DeviceRequestsDrawer } from "@/components/employees/DeviceRequestsDrawer";
import { DepartmentManagerDrawer } from "@/components/employees/DepartmentManagerDrawer";
import {
  INITIAL_STAFF_DIRECTORY,
  EmployeeDirectoryItem,
} from "@/lib/directoryData";
import {
  getEmployeesAction,
  resetDeviceBindingAction,
  updateEmployeeStatusAction,
} from "@/actions/employeeActions";
import {
  formatINR,
  getRoleBadge,
  getEmploymentStatusBadge,
  Role,
  EmploymentStatus,
} from "@vsecure/shared";

export default function EmployeesPage(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal & Drawers
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDeviceDrawerOpen, setIsDeviceDrawerOpen] = useState(false);
  const [isDeptDrawerOpen, setIsDeptDrawerOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeDirectoryItem[]>(INITIAL_STAFF_DIRECTORY);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      emp.fullName.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.phone.includes(q);

    const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;
    const matchesRole = selectedRole === "ALL" || emp.role === selectedRole;
    const matchesStatus = selectedStatus === "ALL" || emp.status === selectedStatus;

    return matchesQuery && matchesDept && matchesRole && matchesStatus;
  });

  const handleResetDevice = async (id: string, code: string) => {
    if (confirm(`Unlink hardware Android device binding for ${code}? The employee can bind their new device on next login.`)) {
      startTransition(async () => {
        await resetDeviceBindingAction(id);
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === id || e.employeeCode === code
              ? { ...e, boundDeviceId: null, deviceModel: null, deviceBoundAt: null }
              : e
          )
        );
        setActionFeedback(`Hardware device unlinked for ${code}.`);
        setTimeout(() => setActionFeedback(null), 3500);
      });
    }
  };

  const handleStatusChange = async (id: string, status: EmploymentStatus) => {
    startTransition(async () => {
      await updateEmployeeStatusAction(id, status);
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
      setActionFeedback(`Status updated to ${status}.`);
      setTimeout(() => setActionFeedback(null), 3500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentPath="#employees"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionFeedback}</span>
            </div>
          )}

          {/* Page Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Workforce Core
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  25 Capacity • 4-Tier RBAC Scoped
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Employee Management & Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage staff onboarding, 4-tier roles, INR salary structures, and Android hardware bindings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsDeptDrawerOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Departments</span>
              </button>

              <button
                onClick={() => setIsDeviceDrawerOpen(true)}
                className="px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Device Approvals</span>
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
              </button>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Employee</span>
              </button>
            </div>
          </div>

          {/* Search, Filter Pills & View Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, VS-001, Phone, or Email..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  aria-label="Table View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Filter By:
              </span>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden text-xs"
              >
                <option value="ALL">All Departments</option>
                <option value="dept_eng">Engineering & Architecture</option>
                <option value="dept_hr">People & HR</option>
                <option value="dept_ops">Cloud & Operations</option>
                <option value="dept_sales">Enterprise Sales</option>
              </select>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden text-xs"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin (Vishnu)</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="MANAGER">Dept Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_NOTICE">On Notice</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>

              {(selectedDept !== "ALL" || selectedRole !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDept("ALL");
                    setSelectedRole("ALL");
                    setSelectedStatus("ALL");
                    setSearchQuery("");
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* DENSE TABLE VIEW */}
          {viewMode === "table" ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Role & Scope</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Joining Date (IST)</th>
                      <th className="py-3 px-4">Monthly CTC (INR)</th>
                      <th className="py-3 px-4">Bound Android Device</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No employees found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const roleMeta = getRoleBadge(emp.role);
                        const statusMeta = getEmploymentStatusBadge(emp.status);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Employee Name & Code */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                  {emp.fullName.charAt(0)}
                                </div>
                                <div>
                                  <Link
                                    href={`/employees/${emp.id}`}
                                    className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                  >
                                    <span>{emp.fullName}</span>
                                    {emp.employeeCode === "VS-001" && (
                                      <span className="text-[9px] font-bold px-1 rounded bg-blue-100 text-blue-800">
                                        Super Admin
                                      </span>
                                    )}
                                  </Link>
                                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
                                    <span>{emp.employeeCode}</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[140px]">{emp.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleMeta.badgeClass}`}
                              >
                                {roleMeta.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {roleMeta.desc}
                              </span>
                            </td>

                            {/* Department & Designation */}
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block truncate max-w-[150px]">
                                {emp.designation}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                                {emp.departmentName}
                              </span>
                            </td>

                            {/* Joining Date */}
                            <td className="py-3.5 px-4 font-mono text-slate-800">
                              {emp.joiningDate}
                            </td>

                            {/* Compensation (INR) */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              {emp.grossSalaryINR ? formatINR(emp.grossSalaryINR) : "Confidential"}
                            </td>

                            {/* Bound Android Device */}
                            <td className="py-3.5 px-4">
                              {emp.boundDeviceId ? (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <div>
                                    <span className="font-semibold text-xs block truncate max-w-[130px]">
                                      {emp.deviceModel || "Android Device"}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-mono block">
                                      Bound {emp.deviceBoundAt}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400 italic">
                                  Unbound (Binds on Login)
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>

                            {/* Actions Menu */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/employees/${emp.id}`}
                                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
                                  title="360° Profile"
                                >
                                  360° View
                                </Link>

                                {emp.boundDeviceId && (
                                  <button
                                    onClick={() => handleResetDevice(emp.id, emp.employeeCode)}
                                    className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Unlink Android Device"
                                  >
                                    <Smartphone className="w-3.5 h-3.5" />
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
            </div>
          ) : (
            /* EMPLOYEE CARD GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                const roleMeta = getRoleBadge(emp.role);
                const statusMeta = getEmploymentStatusBadge(emp.status);

                return (
                  <div
                    key={emp.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/employees/${emp.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                            >
                              {emp.fullName}
                            </Link>
                            <span className="text-[11px] font-mono text-slate-500">
                              {emp.employeeCode}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Designation</span>
                          <span className="font-semibold text-slate-900">{emp.designation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Department</span>
                          <span className="text-slate-700">{emp.departmentName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">System Role</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleMeta.badgeClass}`}
                          >
                            {roleMeta.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Monthly CTC (INR)</span>
                          <span className="font-mono font-bold text-slate-900">
                            {emp.grossSalaryINR ? formatINR(emp.grossSalaryINR) : "Confidential"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Android Device</span>
                          <span className="text-[11px] font-mono text-slate-700 truncate max-w-[130px]">
                            {emp.deviceModel || "Unbound"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Joined {emp.joiningDate}
                      </span>
                      <Link
                        href={`/employees/${emp.id}`}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>360° Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        nextCode={`VS-${String(employees.length + 1).padStart(3, "0")}`}
        onSuccess={() => {
          setActionFeedback("New employee onboarded successfully! Directory updated.");
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />

      {/* Device Change Requests Drawer */}
      <DeviceRequestsDrawer
        isOpen={isDeviceDrawerOpen}
        onClose={() => setIsDeviceDrawerOpen(false)}
      />

      {/* Department Manager Drawer */}
      <DepartmentManagerDrawer
        isOpen={isDeptDrawerOpen}
        onClose={() => setIsDeptDrawerOpen(false)}
      />
    </div>
  );
}
