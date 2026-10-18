"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  IndianRupee,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  Role,
  formatINR,
  DEFAULT_OFFICE_COORDINATES,
} from "@vsecure/shared";
import { onboardEmployeeAction } from "@/actions/employeeActions";

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  nextCode?: string;
}

export function OnboardingWizardModal({
  isOpen,
  onClose,
  onSuccess,
  nextCode = "VS-005",
}: OnboardingWizardModalProps): React.ReactElement | null {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Identity
    fullName: "",
    email: "",
    phone: "+91 ",
    dateOfBirth: "15-08-1996",
    gender: "Male" as "Male" | "Female" | "Non-Binary" | "Prefer Not to Say",
    bloodGroup: "O+" as "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
    pan: "ABCDE1234F",
    aadhaarNumber: "1234-5678-9012",

    // Step 2: Employment & Role
    employeeCode: nextCode,
    joiningDate: "01-11-2026",
    departmentId: "dept_eng",
    designation: "Software Engineer",
    role: "EMPLOYEE" as Role,
    reportingManagerId: "emp_vsecure_001",
    officeLocationId: "loc_vsecure_hq",

    // Step 3: INR Compensation
    monthlyGrossINR: 75000,
    basicSalaryINR: 37500, // 50%
    hraINR: 15000,         // 20%
    allowancesINR: 22500,  // 30%
    pfDeductionINR: 1800,
    profTaxINR: 200,
    pfApplicable: true,
    esiApplicable: false,
    bankName: "HDFC Bank",
    bankAccountNumber: "50100987654321",
    bankIFSC: "HDFC0001234",

    // Step 4: Documents Upload State
    docsUploaded: {
      photo: true,
      aadhaar: true,
      pan: true,
      offerLetter: true,
    },
  });

  // Calculate salary components automatically when Gross changes
  const handleGrossChange = (gross: number) => {
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.2);
    const allowances = Math.round(gross * 0.3);

    setFormData((prev) => ({
      ...prev,
      monthlyGrossINR: gross,
      basicSalaryINR: basic,
      hraINR: hra,
      allowancesINR: allowances,
    }));
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: "Personal & Identity", icon: User },
    { number: 2, title: "Employment & Role", icon: Briefcase },
    { number: 3, title: "Compensation (INR)", icon: IndianRupee },
    { number: 4, title: "Document Vault", icon: FileText },
  ];

  const handleNextStep = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage("Please enter employee's full name.");
        return;
      }
      if (!formData.email.includes("@")) {
        setErrorMessage("Please provide a valid corporate email address.");
        return;
      }
      if (formData.phone.length < 13) {
        setErrorMessage("Please enter a valid 10-digit Indian phone number with +91.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await onboardEmployeeAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to onboard employee.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-auto animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Employee Onboarding Wizard
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {formData.employeeCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Guided 4-step workforce registration with strict regional formats & INR compensation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = s.number < currentStep;
            const isCurrent = s.number === currentStep;

            return (
              <div
                key={s.number}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-white text-blue-700 border border-slate-200 shadow-2xs"
                    : isCompleted
                    ? "text-emerald-700"
                    : "text-slate-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? "bg-blue-600 text-white font-bold"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800 font-bold"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : s.number}
                </div>
                <span className="truncate hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* STEP 1: Personal & Identity */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ramesh.kumar@vsecuretechnologies.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth (DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    placeholder="15-08-1996"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactName: e.target.value })
                    }
                    placeholder="e.g. Sunita Kumar (Spouse)"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactPhone: e.target.value })
                    }
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Number (Income Tax)
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar Number (UIDAI)
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="1234-5678-9012"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Apartment, Street, Landmark, Bengaluru, Karnataka - 560001"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Employment & Role */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Code (Auto-Sequential)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.employeeCode}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto-generated next sequential identifier for capacity tracking.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Joining Date (DD-MM-YYYY) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    placeholder="01-11-2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="dept_eng">Engineering & Architecture</option>
                    <option value="dept_hr">People & Human Resources</option>
                    <option value="dept_ops">Cloud & Operations</option>
                    <option value="dept_sales">Enterprise Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System RBAC Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-semibold"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Self-Service Profile & Digital ID)</option>
                    <option value="MANAGER">MANAGER (Department Scoped View)</option>
                    <option value="HR_ADMIN">HR_ADMIN (Workforce & Salary Manager)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Root Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Office Geofence *
                  </label>
                  <select
                    value={formData.officeLocationId}
                    onChange={(e) => setFormData({ ...formData, officeLocationId: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="loc_vsecure_hq">
                      VSecure Technologies HQ (Bengaluru • 100m Radius)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INR Compensation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Monthly Gross CTC (Indian Rupees ₹)
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {formatINR(formData.monthlyGrossINR)} / month
                  </span>
                </div>
                <input
                  type="number"
                  step="1000"
                  value={formData.monthlyGrossINR}
                  onChange={(e) => handleGrossChange(parseFloat(e.target.value) || 0)}
                  className="w-full mt-2 px-3 py-2 text-sm font-mono font-bold bg-white border border-blue-300 rounded-lg text-blue-950 focus:outline-hidden focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Annual CTC Equivalent: {formatINR(formData.monthlyGrossINR * 12)}
                </span>
              </div>

              {/* Automatic Indian Compensation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">Basic Salary (50%)</span>
                  <div className="font-bold font-mono text-slate-900 text-sm mt-1">
                    {formatINR(formData.basicSalaryINR)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">HRA (20%)</span>
                  <div className="font-bold font-mono text-slate-900 text-sm mt-1">
                    {formatINR(formData.hraINR)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 font-medium">Special Allowances (30%)</span>
                  <div className="font-bold font-mono text-slate-900 text-sm mt-1">
                    {formatINR(formData.allowancesINR)}
                  </div>
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Provident Fund (PF) Deduction
                  </label>
                  <input
                    type="number"
                    value={formData.pfDeductionINR}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pfDeductionINR: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard ₹1,800/mo</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Tax (PT)
                  </label>
                  <input
                    type="number"
                    value={formData.profTaxINR}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profTaxINR: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard Karnataka ₹200/mo</span>
                </div>
              </div>

              {/* Bank Details for Salary Disbursement */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Salary Disbursement Bank Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, bankAccountNumber: e.target.value })
                      }
                      placeholder="50100234567890"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.bankIFSC}
                      onChange={(e) =>
                        setFormData({ ...formData, bankIFSC: e.target.value.toUpperCase() })
                      }
                      placeholder="HDFC0001234"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Digital Document Vault */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Upload verified identity and educational records. Files are stored securely with cryptographic validation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "photo",
                    title: "Profile Photograph",
                    desc: "Formal headshot (JPEG/PNG, max 2MB)",
                  },
                  {
                    key: "aadhaar",
                    title: "Aadhaar Card (UIDAI)",
                    desc: "Front & Back scanned PDF",
                  },
                  {
                    key: "pan",
                    title: "PAN Card",
                    desc: "Clear scanned PDF or image",
                  },
                  {
                    key: "offerLetter",
                    title: "Signed Offer Letter",
                    desc: "Countersigned VSecure offer copy",
                  },
                ].map((doc) => (
                  <div
                    key={doc.key}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{doc.desc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Attached
                    </span>
                  </div>
                ))}
              </div>

              {/* Ready to Onboard Summary Card */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    Ready to complete onboarding for {formData.fullName || "New Employee"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Upon completion, {formData.fullName} ({formData.employeeCode}) will be added to the
                  directory with role <span className="font-semibold">{formData.role}</span>. An account activation
                  credential will be provisioned with single-device Android hardware locking enabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            Step {currentStep} of 4
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Onboarding Staff..." : "Complete Onboarding"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
