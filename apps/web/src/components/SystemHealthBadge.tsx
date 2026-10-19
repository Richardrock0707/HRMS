import React from "react";
import { CheckCircle2, Shield, Database, Smartphone, Globe, Cpu } from "lucide-react";
import { VSECURE_CONFIG } from "@vsecure/shared";

export function SystemHealthBadge(): React.ReactElement {
  const systems = [
    {
      name: "Cloud PostgreSQL Schema",
      version: "Supabase / Prisma 6.4",
      status: "Configured & Indexed",
      icon: Database,
    },
    {
      name: "Regional IST & INR Engine",
      version: `${VSECURE_CONFIG.timezone} • ₹ INR`,
      status: "Active (DD-MM-YYYY)",
      icon: Globe,
    },
    {
      name: "Android Mobile Shell",
      version: "Expo SDK 57 • NativeWind",
      status: "EAS APK Ready",
      icon: Smartphone,
    },
    {
      name: "Security & Geofence Engine",
      version: "Haversine 100m Perimeter",
      status: "Hardware GPS Bound",
      icon: Shield,
    },
  ];

  return (
    <div className="glass-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Phase 6 Infrastructure & Core Pipeline Health
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Monorepo workspaces synced with Turborepo 2.11 and pnpm 10.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          All Services Nominal
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {systems.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="p-3.5 rounded-2xl border border-white/80 bg-white/60 backdrop-blur-md flex items-start gap-3 shadow-2xs hover:bg-white/80 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{s.name}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">{s.version}</div>
                <div className="mt-1 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {s.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
