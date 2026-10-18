"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Building2,
  Filter,
} from "lucide-react";
import {
  LeaveRecordItem,
  DEFAULT_2026_HOLIDAYS,
  parseDateDDMMYYYY,
  formatDateDDMMYYYY,
  getLeaveTypeBadge,
} from "@vsecure/shared";

interface LeaveCalendarViewProps {
  requests: LeaveRecordItem[];
}

export function LeaveCalendarView({ requests }: LeaveCalendarViewProps): React.ReactElement {
  // Current calendar view month (0-indexed) & year
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026 default
  const [selectedDept, setSelectedDept] = useState("ALL");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateFormatted: string; // DD-MM-YYYY
      isCurrentMonth: boolean;
      isWeekend: boolean;
      holiday?: { name: string };
      approvedLeaves: LeaveRecordItem[];
    }> = [];

    // Prior month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dayNumber: d,
        dateFormatted: formatDateDDMMYYYY(prevDate),
        isCurrentMonth: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
        approvedLeaves: [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateFormatted = formatDateDDMMYYYY(curDate);
      const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

      const holiday = DEFAULT_2026_HOLIDAYS.find((h) => h.date === dateFormatted);

      // Find approved leaves covering this date
      const approvedLeaves = requests.filter((r) => {
        if (r.status !== "APPROVED" || r.isCancelled) return false;
        if (selectedDept !== "ALL" && r.departmentId !== selectedDept) return false;

        const start = parseDateDDMMYYYY(r.startDate);
        const end = parseDateDDMMYYYY(r.endDate);
        if (!start || !end) return false;

        return curDate.getTime() >= start.getTime() && curDate.getTime() <= end.getTime();
      });

      days.push({
        dayNumber: d,
        dateFormatted,
        isCurrentMonth: true,
        isWeekend,
        holiday,
        approvedLeaves,
      });
    }

    // Next month padding to fill complete 35 or 42 grid
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dayNumber: i,
        dateFormatted: formatDateDDMMYYYY(nextDate),
        isCurrentMonth: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
        approvedLeaves: [],
      });
    }

    return days;
  }, [year, month, requests, selectedDept]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">
              Company-wide leave schedule, recognized public holidays, and weekend exclusions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">All Departments</option>
            <option value="dept_eng">Engineering & Architecture</option>
            <option value="dept_hr">People & HR</option>
            <option value="dept_ops">Cloud & Operations</option>
            <option value="dept_sales">Enterprise Sales</option>
          </select>

          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 9, 1))}
              className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-white rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-1 border-b border-slate-100 pb-2">
        <div className="text-rose-500">Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div className="text-rose-500">Sat</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((d, idx) => (
          <div
            key={idx}
            className={`min-h-[90px] p-2 rounded-lg border transition-all flex flex-col justify-between ${
              !d.isCurrentMonth
                ? "bg-slate-50/40 border-slate-100 text-slate-300"
                : d.isWeekend
                ? "bg-slate-50/80 border-slate-200/60 text-slate-600"
                : "bg-white border-slate-200 text-slate-800 hover:border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-bold ${
                  !d.isCurrentMonth
                    ? "text-slate-300"
                    : d.isWeekend
                    ? "text-rose-600"
                    : "text-slate-900"
                }`}
              >
                {d.dayNumber}
              </span>

              {d.holiday && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 truncate max-w-[80px]" title={d.holiday.name}>
                  Holiday
                </span>
              )}
            </div>

            {/* Holiday Title Banner */}
            {d.holiday && (
              <div className="text-[10px] font-semibold text-amber-700 leading-tight mb-1 bg-amber-50/50 p-1 rounded border border-amber-200/50 truncate" title={d.holiday.name}>
                {d.holiday.name}
              </div>
            )}

            {/* Approved Leaves List */}
            <div className="space-y-1 overflow-hidden">
              {d.approvedLeaves.slice(0, 2).map((l) => {
                const badge = getLeaveTypeBadge(l.leaveType);
                return (
                  <div
                    key={l.id}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate ${badge.badgeClass}`}
                    title={`${l.employeeName} (${badge.code}): ${l.startDate} to ${l.endDate}`}
                  >
                    {l.employeeName.split(" ")[0]} ({badge.code})
                  </div>
                );
              })}

              {d.approvedLeaves.length > 2 && (
                <div className="text-[10px] font-bold text-slate-500 pl-1">
                  +{d.approvedLeaves.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
