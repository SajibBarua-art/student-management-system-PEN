"use client";

import React from "react";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  ChevronDown,
  Sparkles,
  Layers,
  FileCheck2,
  Receipt,
  Users2,
  Award,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export type InstitutionalPersona =
  | "REGISTRY_ADMIN"
  | "MODULE_LEADER"
  | "BURSAR_FINANCE"
  | "STUDENT";

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
  persona: InstitutionalPersona;
  onPersonaChange: (newPersona: InstitutionalPersona) => void;
  students: StudentPersona[];
  activeStudentId: string | null;
  onStudentChange: (id: string) => void;
  activeStaffTab: string;
  onStaffTabChange: (tab: string) => void;
}

export function Navbar({
  role,
  onRoleChange,
  persona,
  onPersonaChange,
  students,
  activeStudentId,
  onStudentChange,
  activeStaffTab,
  onStaffTabChange,
}: NavbarProps) {
  const allStaffTabs = [
    {
      id: "overview",
      label: "Executive Dashboard",
      icon: Layers,
      allowed: ["REGISTRY_ADMIN", "MODULE_LEADER", "BURSAR_FINANCE"],
    },
    {
      id: "enrolment",
      label: "Student Enrolment",
      icon: Users2,
      allowed: ["REGISTRY_ADMIN", "BURSAR_FINANCE"],
    },
    {
      id: "fees",
      label: "Fees & Ledger",
      icon: Receipt,
      allowed: ["REGISTRY_ADMIN", "BURSAR_FINANCE"],
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: FileCheck2,
      allowed: ["REGISTRY_ADMIN", "MODULE_LEADER"],
    },
    {
      id: "marksheet",
      label: "Marksheet & Results",
      icon: Award,
      allowed: ["REGISTRY_ADMIN", "MODULE_LEADER"],
    },
    {
      id: "audit",
      label: "Registry Audit Trail",
      icon: ShieldCheck,
      allowed: ["REGISTRY_ADMIN", "MODULE_LEADER", "BURSAR_FINANCE"],
    },
  ];

  const visibleStaffTabs = allStaffTabs.filter((tab) =>
    tab.allowed.includes(persona)
  );

  const currentStudent = students.find((s) => s.id === activeStudentId);

  const getRoleBadge = () => {
    switch (persona) {
      case "REGISTRY_ADMIN":
        return "LEVEL 4 • REGISTRY GOVERNANCE";
      case "MODULE_LEADER":
        return "FACULTY • ACADEMIC ASSESSOR";
      case "BURSAR_FINANCE":
        return "BURSARY • FINANCE DIRECTORATE";
      case "STUDENT":
        return "ENROLLED CANDIDATE";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0b0e17]/85 backdrop-blur-xl transition-all shadow-xs dark:shadow-none">
      {/* Top Header Row */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-[#101423] border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-white shadow-sm dark:shadow-xl">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Registry<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">OS</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 rounded-full dark:border-indigo-500/25">
                  <Sparkles className="w-2.5 h-2.5" />
                  PEN Global
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Higher Education Registry Administration & Student Portal
              </p>
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Institutional Persona RBAC Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Institutional Persona RBAC Switcher */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  {persona === "STUDENT" ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : persona === "BURSAR_FINANCE" ? (
                    <Receipt className="w-4 h-4" />
                  ) : persona === "MODULE_LEADER" ? (
                    <FileCheck2 className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                    {getRoleBadge()}
                  </span>
                  <select
                    value={persona}
                    onChange={(e) =>
                      onPersonaChange(e.target.value as InstitutionalPersona)
                    }
                    className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-white focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    <option
                      value="REGISTRY_ADMIN"
                      className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white"
                    >
                      Registry Admin (Dr. Pendelton)
                    </option>
                    <option
                      value="MODULE_LEADER"
                      className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white"
                    >
                      Module Leader (Dr. Jenkins)
                    </option>
                    <option
                      value="BURSAR_FINANCE"
                      className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white"
                    >
                      Bursar / Finance (D. Sterling)
                    </option>
                    <option
                      value="STUDENT"
                      className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white"
                    >
                      Student Candidate Portal
                    </option>
                  </select>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Persona Switcher Dropdown (in Student View) */}
            {role === "student" && (
              <div className="relative flex items-center">
                <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-[#14192a] border border-indigo-200 dark:border-indigo-500/30 rounded-xl shadow-xs dark:shadow-lg dark:shadow-indigo-950/40">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {currentStudent?.fullName?.charAt(0) || "S"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                      Active Candidate
                    </span>
                    <select
                      value={activeStudentId || ""}
                      onChange={(e) => onStudentChange(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer pr-4 appearance-none"
                    >
                      {students.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white"
                        >
                          {s.fullName} ({s.studentId} • {s.programme?.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Workflow Tab Bar (When in Staff View) */}
        {role === "staff" && (
          <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-200/80 dark:border-white/[0.06] overflow-x-auto py-2.5 scrollbar-none">
            {visibleStaffTabs.map((tab) => {
              const isActive = activeStaffTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onStaffTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs dark:bg-white/[0.09] dark:text-white dark:border-white/15 dark:shadow-sm dark:shadow-indigo-500/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

