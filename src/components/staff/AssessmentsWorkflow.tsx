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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatDateTime, isPastDate } from "@/lib/formatters";

interface AssessmentsWorkflowProps {
  programmes: any[];
  onNavigateToGrading: (assessmentId: string) => void;
}

export function AssessmentsWorkflow({
  programmes,
  onNavigateToGrading,
}: AssessmentsWorkflowProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] =
    useState<any | null>(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);

  // New assessment form state
  const [formData, setFormData] = useState({
    title: "",
    moduleCode: "",
    moduleName: "",
    programmeId: programmes[0]?.id || "",
    deadline: "",
    description: "",
    totalMarks: "100",
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

  useEffect(() => {
    fetchAssessments();
  }, []);

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
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Assessment Management & Submissions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure coursework assignments, define strict submission deadlines, and review student file uploads.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Assessment
        </Button>
      </div>

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-500">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
          <p className="text-sm">Loading module assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <Card className="p-8 text-center text-zinc-500">
          <FileText className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
          <p className="text-sm font-semibold">No assessments configured yet.</p>
          <p className="text-xs text-zinc-400 mt-1">
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
                className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700">
                        {asm.moduleCode}
                      </span>
                      <span className="text-xs text-zinc-500">{asm.academicYear}</span>
                    </div>
                    {hasPassed ? (
                      <Badge variant="secondary" className="text-[11px]">
                        Deadline Passed
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[11px]">
                        Active / Open
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{asm.title}</CardTitle>
                  <p className="text-xs text-zinc-500">{asm.moduleName}</p>
                </CardHeader>

                <CardContent className="py-3 text-xs space-y-3">
                  {asm.description && (
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {asm.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Deadline: {formatDateTime(asm.deadline)}</span>
                  </div>

                  {/* Submission Statistics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        Submissions
                      </span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {asm.stats.totalSubmissions}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        Late Flagged
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          lateCount > 0 ? "text-amber-600" : "text-zinc-400"
                        }`}
                      >
                        {lateCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        Graded
                      </span>
                      <span className="font-bold text-sm text-emerald-600">
                        {asm.stats.gradedCount}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
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
                    View Submissions ({asm.submissions.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onNavigateToGrading(asm.id)}
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
        title="Create New Assessment"
        description="Publish an assessment brief with a strict submission deadline for student file uploads."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Coursework 1: Distributed Algorithms"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Module Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., CS105"
                value={formData.moduleCode}
                onChange={(e) =>
                  setFormData({ ...formData, moduleCode: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Module Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Web Technologies & Architecture"
                value={formData.moduleName}
                onChange={(e) =>
                  setFormData({ ...formData, moduleName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Programme (Optional)
              </label>
              <select
                value={formData.programmeId}
                onChange={(e) =>
                  setFormData({ ...formData, programmeId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Instructions & Assessment Brief
            </label>
            <textarea
              rows={3}
              placeholder="Describe requirements and specify deliverables (PDF or DOCX format restricted)..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Drilldown Modal (Edge Case: Visual Late Flagging) */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={
          selectedAssessmentForSubmissions
            ? `Submissions: ${selectedAssessmentForSubmissions.title}`
            : "Assessment Submissions"
        }
        description="Inspect submitted student files, verify submission timestamps, and identify flagged late turn-ins."
        maxWidth="2xl"
      >
        {selectedAssessmentForSubmissions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/70 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedAssessmentForSubmissions.moduleCode} —{" "}
                  {selectedAssessmentForSubmissions.moduleName}
                </span>
                <span className="text-zinc-500 block">
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
              >
                {isPastDate(selectedAssessmentForSubmissions.deadline)
                  ? "Closed"
                  : "Open"}
              </Badge>
            </div>

            {selectedAssessmentForSubmissions.submissions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-6 text-center">
                No students have uploaded work for this assessment yet.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {selectedAssessmentForSubmissions.submissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className={`py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      sub.isLate ? "bg-amber-50/40 dark:bg-amber-950/20 rounded-lg" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {sub.student?.fullName}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">
                          ({sub.student?.studentId})
                        </span>
                        {/* Late Submission Visually Flagged (Edge Case Specification) */}
                        {sub.isLate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            LATE SUBMISSION
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            ON-TIME
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400">
                          v{sub.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                        <span className="font-mono">{sub.fileName}</span>
                        <span>•</span>
                        <span>{formatDateTime(sub.submittedAt)}</span>
                      </div>
                      {sub.notes && (
                        <p className="text-[11px] text-zinc-500 italic mt-1">
                          Student note: "{sub.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                onClick={() => {
                  setIsSubmissionsModalOpen(false);
                  onNavigateToGrading(selectedAssessmentForSubmissions.id);
                }}
              >
                Go to Grading Marksheet
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
