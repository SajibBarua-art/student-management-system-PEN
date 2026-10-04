"use client";

import React from "react";
import {
  Users,
  CreditCard,
  FileCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  GraduationCap,
  Percent,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/formatters";
import { InstitutionalPersona } from "@/components/layout/Navbar";

interface OverviewProps {
  stats: any;
  persona?: InstitutionalPersona;
  onNavigateTab: (tab: string) => void;
  onOpenEnrolModal: () => void;
  onOpenPaymentModal: (studentId?: string) => void;
}

export function OverviewDashboard({
  stats,
  persona = "REGISTRY_ADMIN",
  onNavigateTab,
  onOpenEnrolModal,
  onOpenPaymentModal,
}: OverviewProps) {
  if (!stats || !stats.students || !stats.finances || !stats.assessments || !stats.grades) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-400 text-sm font-medium">Compiling Registry analytics...</p>
      </div>
    );
  }

  const { students, finances, assessments, grades } = stats;

  const collectionPercentage =
    finances.totalAssigned > 0
      ? Math.round((finances.totalCollected / finances.totalAssigned) * 100)
      : 0;

  // RBAC Permission Checks
  const canAccessEnrolment = persona === "REGISTRY_ADMIN" || persona === "BURSAR_FINANCE";
  const canAccessFees = persona === "REGISTRY_ADMIN" || persona === "BURSAR_FINANCE";
  const canAccessAssessments = persona === "REGISTRY_ADMIN" || persona === "MODULE_LEADER";
  const canAccessMarksheet = persona === "REGISTRY_ADMIN" || persona === "MODULE_LEADER";
  const canAccessAudit = persona === "REGISTRY_ADMIN" || persona === "MODULE_LEADER" || persona === "BURSAR_FINANCE";

  return (
    <div className="space-y-6">
      {/* Executive Command Center Hero */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-[#12172b] dark:via-[#101424] dark:to-[#0c0f1a] shadow-lg dark:shadow-2xl">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {persona === "MODULE_LEADER"
                  ? "Academic Command Center • Module Leader View"
                  : persona === "BURSAR_FINANCE"
                  ? "Finance & Bursary Directorate • Cashier Ledger"
                  : "Registry Operations Center • PostgreSQL Live Ledger"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {persona === "MODULE_LEADER"
                ? "Academic Curriculum &"
                : persona === "BURSAR_FINANCE"
                ? "Bursary & Student"
                : "Higher Education"} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 dark:from-indigo-400 dark:via-purple-300 dark:to-sky-400">
                {persona === "MODULE_LEADER"
                  ? "Examination Board"
                  : persona === "BURSAR_FINANCE"
                  ? "Finance Administration"
                  : "Registry Administration"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              {persona === "MODULE_LEADER"
                ? "Direct management of course assessments, submission tracking, 0–100 grading classification, and Examination Board grade ratification."
                : persona === "BURSAR_FINANCE"
                ? "Comprehensive fee assignment monitoring, instalment plan setup, bursary scholarship reductions, and payment reconciliation."
                : "Real-time student lifecycle tracking, fee assignment and ledger balance monitoring, coursework assessment submissions, and Examination Board marksheet management."}
            </p>
          </div>

          {/* Quick Action Buttons (Filtered by Persona RBAC) */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            {canAccessEnrolment && (
              <Button
                onClick={onOpenEnrolModal}
                variant="gradient"
                className="text-xs sm:text-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Enrol New Student
              </Button>
            )}

            {canAccessFees && (
              <Button
                onClick={() => onOpenPaymentModal()}
                variant="secondary"
                className="text-xs sm:text-sm border border-slate-200 dark:border-white/10"
              >
                <CreditCard className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Record Payment
              </Button>
            )}

            {canAccessAssessments && (
              <Button
                onClick={() => onNavigateTab("assessments")}
                variant="outline"
                className="text-xs sm:text-sm border border-slate-200 dark:border-white/10"
              >
                <FileCheck className="w-4 h-4 mr-2 text-sky-600 dark:text-sky-400" />
                Active Assessments ({assessments.open})
              </Button>
            )}

            {canAccessMarksheet && (
              <Button
                onClick={() => onNavigateTab("marksheet")}
                variant={persona === "MODULE_LEADER" ? "gradient" : "outline"}
                className="text-xs sm:text-sm border border-slate-200 dark:border-white/10"
              >
                <Award className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
                Marksheet & Moderation
              </Button>
            )}

            {canAccessAudit && (
              <Button
                onClick={() => onNavigateTab("audit")}
                variant="outline"
                className="text-xs sm:text-sm border border-slate-200 dark:border-white/10"
              >
                <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Audit Trail
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Overdue Fees Attention Banner (Restricted to Bursar & Registry Admin) */}
      {canAccessFees && finances.overdueCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/90 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-slate-900/60 dark:to-slate-900/40 backdrop-blur-md p-5 sm:p-6 shadow-sm dark:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Registry Attention: {finances.overdueCount} Student(s) with Overdue Tuition Fees
                  </h4>
                  <Badge variant="danger" dot>Action Required</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Tuition deadlines have passed with unpaid balances. These records are visually flagged on the registry ledger:
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab("fees")}
              className="shrink-0 text-xs border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/10"
            >
              Open Fee Ledger
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Overdue students pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-rose-200 dark:border-rose-500/15">
            {finances.overdueStudents.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/20 text-xs shadow-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{s.fullName}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {s.studentId} • {s.programmeCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm block">
                    {formatCurrency(s.balance)}
                  </span>
                  <button
                    onClick={() => onOpenPaymentModal(s.id)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Quick Pay →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {students.total}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Active Records</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            <Badge variant="success" dot>{students.statusCounts.ENROLLED || 0} Enrolled</Badge>
            <Badge variant="warning" dot>{students.statusCounts.DEFERRED || 0} Deferred</Badge>
            <Badge variant="info" dot>{students.statusCounts.COMPLETED || 0} Graduated</Badge>
          </div>
        </Card>

        {/* Metric 2: Finances & Collection Rate */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tuition Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(finances.totalCollected)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Collection Rate</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{collectionPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${collectionPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Metric 3: Assessments & Submissions */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Submissions Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {assessments.totalSubmissions}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Files Received</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-white/[0.04]">
            <span className="text-slate-500 dark:text-slate-400">{assessments.open} Open Deadlines</span>
            {assessments.lateSubmissions > 0 ? (
              <Badge variant="warning" dot>{assessments.lateSubmissions} Late Flagged</Badge>
            ) : (
              <Badge variant="success" dot>100% On-Time</Badge>
            )}
          </div>
        </Card>

        {/* Metric 4: Marksheets & Classification */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Examination Board
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {grades.published}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Published Marksheets</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-white/[0.04]">
            <span className="text-slate-500 dark:text-slate-400">Moderation / Withheld:</span>
            <Badge variant="warning">{grades.withheld} Withheld</Badge>
          </div>
        </Card>
      </div>

      {/* Module Leader Academic Moderation Attention Banner */}
      {persona === "MODULE_LEADER" && grades.withheld > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/40 backdrop-blur-md p-5 sm:p-6 shadow-sm dark:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Academic Board Attention: {grades.withheld} Marksheet(s) Withheld for Moderation
                  </h4>
                  <Badge variant="warning" dot>Action Required</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Examination Board review is pending for withheld marks. Review modular classifications and ratify grades:
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab("marksheet")}
              className="shrink-0 text-xs border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10"
            >
              Open Marksheet
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Quick Cards with RBAC Access Protection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Student Enrolment */}
        {canAccessEnrolment ? (
          <div
            onClick={() => onNavigateTab("enrolment")}
            className="p-5 rounded-2xl glass-card hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                1. Student Enrolment
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-generate SMS IDs, manage student profiles, and maintain enrolment lifecycles.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                1. Student Enrolment
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-slate-400">
                Admin / Bursar Only
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Student registration and identity lifecycle is restricted to Registry Administration.
            </p>
          </div>
        )}

        {/* 2. Fees & Payments */}
        {canAccessFees ? (
          <div
            onClick={() => onNavigateTab("fees")}
            className="p-5 rounded-2xl glass-card hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                2. Fees & Payments
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time balance tracking, bank reference payments, and overdue fee alerts.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                2. Fees & Payments
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-slate-400">
                Bursar Only
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Fee assignment and payment transactions are restricted to Bursar Finance.
            </p>
          </div>
        )}

        {/* 3. Assessments */}
        {canAccessAssessments ? (
          <div
            onClick={() => onNavigateTab("assessments")}
            className="p-5 rounded-2xl glass-card hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                3. Assessments
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Module assignments with deadlines, student PDF/DOCX uploads, and late flagging.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                3. Assessments
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-slate-400">
                Academics Only
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Curricular coursework and student uploads are restricted to Academic Leaders.
            </p>
          </div>
        )}

        {/* 4. Marksheets & Results */}
        {canAccessMarksheet ? (
          <div
            onClick={() => onNavigateTab("marksheet")}
            className="p-5 rounded-2xl glass-card hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                4. Marksheets & Results
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              0–100 grading, Pass/Merit/Distinction classifications, and publish/withhold controls.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                4. Marksheets & Results
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-slate-400">
                Academics Only
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Examination Board modular grading and moderation is restricted to Academic Leaders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
