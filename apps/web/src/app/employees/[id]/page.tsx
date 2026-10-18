"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Briefcase,
  IndianRupee,
  FileText,
  Shield,
  Smartphone,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  KeyRound,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { INITIAL_STAFF_DIRECTORY } from "@/lib/directoryData";
import { resetDeviceBindingAction } from "@/actions/employeeActions";
import {
  formatINR,
  getRoleBadge,
  getEmploymentStatusBadge,
} from "@vsecure/shared";

export default function EmployeeDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "compensation" | "documents" | "security"
  >("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const id = params?.id as string;
  const employee =
    INITIAL_STAFF_DIRECTORY.find((e) => e.id === id || e.employeeCode === id) ||
    INITIAL_STAFF_DIRECTORY[0];

  const roleMeta = getRoleBadge(employee.role);
  const statusMeta = getEmploymentStatusBadge(employee.status);

  const handleUnlinkDevice = () => {
    if (confirm(`Unlink ${employee.fullName}'s Android phone (${employee.deviceModel})?`)) {
      startTransition(async () => {
        await resetDeviceBindingAction(employee.id);
        employee.boundDeviceId = null;
        employee.deviceModel = null;
        employee.deviceBoundAt = null;
        setActionMessage("Android device unlinked successfully. Handset binding is now reset.");
        setTimeout(() => setActionMessage(null), 4000);
      });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "timeline", label: "Job & Hierarchy", icon: Briefcase },
    { id: "compensation", label: "Compensation (INR)", icon: IndianRupee },
    { id: "documents", label: "Digital Vault", icon: FileText },
    { id: "security", label: "Android Device Security", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      <Sidebar
        currentPath="#employees"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/employees"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Employee Directory</span>
            </Link>

            <span className="text-xs font-mono font-bold text-slate-400">
              ID: {employee.employeeCode}
            </span>
          </div>

          {actionMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionMessage}</span>
            </div>
          )}

          {/* Profile Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
                  {employee.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {employee.fullName}
                    </h1>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                    {employee.designation} • {employee.departmentName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1 font-sans">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {employee.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {employee.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg border ${roleMeta.badgeClass}`}
                >
                  {roleMeta.label}
                </span>
                {employee.boundDeviceId && (
                  <button
                    onClick={handleUnlinkDevice}
                    disabled={isPending}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Unlink Phone</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 pt-2 border-t border-slate-100 flex overflow-x-auto gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      isActive
                        ? "bg-slate-100 text-blue-700 border border-slate-200 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  Personal & Identity Information
                </span>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Date of Birth (DD-MM-YYYY)</span>
                  <span className="font-semibold text-slate-900 font-mono">{employee.dateOfBirth}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Gender</span>
                  <span className="font-semibold text-slate-900">{employee.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Blood Group</span>
                  <span className="font-bold text-rose-600 font-mono">{employee.bloodGroup}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Emergency Contact</span>
                  <span className="font-semibold text-slate-900 font-mono">{employee.emergencyContact}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">PAN Number</span>
                  <span className="font-mono font-bold text-slate-900 uppercase">{employee.pan}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Aadhaar (UIDAI)</span>
                  <span className="font-mono font-bold text-slate-900">{employee.aadhaarNumber}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  Address & Corporate Workplace
                </span>
                <div>
                  <span className="text-slate-400 block mb-1">Residential Address</span>
                  <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {employee.address}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1">Assigned Geofenced Office</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">VSecure Technologies HQ</span>
                      <span className="text-[11px] text-slate-500">Outer Ring Road, Bengaluru (100m)</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE & HIERARCHY */}
          {activeTab === "timeline" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                Corporate Hierarchy & Reporting Line
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1">Vishnu (Super Admin)</span>
                  <span className="text-slate-500 font-mono text-[11px]">Founder & Chief Architect</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Department Unit</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1">{employee.departmentName}</span>
                  <span className="text-slate-500 text-[11px]">Unit Code: ENG</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Official Joining Date</span>
                  <span className="font-bold text-slate-900 font-mono text-sm block mt-1">{employee.joiningDate}</span>
                  <span className="text-slate-500 text-[11px]">Format: DD-MM-YYYY</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPENSATION (INR) */}
          {activeTab === "compensation" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Indian Rupee (INR ₹) Compensation Structure
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated in accordance with Indian statutory labour and tax standards.
                  </p>
                </div>
                <span className="text-sm font-mono font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {employee.grossSalaryINR ? `${formatINR(employee.grossSalaryINR)} / mo` : "Confidential"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">Basic Pay (50%)</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {employee.basicSalaryINR ? formatINR(employee.basicSalaryINR) : "--"}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">House Rent Allowance (HRA)</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {employee.hraINR ? formatINR(employee.hraINR) : "--"}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">Special Allowances</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {employee.allowancesINR ? formatINR(employee.allowancesINR) : "--"}
                  </div>
                </div>
              </div>

              {/* Bank Disbursement Details */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                  Bank Account for Salary Disbursement
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Bank Name</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{employee.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                      {employee.bankAccountNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block uppercase">
                      {employee.bankIFSC}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL DOCUMENT VAULT */}
          {activeTab === "documents" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Digital Document Vault</h3>
                  <p className="text-xs text-slate-500">Cryptographically verified employee dossiers</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {employee.verifiedDocsCount} Verified Files
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: "Aadhaar Card (UIDAI Verification).pdf", type: "Aadhaar", size: "1.2 MB" },
                  { name: "PAN Card Permanent Verification.pdf", type: "Income Tax", size: "850 KB" },
                  { name: "VSecure Signed Offer Letter.pdf", type: "Offer Letter", size: "2.4 MB" },
                  { name: "Degree & Educational Transcripts.pdf", type: "Education", size: "4.1 MB" },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {doc.type} • {doc.size}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ANDROID DEVICE SECURITY */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Android Single-Device Hardware Binding
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prevents attendance buddy-punching by hardware-locking logins to one physical phone.
                  </p>
                </div>
                {employee.boundDeviceId ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Device Bound & Locked
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Device Unbound
                  </span>
                )}
              </div>

              {employee.boundDeviceId ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {employee.deviceModel || "Android Enterprise Device"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Hardware ID: {employee.boundDeviceId}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Binding Established</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {employee.deviceBoundAt}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Biometric Status</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Fingerprint / Face ID Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-rose-900 block">
                        Lost Handset or Device Upgrade?
                      </span>
                      <p className="text-rose-700 mt-0.5 leading-relaxed">
                        Unlinking the device resets hardware locking. The employee can bind their new handset on next login.
                      </p>
                    </div>
                    <button
                      onClick={handleUnlinkDevice}
                      disabled={isPending}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shrink-0 shadow-2xs"
                    >
                      Unlink Hardware Device
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-800 block">
                    No Android Device Currently Bound
                  </span>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    When {employee.fullName} logs into the VSecure Android app, their physical device ID will automatically bind to this profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
