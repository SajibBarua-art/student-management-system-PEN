"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  Printer,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/formatters";
import { getClassificationLabel } from "@/lib/grade-classification";
import {
  PAGINATION,
  CLASSIFICATION_FILTER_OPTIONS,
} from "@/constants";

interface StudentMarksheetTabProps {
  publishedGrades: any[];
  withheldGradesCount: number;
  academicStanding: any;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  classificationFilter: string;
  onClassificationFilterChange: (filter: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  paginatedGrades: any[];
  totalFilteredCount: number;
  onOpenTranscriptModal: () => void;
}

export function StudentMarksheetTab({
  publishedGrades,
  withheldGradesCount,
  academicStanding,
  searchTerm,
  onSearchTermChange,
  classificationFilter,
  onClassificationFilterChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  paginatedGrades,
  totalFilteredCount,
  onOpenTranscriptModal,
}: StudentMarksheetTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Official University Marksheet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official grades confirmed and published by the Registry Examination Board.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTranscriptModal}
            className="text-xs font-bold"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
            Print Official Transcript
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Registry Board Stamped
          </span>
        </div>
      </div>

      {/* Moderation Notice */}
      {withheldGradesCount > 0 && (
        <Alert variant="info" title="Examination Board Moderation Notice">
          {withheldGradesCount} assessment module(s) are undergoing external moderation by the Registry Board and will be made visible once published.
        </Alert>
      )}

      {/* Academic Progression & Honours Standing Card */}
      {publishedGrades.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/30 dark:via-slate-900/60 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-500/20 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 dark:text-indigo-400">
                  Academic Standing & Progression
                </span>
                <Badge variant={academicStanding.badgeVariant} dot>
                  {academicStanding.standingLabel}
                </Badge>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {academicStanding.awardClassification}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {academicStanding.progressionDecision}
              </p>
            </div>

            <div className="flex items-center gap-3 text-center shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                  Weighted Mark (WAM)
                </span>
                <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {academicStanding.wam}%
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                  Credits Accumulated
                </span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {academicStanding.totalEarnedCredits} / {academicStanding.totalAttemptedCredits}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {publishedGrades.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No Results Published Yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Your coursework is undergoing academic assessment. Results will appear here immediately after formal publication by the Registry Examination Board.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Ratified Assessment Outcomes</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official modular performance records with credits and ratified award classifications.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search module or title..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => onSearchTermChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Classification:</span>
                <select
                  value={classificationFilter}
                  onChange={(e) => onClassificationFilterChange(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CLASSIFICATION_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-5">Module Code</th>
                  <th className="py-3.5 px-5">Credits</th>
                  <th className="py-3.5 px-5">Assessment Title</th>
                  <th className="py-3.5 px-5">Numeric Grade</th>
                  <th className="py-3.5 px-5">Classification</th>
                  <th className="py-3.5 px-5">Feedback & Remarks</th>
                  <th className="py-3.5 px-5 text-right">Published Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {totalFilteredCount === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 italic text-xs">
                      No marksheet grades match your search or classification filter.
                    </td>
                  </tr>
                ) : (
                  paginatedGrades.map((grade: any) => (
                    <tr
                      key={grade.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {grade.assessment?.moduleCode}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                          {grade.assessment?.credits || 15} Credits
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {grade.assessment?.title}
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {grade.numericGrade}%
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant={
                            grade.classification === "DISTINCTION"
                              ? "success"
                              : grade.classification === "MERIT"
                              ? "info"
                              : grade.classification === "PASS"
                              ? "warning"
                              : "danger"
                          }
                          dot
                        >
                          {getClassificationLabel(grade.classification)}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300 italic max-w-xs text-xs">
                        {grade.feedback || "Satisfactory academic performance."}
                      </td>
                      <td className="py-4 px-5 text-right text-slate-400 dark:text-slate-500 font-mono text-xs">
                        {formatDate(grade.publishedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalFilteredCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[...PAGINATION.OPTIONS.COMPACT]}
            itemLabel="grades"
          />
        </Card>
      )}
    </div>
  );
}
