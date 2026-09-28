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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/formatters";

interface OverviewProps {
  stats: any;
  onNavigateTab: (tab: string) => void;
  onOpenEnrolModal: () => void;
  onOpenPaymentModal: (studentId?: string) => void;
}

export function OverviewDashboard({
  stats,
  onNavigateTab,
  onOpenEnrolModal,
  onOpenPaymentModal,
}: OverviewProps) {
  if (!stats) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <p className="text-zinc-500 text-sm">Loading Registry metrics...</p>
      </div>
    );
  }

  const { students, finances, assessments, grades } = stats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Registry Administration Center • Live PostgreSQL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to Registry Operations
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6">
            Manage student enrolments, track fee schedules and overdue payments, configure module assessments, and publish verified marksheet classifications.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onOpenEnrolModal}
              className="bg-white text-indigo-950 hover:bg-indigo-50 font-semibold shadow-md"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Enrol New Student
            </Button>
            <Button
              onClick={() => onOpenPaymentModal()}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Record Payment
            </Button>
            <Button
              onClick={() => onNavigateTab("assessments")}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              Assessments ({assessments.open} Open)
            </Button>
          </div>
        </div>

        {/* Subtle decorative background blur circle */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Overdue Balance Alert (Edge Case Specification) */}
      {finances.overdueCount > 0 && (
        <Alert
          variant="warning"
          title={`Registry Attention Required: ${finances.overdueCount} Student(s) with Overdue Tuition Fees`}
        >
          <div className="mt-2 space-y-2">
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              The following students have unpaid balances where the assigned fee deadline has passed. Their records are visually flagged on the registry ledger:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {finances.overdueStudents.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-lg border border-amber-300 dark:border-amber-800 text-xs shadow-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      {s.fullName}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {s.studentId} • {s.programmeCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">
                      {formatCurrency(s.balance)}
                    </span>
                    <button
                      onClick={() => onOpenPaymentModal(s.id)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Quick Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <Card className="hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Total Enrolled
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {students.total}
              </span>
              <span className="text-xs text-zinc-500">Registered</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
              <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                {students.statusCounts.ENROLLED || 0} Enrolled
              </span>
              <span className="text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                {students.statusCounts.DEFERRED || 0} Deferred
              </span>
              <span className="text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded font-medium">
                {students.statusCounts.COMPLETED || 0} Graduated
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Finances */}
        <Card className="hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Fee Collection
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(finances.totalCollected)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Outstanding:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(finances.outstandingBalance)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Assessments & Submissions */}
        <Card className="hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Submissions
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {assessments.totalSubmissions}
              </span>
              <span className="text-xs text-zinc-500">Total Uploads</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-500">{assessments.open} Open Deadlines</span>
              {assessments.lateSubmissions > 0 ? (
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {assessments.lateSubmissions} Late Flagged
                </span>
              ) : (
                <span className="text-emerald-600">100% On-Time</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Marksheets & Classification */}
        <Card className="hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Exam Board Results
              </span>
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {grades.published}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Published</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Withheld / Board Review:</span>
              <span className="font-semibold text-amber-600">{grades.withheld}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab("enrolment")}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
              1. Student Enrolment
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Register students, generate unique SMS IDs, filter by programme, and maintain enrolment lifecycles.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("fees")}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
              2. Fees & Payments
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Record payment receipts, track program tuition fees, and monitor real-time overdue student ledgers.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("assessments")}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
              3. Assessments
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Create assessment briefs with deadlines, inspect student PDF/DOCX submissions, and identify late turn-ins.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("marksheet")}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
              4. Marksheets & Results
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Input numeric grades (0–100), view auto-classifications (Pass/Merit/Distinction), and manage result publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
