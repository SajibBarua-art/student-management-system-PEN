"use client";

import React from "react";
import { GraduationCap, FileCheck, Award, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";

interface StudentHeroHeaderProps {
  student: any;
  academicStanding: any;
  publishedGradesCount: number;
  activeTab: "finance" | "assessments" | "marksheet";
  onTabChange: (tab: "finance" | "assessments" | "marksheet") => void;
}

export function StudentHeroHeader({
  student,
  academicStanding,
  publishedGradesCount,
  activeTab,
  onTabChange,
}: StudentHeroHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-900 dark:via-slate-900 dark:to-[#0a0d18] text-slate-900 dark:text-white shadow-lg dark:shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 shrink-0">
            <GraduationCap className="w-8 h-8" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {student.fullName}
              </h1>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-white/[0.12] dark:text-indigo-200 dark:border-white/15 font-bold">
                {student.studentId}
              </span>
              <Badge variant="purple" dot>{student.status}</Badge>
              {academicStanding.standing !== "IN_PROGRESS" && (
                <Badge variant={academicStanding.badgeVariant} dot>
                  {academicStanding.standingLabel}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              {student.programme?.name} ({student.programme?.code}) • Academic Year:{" "}
              <span className="text-slate-900 dark:text-white font-semibold">{student.academicYear}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {publishedGradesCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-md text-right shadow-sm dark:shadow-none">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                Weighted Average (WAM)
              </span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 block font-mono">
                {academicStanding.wam}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                {academicStanding.totalEarnedCredits} Credits Earned
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-md text-right shadow-sm dark:shadow-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Tuition Balance
            </span>
            <span
              className={`text-xl font-extrabold block ${
                student.balance > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(student.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Buttons */}
      <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-200/80 dark:border-white/[0.08] overflow-x-auto scrollbar-none">
        <button
          onClick={() => onTabChange("assessments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "assessments"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Coursework Submissions</span>
        </button>

        <button
          onClick={() => onTabChange("marksheet")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "marksheet"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Official Marksheet ({publishedGradesCount} Published)</span>
        </button>

        <button
          onClick={() => onTabChange("finance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "finance"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fees & Finance Ledger</span>
        </button>
      </div>
    </div>
  );
}
