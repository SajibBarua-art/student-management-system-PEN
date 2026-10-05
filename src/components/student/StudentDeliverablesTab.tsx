"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  UploadCloud,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime, isPastDate } from "@/lib/formatters";
import {
  PAGINATION,
  ASSESSMENT_STATUS_FILTER_OPTIONS,
} from "@/constants";

interface StudentDeliverablesTabProps {
  student: any;
  assessments: any[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  paginatedAssessments: any[];
  totalFilteredCount: number;
  onRefresh: () => void;
  onOpenUploadModal: (asm: any) => void;
  onOpenEcModal: (asm: any) => void;
}

export function StudentDeliverablesTab({
  student,
  assessments,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  paginatedAssessments,
  totalFilteredCount,
  onRefresh,
  onOpenUploadModal,
  onOpenEcModal,
}: StudentDeliverablesTabProps) {
  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Coursework Assignments
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload deliverables in PDF or DOCX format. Resubmissions are allowed until the official deadline.
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
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ASSESSMENT_STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
            Refresh
          </Button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs italic">
          No coursework assessments assigned to your programme.
        </Card>
      ) : totalFilteredCount === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs italic">
          No coursework assignments match your search or filter criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedAssessments.map((asm) => {
              const mySubmission = student?.submissions?.find(
                (s: any) => s.assessmentId === asm.id
              );
              const pastDeadline = isPastDate(asm.deadline);

              return (
                <Card
                  key={asm.id}
                  className="flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                        {asm.moduleCode}
                      </span>
                      {pastDeadline ? (
                        <Badge variant="secondary">Deadline Passed</Badge>
                      ) : (
                        <Badge variant="success" dot>Open for Submission</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base sm:text-lg mt-3 text-slate-900 dark:text-white">
                      {asm.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {asm.moduleName}
                    </p>
                  </CardHeader>

                  <CardContent className="py-2 text-xs space-y-3">
                    {asm.description && (
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {asm.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.04]">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Deadline: {formatDateTime(asm.deadline)}</span>
                    </div>

                    {/* Status Pill */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/80">
                      {mySubmission ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              Submission Confirmed
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Version {mySubmission.version}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                              {mySubmission.fileName}
                            </span>
                            {mySubmission.isLate && (
                              <Badge variant="danger" dot className="text-[10px]">
                                Submitted Late
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Uploaded on: {formatDateTime(mySubmission.submittedAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 dark:text-slate-400 italic flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>No submission uploaded yet</span>
                        </div>
                      )}
                    </div>

                    {/* Extenuating Circumstances (EC) Claim Badge / Button */}
                    {(() => {
                      const myEc = student?.extenuatingCircumstances?.find((ec: any) => ec.assessmentId === asm.id);
                      if (myEc) {
                        return (
                          <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            myEc.status === "APPROVED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-300"
                              : myEc.status === "REJECTED"
                              ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500/30 dark:text-rose-300"
                              : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-300"
                          }`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold truncate">
                                EC Claim ({myEc.reason}): {myEc.status === "APPROVED" ? `Approved (+${myEc.requestedExtensionDays}d extension)` : myEc.status}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenEcModal(asm)}
                              className="text-[11px] font-bold underline hover:opacity-80 shrink-0 cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => onOpenEcModal(asm)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>Request Extension (EC Claim)</span>
                          </button>
                        </div>
                      );
                    })()}
                  </CardContent>

                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-200 dark:border-white/[0.04] flex items-center justify-between gap-2">
                    {mySubmission ? (
                      <>
                        <a
                          href={mySubmission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download File
                        </a>

                        {!pastDeadline ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenUploadModal(asm)}
                            className="text-xs"
                          >
                            <UploadCloud className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                            Resubmit (v{mySubmission.version + 1})
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            Resubmission closed
                          </span>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => onOpenUploadModal(asm)}
                        className="w-full text-xs"
                      >
                        <UploadCloud className="w-4 h-4 mr-1.5" />
                        Upload Assignment (PDF / DOCX)
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalFilteredCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[...PAGINATION.OPTIONS.CARDS]}
            itemLabel="assignments"
          />
        </div>
      )}
    </div>
  );
}
