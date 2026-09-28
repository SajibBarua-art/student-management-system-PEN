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
import { formatDateTime } from "@/lib/formatters";

interface MarksheetWorkflowProps {
  initialAssessmentId?: string | null;
  onRefreshGlobalStats: () => void;
}

export function MarksheetWorkflow({
  initialAssessmentId,
  onRefreshGlobalStats,
}: MarksheetWorkflowProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

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

  // Load assessments and students
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
    loadData();
  }, [initialAssessmentId]);

  // When selected assessment changes, synchronize grading state from existing grades
  useEffect(() => {
    if (!selectedAssessmentId) return;
    const currentAsm = assessments.find((a) => a.id === selectedAssessmentId);
    if (!currentAsm) return;

    const rowState: Record<string, any> = {};

    students.forEach((student) => {
      // Find if student has grade for this assessment
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

    // Save and toggle in one go
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

      // Update local grading rows state
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

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Marksheet & Results Publication
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Enter 0–100 numeric scores, review auto-classifications (Pass/Merit/Distinction), and control per-student result publication.
          </p>
        </div>

        {/* Assessment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            Assessment:
          </label>
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer max-w-xs truncate"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
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

      {/* Classification Legend Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
            Distinction
          </span>
          <span className="text-[11px] text-emerald-600">Grade ≥ 70%</span>
        </div>
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
          <span className="font-bold text-blue-800 dark:text-blue-300 block">
            Merit
          </span>
          <span className="text-[11px] text-blue-600">Grade ≥ 60%</span>
        </div>
        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
          <span className="font-bold text-amber-800 dark:text-amber-300 block">
            Pass
          </span>
          <span className="text-[11px] text-amber-600">Grade ≥ 40%</span>
        </div>
        <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
          <span className="font-bold text-rose-800 dark:text-rose-300 block">
            Fail (Resit Required)
          </span>
          <span className="text-[11px] text-rose-600">Grade &lt; 40%</span>
        </div>
      </div>

      {/* Marksheet Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>
              {currentAssessment
                ? `${currentAssessment.moduleCode}: ${currentAssessment.title}`
                : "Assessment Marksheet"}
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Results marked 'Withheld' will remain hidden from the student portal until published by Registry.
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
              <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              Withhold All
            </Button>
            <Button
              size="sm"
              variant="success"
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
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Submission Status</th>
                <th className="py-3 px-4">Submitted File</th>
                <th className="py-3 px-4 w-32">Numeric Mark (0–100)</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 min-w-[200px]">Marker Feedback</th>
                <th className="py-3 px-4 text-center">Publication Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {students.map((student) => {
                const sub = currentAssessment?.submissions?.find(
                  (s: any) => s.studentId === student.id
                );
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
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        {student.studentId}
                      </div>
                    </td>

                    {/* Submission status & Late flag */}
                    <td className="py-3.5 px-4">
                      {sub ? (
                        sub.isLate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            Late (v{sub.version})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle className="w-3 h-3" />
                            On-Time (v{sub.version})
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">
                          Not Submitted
                        </span>
                      )}
                    </td>

                    {/* Submitted file download */}
                    <td className="py-3.5 px-4">
                      {sub ? (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold"
                        >
                          <Download className="w-3 h-3" />
                          <span className="max-w-[120px] truncate">
                            {sub.fileName}
                          </span>
                        </a>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Numeric Grade Input */}
                    <td className="py-3.5 px-4">
                      <div className="relative">
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
                          className="w-24 px-2.5 py-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center"
                        />
                        <span className="text-xs text-zinc-400 ml-1">/100</span>
                      </div>
                    </td>

                    {/* Computed Classification */}
                    <td className="py-3.5 px-4">
                      {row.numericGrade !== "" ? (
                        <Badge
                          className={getClassificationBadgeColor(
                            row.classification as any
                          )}
                        >
                          {row.classification}
                        </Badge>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">Ungraded</span>
                      )}
                    </td>

                    {/* Marker feedback input */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        placeholder="Add constructive qualitative feedback..."
                        value={row.feedback}
                        onChange={(e) =>
                          handleFeedbackChange(student.id, e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Publication Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(student.id)}
                        disabled={row.numericGrade === ""}
                        title={
                          row.isPublished
                            ? "Click to withhold this student's result"
                            : "Click to publish this student's result to their portal"
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          row.isPublished
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
                            : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
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

                    {/* Save Grade Button */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={row.isSaved ? "outline" : "primary"}
                        onClick={() => handleSaveGrade(student.id)}
                        isLoading={row.isSaving}
                        disabled={row.numericGrade === ""}
                        className="text-xs h-7 py-0 px-2.5"
                      >
                        {row.isSaved ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-600 mr-1" />
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
      </Card>
    </div>
  );
}
