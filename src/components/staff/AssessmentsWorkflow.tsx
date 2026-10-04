"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatDateTime, isPastDate } from "@/lib/formatters";

interface AssessmentsWorkflowProps {
  programmes: any[];
  onNavigateToGrading: (assessmentId: string) => void;
  initialAssessments?: any[];
}

export function AssessmentsWorkflow({
  programmes,
  onNavigateToGrading,
  initialAssessments,
}: AssessmentsWorkflowProps) {
  const [assessments, setAssessments] = useState<any[]>(initialAssessments || []);
  const [isLoading, setIsLoading] = useState(!initialAssessments || initialAssessments.length === 0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] =
    useState<any | null>(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [reviewingEcId, setReviewingEcId] = useState<string | null>(null);

  // New assessment form state
  const [formData, setFormData] = useState({
    title: "",
    moduleCode: "",
    moduleName: "",
    programmeId: programmes[0]?.id || "",
    deadline: "",
    description: "",
    totalMarks: "100",
    credits: "15",
    academicYear: "2024/2025",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.success) {
        setAssessments(data.data);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewEc = async (
    ecId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setReviewingEcId(ecId);
    try {
      const res = await fetch("/api/extenuating-circumstances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ecId,
          status,
          reviewerNotes:
            status === "APPROVED"
              ? "Approved by Academic Registry. Late submission penalty formally waived."
              : "Claim rejected due to non-qualifying grounds or insufficient supporting evidence.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh assessments list and current modal view
        const updatedRes = await fetch("/api/assessments");
        const updatedData = await updatedRes.json();
        if (updatedData.success) {
          setAssessments(updatedData.data);
          const current = updatedData.data.find(
            (a: any) => a.id === selectedAssessmentForSubmissions?.id
          );
          if (current) setSelectedAssessmentForSubmissions(current);
        }
      }
    } catch (err) {
      console.error("Failed to review EC:", err);
    } finally {
      setReviewingEcId(null);
    }
  };

  useEffect(() => {
    if (initialAssessments && initialAssessments.length > 0) {
      setAssessments(initialAssessments);
      setIsLoading(false);
    } else {
      fetchAssessments();
    }
  }, [initialAssessments]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create assessment");
      }

      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        moduleCode: "",
        moduleName: "",
        programmeId: programmes[0]?.id || "",
        deadline: "",
        description: "",
        totalMarks: "100",
        credits: "15",
        academicYear: "2024/2025",
      });
      fetchAssessments();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Assessment Management & Workflows
            </h2>
            <Badge variant="purple">{assessments.length} Total Modules</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure coursework assignments, define strict submission deadlines, and review student file uploads.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="gradient" size="sm">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Assessment
        </Button>
      </div>

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
          <p className="text-sm">Loading module assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <Card className="p-10 text-center text-slate-500 dark:text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No assessments configured yet.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Create New Assessment" to set up your first module submission deadline.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((asm) => {
            const hasPassed = isPastDate(asm.deadline);
            const lateCount = asm.stats.lateSubmissions;

            return (
              <Card
                key={asm.id}
                className="flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                        {asm.moduleCode}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                        {asm.credits || 15} Credits
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{asm.academicYear}</span>
                    </div>
                    {hasPassed ? (
                      <Badge variant="secondary">Deadline Passed</Badge>
                    ) : (
                      <Badge variant="success" dot>Active / Open</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg mt-3 text-slate-900 dark:text-white">{asm.title}</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{asm.moduleName}</p>
                </CardHeader>

                <CardContent className="py-3 text-xs space-y-3">
                  {asm.description && (
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {asm.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.04]">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Official Deadline: {formatDateTime(asm.deadline)}</span>
                  </div>

                  {/* Submission Statistics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/[0.06] text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                        Submissions
                      </span>
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {asm.stats.totalSubmissions}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                        Late Flagged
                      </span>
                      <span
                        className={`font-extrabold text-base ${
                          lateCount > 0 ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {lateCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                        Graded
                      </span>
                      <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                        {asm.stats.gradedCount}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-white/[0.04]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAssessmentForSubmissions(asm);
                      setIsSubmissionsModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Inspect Uploads ({asm.submissions.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onNavigateToGrading(asm.id)}
                    variant="gradient"
                    className="text-xs"
                  >
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    Grade Marksheet
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assessment Assignment"
        description="Publish coursework briefs with strict deadlines for student file uploads (PDF/DOCX restricted)."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Coursework 1: Advanced Distributed Systems"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Module Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS105"
                value={formData.moduleCode}
                onChange={(e) =>
                  setFormData({ ...formData, moduleCode: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Module Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Web Technologies & Architecture"
                value={formData.moduleName}
                onChange={(e) =>
                  setFormData({ ...formData, moduleName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Associated Programme (Optional)
              </label>
              <select
                value={formData.programmeId}
                onChange={(e) =>
                  setFormData({ ...formData, programmeId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Modular Credit Weighting (CATS/ECTS) *
              </label>
              <select
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
              >
                <option value="15">15 Credits (Standard Module)</option>
                <option value="30">30 Credits (Double Module / Project)</option>
                <option value="45">45 Credits (Major Capstone)</option>
                <option value="60">60 Credits (Dissertation / Thesis)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Assessment Instructions & Deliverables
            </label>
            <textarea
              rows={3}
              placeholder="Describe requirements and specify submission guidelines (strictly restricted to PDF or DOCX format)..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isSubmitting}>
              Create Assessment Brief
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Inspection Modal (Edge Case Requirement: Late Flagging) */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={
          selectedAssessmentForSubmissions
            ? `Submissions: ${selectedAssessmentForSubmissions.title}`
            : "Assessment Submissions"
        }
        description="Review student file uploads. Submissions submitted after deadline are visually highlighted with late warnings."
        maxWidth="2xl"
      >
        {selectedAssessmentForSubmissions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {selectedAssessmentForSubmissions.moduleCode} —{" "}
                  {selectedAssessmentForSubmissions.moduleName}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                  Official Deadline:{" "}
                  {formatDateTime(selectedAssessmentForSubmissions.deadline)}
                </span>
              </div>
              <Badge
                variant={
                  isPastDate(selectedAssessmentForSubmissions.deadline)
                    ? "secondary"
                    : "success"
                }
                dot
              >
                {isPastDate(selectedAssessmentForSubmissions.deadline)
                  ? "Closed"
                  : "Open"}
              </Badge>
            </div>

            {selectedAssessmentForSubmissions.submissions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/[0.04]">
                No students have uploaded files for this assessment yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {selectedAssessmentForSubmissions.submissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className={`py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-colors ${
                      sub.isLate ? "bg-rose-50/70 border border-rose-200 dark:bg-rose-500/[0.06] dark:border-rose-500/20" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {sub.student?.fullName}
                        </span>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                          ({sub.student?.studentId})
                        </span>
                        {/* Edge Case: Visual Late Submission Flag with EC Awareness */}
                        {sub.isLate ? (
                          (() => {
                            const matchingEc =
                              selectedAssessmentForSubmissions.extenuatingCircumstances?.find(
                                (e: any) =>
                                  e.studentId === sub.student?.id ||
                                  e.studentId === sub.studentId
                              );
                            if (matchingEc?.status === "APPROVED") {
                              return (
                                <Badge variant="purple" dot>
                                  Late (Penalty Waived — EC Approved)
                                </Badge>
                              );
                            }
                            if (matchingEc?.status === "PENDING") {
                              return (
                                <Badge variant="warning" dot>
                                  Late (EC Claim Pending Review)
                                </Badge>
                              );
                            }
                            return (
                              <Badge variant="danger" dot>
                                LATE SUBMISSION (-5%/day)
                              </Badge>
                            );
                          })()
                        ) : (
                          <Badge variant="success" dot>
                            ON-TIME
                          </Badge>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          v{sub.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-mono text-slate-700 dark:text-slate-300">{sub.fileName}</span>
                        <span>•</span>
                        <span>Submitted: {formatDateTime(sub.submittedAt)}</span>
                      </div>
                      {sub.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                          Student note: "{sub.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Extenuating Circumstances (EC) Review Panel */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Extenuating Circumstances Claims (
                    {selectedAssessmentForSubmissions.extenuatingCircumstances?.length || 0}
                    )
                  </span>
                </div>
              </div>

              {!selectedAssessmentForSubmissions.extenuatingCircumstances ||
              selectedAssessmentForSubmissions.extenuatingCircumstances.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/[0.04]">
                  No formal extenuating circumstance claims have been filed for this assessment.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedAssessmentForSubmissions.extenuatingCircumstances.map(
                    (ec: any) => (
                      <div
                        key={ec.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {ec.student?.fullName}
                            </span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400">
                              ({ec.student?.studentId})
                            </span>
                            <Badge
                              variant={
                                ec.status === "APPROVED"
                                  ? "success"
                                  : ec.status === "REJECTED"
                                  ? "danger"
                                  : "warning"
                              }
                              dot
                            >
                              {ec.status}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatDate(ec.createdAt)}
                          </span>
                        </div>

                        <div className="text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                            Grounds: {ec.reason}
                          </span>
                          <p className="mt-0.5">{ec.explanation}</p>
                        </div>

                        {ec.evidenceUrl && (
                          <div className="text-[11px]">
                            <span className="text-slate-500">Supporting Evidence: </span>
                            <a
                              href={ec.evidenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                            >
                              {ec.evidenceUrl}
                            </a>
                          </div>
                        )}

                        {ec.status === "PENDING" ? (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                            <Button
                              size="sm"
                              variant="gradient"
                              className="text-xs h-7 px-3"
                              isLoading={reviewingEcId === ec.id}
                              onClick={() => handleReviewEc(ec.id, "APPROVED")}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Approve (Waive Penalty)
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-3 border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              isLoading={reviewingEcId === ec.id}
                              onClick={() => handleReviewEc(ec.id, "REJECTED")}
                            >
                              Reject Claim
                            </Button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-white/5">
                            Registry decision: {ec.reviewerNotes || ec.status}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-white/[0.08]">
              <Button
                variant="gradient"
                onClick={() => {
                  setIsSubmissionsModalOpen(false);
                  onNavigateToGrading(selectedAssessmentForSubmissions.id);
                }}
              >
                Go to Marksheet & Grade
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
