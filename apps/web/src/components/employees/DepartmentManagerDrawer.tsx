"use client";

import React, { useState } from "react";
import { X, Building, Plus, CheckCircle2, Briefcase, Layers } from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}

const initialDepts: Department[] = [
  { id: "dept_eng", name: "Engineering & Architecture", code: "ENG", employeeCount: 14 },
  { id: "dept_hr", name: "People & Human Resources", code: "HR", employeeCount: 3 },
  { id: "dept_ops", name: "Cloud & Operations", code: "OPS", employeeCount: 5 },
  { id: "dept_sales", name: "Enterprise Sales", code: "SBD", employeeCount: 3 },
];

interface DepartmentManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepartmentManagerDrawer({
  isOpen,
  onClose,
}: DepartmentManagerDrawerProps): React.ReactElement | null {
  const [departments, setDepartments] = useState<Department[]>(initialDepts);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    const newDept: Department = {
      id: `dept_${newCode.toLowerCase()}`,
      name: newName.trim(),
      code: newCode.trim().toUpperCase(),
      employeeCount: 0,
    };

    setDepartments([...departments, newDept]);
    setNewName("");
    setNewCode("");
    setSuccessMsg(`Department "${newDept.name}" created successfully.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Department & Role Manager
                </h3>
                <p className="text-[11px] text-slate-500">Corporate workforce structural units</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successMsg && (
            <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add Department Form */}
          <form onSubmit={handleAddDepartment} className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Create New Department
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Department Name (e.g. Finance)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="Code (FIN)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono uppercase focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </form>

          {/* Department List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Active Corporate Units ({departments.length})
            </span>

            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold font-mono text-xs">
                    {dept.code}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{dept.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Code: {dept.code} • Initial Cap: {dept.employeeCount} Staff
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          VSecure Technologies Department Hierarchy
        </div>
      </div>
    </div>
  );
}
