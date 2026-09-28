"use client";

import React from "react";
import {
  GraduationCap,
  ShieldCheck,
  User,
  Database,
  Building2,
  ChevronDown,
} from "lucide-react";

interface StudentPersona {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programme: { code: string; name: string };
  status: string;
}

interface NavbarProps {
  role: "staff" | "student";
  onRoleChange: (newRole: "staff" | "student") => void;
  students: StudentPersona[];
  activeStudentId: string | null;
  onStudentChange: (id: string) => void;
  activeStaffTab: string;
  onStaffTabChange: (tab: string) => void;
}

export function Navbar({
  role,
  onRoleChange,
  students,
  activeStudentId,
  onStudentChange,
  activeStaffTab,
  onStaffTabChange,
}: NavbarProps) {
  const staffTabs = [
    { id: "overview", label: "Dashboard" },
    { id: "enrolment", label: "1. Student Enrolment" },
    { id: "fees", label: "2. Fees & Payments" },
    { id: "assessments", label: "3. Assessments" },
    { id: "marksheet", label: "4. Marksheet & Results" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Module Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                  Registry<span className="text-indigo-600">OS</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                  Registry Module
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
                PEN Global Student Management System
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & Student Persona */}
          <div className="flex items-center gap-3">
            {/* DB Health indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3 h-3 ml-0.5" />
              <span>PostgreSQL Active</span>
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
              <button
                type="button"
                onClick={() => onRoleChange("staff")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === "staff"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff View</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange("student")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === "student"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student View</span>
              </button>
            </div>

            {/* Persona Selector when in Student View */}
            {role === "student" && (
              <div className="relative flex items-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden lg:inline">
                    Simulating:
                  </span>
                  <select
                    value={activeStudentId || ""}
                    onChange={(e) => onStudentChange(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
                  >
                    {students.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        {s.fullName} ({s.studentId} • {s.programme?.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Navigation Bar (For Staff Workflows) */}
        {role === "staff" && (
          <div className="flex items-center space-x-1 sm:space-x-2 border-t border-zinc-100 dark:border-zinc-800/80 overflow-x-auto py-2 scrollbar-none">
            {staffTabs.map((tab) => {
              const isActive = activeStaffTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onStaffTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
