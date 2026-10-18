"use client";

import React, { useState, useTransition } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Smartphone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { loginAction, switchDemoUserAction } from "@/actions/authActions";
import { VSECURE_CONFIG, Role, DEMO_CREDENTIALS } from "@vsecure/shared";

export default function LoginPage(): React.ReactElement {
  const [identifier, setIdentifier] = useState("VS-001");
  const [password, setPassword] = useState("VSecure@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  const handleQuickDemoFill = (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setIdentifier(cred.code);
    setPassword("VSecure@2026");
    setErrorMessage(null);
  };

  const handleDirectDemoSwitch = (role: Role) => {
    startTransition(async () => {
      await switchDemoUserAction(role);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand Panel */}
        <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Grid / Radial Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_50%)] pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">VSecure</div>
                <div className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                  Technologies HRMS
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Phase 2 Security Perimeter
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
                Enterprise Workforce Core & Biometric Security
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Single-device Android hardware locking, 4-tier Role-Based Access Control, and regional
                Indian Standard Time engine.
              </p>
            </div>
          </div>

          {/* Security Features List */}
          <div className="relative z-10 space-y-3 my-8 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Android Hardware Device Binding (Zero Buddy-Punching)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Haversine GPS Office Geofence (100m Perimeter)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>4-Tier RBAC (Super Admin, HR, Manager, Employee)</span>
            </div>
          </div>

          {/* Left Footer: IST Timestamp */}
          <div className="relative z-10 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{VSECURE_CONFIG.timezone}</span>
            <span>₹ {VSECURE_CONFIG.currency}</span>
          </div>
        </div>

        {/* Right Side: Sign-In Form & Demo Credentials */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sign in to your account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your corporate email or Employee ID (e.g. <span className="font-mono font-semibold">VS-001</span>)
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live White Theme
              </span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email or Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. VS-001 or vishnu@vsecuretechnologies.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset instructions have been forwarded to corporate administrator Vishnu (VS-001).");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your corporate password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isPending ? "Authenticating Session..." : "Sign in to VSecure"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Role Switcher Demo Cards */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Instant 1-Click RBAC Role Switcher
                </span>
                <span className="text-[11px] text-slate-400">Phase 2 Verification</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.code}
                    type="button"
                    onClick={() => handleDirectDemoSwitch(cred.role)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {cred.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {cred.code}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{cred.badge}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Locked to Pure White Theme • HTTP-Only Cookie</span>
            <span className="text-slate-400 font-mono">VSecure HRMS v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
