"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  Download,
  AlertCircle,
  Info,
  CheckCheck,
  Send,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  getGradeClassification,
  getClassificationLabel,
  getClassificationBadgeColor,
} from "@/lib/grade-classification";
import { calculateLatePenalty } from "@/lib/academic-engine";
import { formatDateTime } from "@/lib/formatters";
import { Pagination } from "@/components/ui/pagination";

interface MarksheetWorkflowProps {
  initialAssessmentId?: string | null;
  onRefreshGlobalStats: () => void;
  initialAssessments?: any[];
  initialStudents?: any[];
}

export function MarksheetWorkflow({
  initialAssessmentId,
  onRefreshGlobalStats,
  initialAssessments,
  initialStudents,
}: MarksheetWorkflowProps) {
  const [assessments, setAssessments] = useState<any[]>(initialAssessments || []);
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    initialAssessmentId || (initialAssessments && initialAssessments.length > 0 ? initialAssessments[0].id : "")
  );
  const [isLoading, setIsLoading] = useState(
    !initialAssessments || initialAssessments.length === 0 || !initialStudents || initialStudents.length === 0
  );

  // Grading states: studentId -> { numericGrade, feedback, isPublished, classification }
  const [gradingRows, setGradingRows] = useState<
    Record<
      string,
      {
        numericGrade: string;
        feedback: string;
        isPublished: boolean;
        classification: string;
        isSaved: boolean;
        isSaving: boolean;
      }
    >
  >({});

  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resAsm, resStu] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/students"),
      ]);
      const dataAsm = await resAsm.json();
      const dataStu = await resStu.json();

      if (dataAsm.success) {
        setAssessments(dataAsm.data);
        const activeAsmId =
          initialAssessmentId ||
          (dataAsm.data.length > 0 ? dataAsm.data[0].id : "");
        setSelectedAssessmentId(activeAsmId);
      }
      if (dataStu.success) {
        setStudents(dataStu.data);
      }
    } catch (err) {
      console.error("Error loading marksheet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialAssessments !== undefined && initialStudents !== undefined) {
      setAssessments(initialAssessments);
      setStudents(initialStudents);
      const activeAsmId =
        initialAssessmentId ||
        (initialAssessments.length > 0 ? initialAssessments[0].id : "");
      setSelectedAssessmentId(activeAsmId);
      setIsLoading(false);
      return;
    }
    loadData();
  }, [initialAssessmentId, initialAssessments, initialStudents]);

  useEffect(() => {
    if (!selectedAssessmentId) return;
    const currentAsm = assessments.find((a) => a.id === selectedAssessmentId);
    if (!currentAsm) return;

    const rowState: Record<string, any> = {};

    students.forEach((student) => {
      const existingGrade = currentAsm.grades?.find(
        (g: any) => g.studentId === student.id
      );

      if (existingGrade) {
        rowState[student.id] = {
          numericGrade: existingGrade.numericGrade.toString(),
          feedback: existingGrade.feedback || "",
          isPublished: existingGrade.isPublished,
          classification: existingGrade.classification,
          isSaved: true,
          isSaving: false,
        };
      } else {
        rowState[student.id] = {
          numericGrade: "",
          feedback: "",
          isPublished: false,
          classification: "FAIL",
          isSaved: false,
          isSaving: false,
        };
      }
    });

    setGradingRows(rowState);
  }, [selectedAssessmentId, assessments, students]);

  const handleGradeInputChange = (studentId: string, val: string) => {
    const num = parseFloat(val);
    const classification = !isNaN(num)
      ? getGradeClassification(Math.min(100, Math.max(0, num)))
      : "FAIL";

    setGradingRows((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        numericGrade: val,
        classification,
        isSaved: false,
      },
    }));
  };

  const handleFeedbackChange = (studentId: string, val: string) => {
    setGradingRows((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feedback: val,
        isSaved: false,
      },
    }));
  };

  const handleTogglePublish = async (studentId: string) => {
    const current = gradingRows[studentId];
    if (!current || current.numericGrade === "") {
      alert("Please enter a numeric grade before publishing results.");
      return;
    }

    const nextPublished = !current.isPublished;
    await handleSaveGrade(studentId, nextPublished);
  };

  const handleSaveGrade = async (studentId: string, publishStateOverride?: boolean) => {
    const row = gradingRows[studentId];
    if (!row || row.numericGrade === "") return;

    const num = parseFloat(row.numericGrade);
    if (isNaN(num) || num < 0 || num > 100) {
      alert("Numeric grade must be between 0 and 100.");
      return;
    }

    setGradingRows((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], isSaving: true },
    }));

    const isPublished =
      publishStateOverride !== undefined ? publishStateOverride : row.isPublished;

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          studentId,
          numericGrade: num,
          feedback: row.feedback,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save grade");

      setGradingRows((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          numericGrade: data.data.numericGrade.toString(),
          classification: data.data.classification,
          isPublished: data.data.isPublished,
          isSaved: true,
          isSaving: false,
        },
      }));

      setSuccessNotice(`Grade saved successfully.`);
      setTimeout(() => setSuccessNotice(null), 3000);
      onRefreshGlobalStats();
    } catch (err: any) {
      alert(err.message);
      setGradingRows((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], isSaving: false },
      }));
    }
  };

  const handleBatchPublish = async (shouldPublish: boolean) => {
    if (!selectedAssessmentId) return;
    setBatchActionLoading(true);

    try {
      const res = await fetch("/api/grades/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          isPublished: shouldPublish,
          publishAll: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch action failed");

      setGradingRows((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sid) => {
          if (next[sid].numericGrade !== "") {
            next[sid].isPublished = shouldPublish;
          }
        });
        return next;
      });

      setSuccessNotice(data.message);
      setTimeout(() => setSuccessNotice(null), 4000);
      onRefreshGlobalStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const currentAssessment = assessments.find((a) => a.id === selectedAssessmentId);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAssessmentId]);

  const paginatedStudents = students.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Marksheet & Results Publication
            </h2>
            <Badge variant="purple">Examination Board</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter 0–100 numeric scores, review auto-classifications, and control per-student result visibility.
          </p>
        </div>

        {/* Assessment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Assessment:
          </label>
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer max-w-xs truncate"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                {a.moduleCode} — {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successNotice && (
        <Alert variant="success" title="Marksheet Updated">
          {successNotice}
        </Alert>
      )}

      {/* Classification Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/25 text-center">
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block text-sm">
            Distinction
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-500/80 font-medium">Grade ≥ 70%</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-500/25 text-center">
          <span className="font-extrabold text-sky-700 dark:text-sky-400 block text-sm">
            Merit
          </span>
          <span className="text-[11px] text-sky-600 dark:text-sky-500/80 font-medium">Grade ≥ 60%</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/25 text-center">
          <span className="font-extrabold text-amber-700 dark:text-amber-400 block text-sm">
            Pass
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-500/80 font-medium">Grade ≥ 40%</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/25 text-center">
          <span className="font-extrabold text-rose-700 dark:text-rose-400 block text-sm">
            Fail (Resit Required)
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-500/80 font-medium">Grade &lt; 40%</span>
        </div>
      </div>

      {/* Marksheet Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>
              {currentAssessment
                ? `${currentAssessment.moduleCode}: ${currentAssessment.title} (${currentAssessment.credits || 15} Credits)`
                : "Assessment Marksheet"}
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Results marked 'Withheld' will remain completely hidden from the student portal until published by Registry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchPublish(false)}
              isLoading={batchActionLoading}
              className="text-xs"
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-amber-400" />
              Withhold All
            </Button>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleBatchPublish(true)}
              isLoading={batchActionLoading}
              className="text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Publish All Graded
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Submission</th>
                <th className="py-3.5 px-5">Submitted File</th>
                <th className="py-3.5 px-5 w-36">Numeric Grade (0–100)</th>
                <th className="py-3.5 px-5">Classification</th>
                <th className="py-3.5 px-5 min-w-[200px]">Marker Feedback</th>
                <th className="py-3.5 px-5 text-center">Publication Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {paginatedStudents.map((student) => {
                const sub = currentAssessment?.submissions?.find(
                  (s: any) => s.studentId === student.id
                );
                const matchingEc = currentAssessment?.extenuatingCircumstances?.find(
                  (e: any) => e.studentId === student.id
                );
                const hasApprovedEc = matchingEc?.status === "APPROVED";
                const hasPendingEc = matchingEc?.status === "PENDING";
                const lateCalc =
                  sub && sub.isLate && currentAssessment?.deadline
                    ? calculateLatePenalty({
                        rawGrade: parseFloat(gradingRows[student.id]?.numericGrade) || 0,
                        submittedAt: sub.submittedAt,
                        deadline: currentAssessment.deadline,
                        hasApprovedEC: hasApprovedEc,
                      })
                    : null;

                const row = gradingRows[student.id] || {
                  numericGrade: "",
                  feedback: "",
                  isPublished: false,
                  classification: "FAIL",
                  isSaved: false,
                  isSaving: false,
                };

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        {student.studentId}
                      </div>
                    </td>

                    {/* Submission status & Late flag */}
                    <td className="py-3.5 px-5">
                      {sub ? (
                        sub.isLate ? (
                          hasApprovedEc ? (
                            <Badge variant="purple" dot>
                              Late (EC Waived)
                            </Badge>
                          ) : hasPendingEc ? (
                            <Badge variant="warning" dot>
                              Late (EC Pending)
                            </Badge>
                          ) : (
                            <Badge variant="danger" dot>
                              Late (v{sub.version})
                            </Badge>
                          )
                        ) : (
                          <Badge variant="success" dot>
                            On-Time (v{sub.version})
                          </Badge>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          Not Submitted
                        </span>
                      )}
                    </td>

                    {/* Submitted file download */}
                    <td className="py-3.5 px-5">
                      {sub ? (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="max-w-[120px] truncate">
                            {sub.fileName}
                          </span>
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Numeric Grade Input with Institutional Penalty Breakdown */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          placeholder="e.g. 75"
                          value={row.numericGrade}
                          onChange={(e) =>
                            handleGradeInputChange(student.id, e.target.value)
                          }
                          className="w-20 px-2.5 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold text-center"
                        />
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">/100</span>
                      </div>
                      {lateCalc && row.numericGrade !== "" && (
                        <div className="mt-1">
                          {hasApprovedEc ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                              EC Waived (0% pen.)
                            </span>
                          ) : lateCalc.penaltyDeduction > 0 ? (
                            <span
                              className="text-[10px] text-rose-500 font-semibold block"
                              title={lateCalc.explanation}
                            >
                              Net: {lateCalc.penalizedGrade}% (-{lateCalc.penaltyDeduction}%)
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Classification */}
                    <td className="py-3.5 px-5">
                      {row.numericGrade !== "" ? (
                        <Badge
                          variant={
                            row.classification === "DISTINCTION"
                              ? "success"
                              : row.classification === "MERIT"
                              ? "info"
                              : row.classification === "PASS"
                              ? "warning"
                              : "danger"
                          }
                          dot
                        >
                          {row.classification}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs italic">Ungraded</span>
                      )}
                    </td>

                    {/* Qualitative Feedback */}
                    <td className="py-3.5 px-5">
                      <input
                        type="text"
                        placeholder="Constructive feedback..."
                        value={row.feedback}
                        onChange={(e) =>
                          handleFeedbackChange(student.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Publication Toggle */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(student.id)}
                        disabled={row.numericGrade === ""}
                        title={
                          row.isPublished
                            ? "Click to withhold this student's result"
                            : "Click to publish this student's result to their portal"
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          row.isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {row.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Withheld</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Save Button */}
                    <td className="py-3.5 px-5 text-right">
                      <Button
                        size="sm"
                        variant={row.isSaved ? "outline" : "gradient"}
                        onClick={() => handleSaveGrade(student.id)}
                        isLoading={row.isSaving}
                        disabled={row.numericGrade === ""}
                        className="text-xs h-7 py-0 px-3"
                      >
                        {row.isSaved ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400 mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={students.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="candidates"
        />
      </Card>
    </div>
  );
}
