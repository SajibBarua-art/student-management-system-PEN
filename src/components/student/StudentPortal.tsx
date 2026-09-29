"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  CreditCard,
  FileCheck,
  Award,
  UploadCloud,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  AlertCircle,
  Calendar,
  RefreshCw,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  isPastDate,
} from "@/lib/formatters";
import {
  getClassificationBadgeColor,
  getClassificationLabel,
} from "@/lib/grade-classification";

interface StudentPortalProps {
  studentId: string;
}

export function StudentPortal({ studentId }: StudentPortalProps) {
  const [student, setStudent] = useState<any | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"finance" | "assessments" | "marksheet">("assessments");
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeAssessmentForUpload, setActiveAssessmentForUpload] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const [resStu, resAsm] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch("/api/assessments"),
      ]);
      const dataStu = await resStu.json();
      const dataAsm = await resAsm.json();

      if (dataStu.success) {
        setStudent(dataStu.data);
      }
      if (dataAsm.success) {
        setAssessments(dataAsm.data);
      }
    } catch (err) {
      console.error("Failed to load student portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const handleOpenUploadModal = (asm: any) => {
    setActiveAssessmentForUpload(asm);
    setSelectedFile(null);
    setUploadNotes("");
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeAssessmentForUpload) {
      setUploadError("Please select a valid PDF or DOCX file to submit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("studentId", student.id);
    formData.append("assessmentId", activeAssessmentForUpload.id);
    if (uploadNotes) formData.append("notes", uploadNotes);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setUploadSuccess(data.message);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        fetchStudentData();
      }, 1600);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Accessing Student Portal...</p>
      </div>
    );
  }

  const publishedGrades = student.grades?.filter((g: any) => g.isPublished) || [];
  const withheldGradesCount = (student.grades?.length || 0) - publishedGrades.length;

  return (
    <div className="space-y-6">
      {/* Student Identity Card / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-900 dark:via-slate-900 dark:to-[#0a0d18] text-slate-900 dark:text-white shadow-lg dark:shadow-2xl">
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
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {student.programme?.name} ({student.programme?.code}) • Academic Year:{" "}
                <span className="text-slate-900 dark:text-white font-semibold">{student.academicYear}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-200/80 dark:border-white/[0.08] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("assessments")}
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
            onClick={() => setActiveTab("marksheet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "marksheet"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Marksheet ({publishedGrades.length} Published)</span>
          </button>

          <button
            onClick={() => setActiveTab("finance")}
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

      {/* Tab 1: Coursework Submissions */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Coursework Assignments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload deliverables in PDF or DOCX format. Resubmissions are allowed until the official deadline.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchStudentData}>
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((asm) => {
              const mySubmission = student.submissions?.find(
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
                    <CardTitle className="text-base sm:text-lg mt-3 text-slate-900 dark:text-white">{asm.title}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{asm.moduleName}</p>
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
                            onClick={() => handleOpenUploadModal(asm)}
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
                        onClick={() => handleOpenUploadModal(asm)}
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
        </div>
      )}

      {/* Tab 2: Official Marksheet */}
      {activeTab === "marksheet" && (
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
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Registry Board Stamped
            </span>
          </div>

          {/* Withheld notice */}
          {withheldGradesCount > 0 && (
            <Alert variant="info" title="Examination Board Moderation Notice">
              {withheldGradesCount} assessment module(s) are undergoing external moderation by the Registry Board and will be made visible once published.
            </Alert>
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3.5 px-5">Module Code</th>
                      <th className="py-3.5 px-5">Assessment Title</th>
                      <th className="py-3.5 px-5">Numeric Grade</th>
                      <th className="py-3.5 px-5">Classification</th>
                      <th className="py-3.5 px-5">Feedback & Remarks</th>
                      <th className="py-3.5 px-5 text-right">Published Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {publishedGrades.map((grade: any) => (
                      <tr
                        key={grade.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-4 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {grade.assessment?.moduleCode}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Fees & Finance */}
      {activeTab === "finance" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              My Student Tuition Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of assigned programme tuition schedules, recorded receipts, and outstanding balance.
            </p>
          </div>

          {student.isOverdue && (
            <Alert
              variant="danger"
              title="Tuition Payment Overdue"
            >
              You have an outstanding balance of {formatCurrency(student.balance)} that is past the scheduled due date. Please arrange settlement with the Registry Finance Desk.
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-slate-200 dark:border-white/[0.08]">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">
                Total Fees Assigned
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">
                {formatCurrency(student.totalFees)}
              </span>
            </Card>
            <Card className="p-5 border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/15">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
                Total Payments Made
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1.5 block">
                {formatCurrency(student.totalPaid)}
              </span>
            </Card>
            <Card className="p-5 border-rose-200 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/15">
              <span className="text-xs text-rose-700 dark:text-rose-400 uppercase font-bold block">
                Outstanding Balance
              </span>
              <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1.5 block">
                {formatCurrency(student.balance)}
              </span>
            </Card>
          </div>

          {/* Transactions list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Receipts & History</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-5">Transaction Reference</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Method</th>
                    <th className="py-3.5 px-5">Notes</th>
                    <th className="py-3.5 px-5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {student.payments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No payment records registered yet.
                      </td>
                    </tr>
                  ) : (
                    student.payments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                        <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                          {p.referenceNumber}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline">{p.paymentMethod}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 italic">
                          {p.notes || "Tuition fee settlement"}
                        </td>
                        <td className="py-3.5 px-5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Submission File Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={
          activeAssessmentForUpload
            ? `Submit Deliverable: ${activeAssessmentForUpload.title}`
            : "Upload Assessment Submission"
        }
        description="Select and submit your coursework file. Restricted strictly to PDF (.pdf) or Word document (.docx, .doc)."
        maxWidth="md"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs rounded-xl">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {activeAssessmentForUpload && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                {activeAssessmentForUpload.moduleCode} —{" "}
                {activeAssessmentForUpload.moduleName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 block">
                Submission Deadline:{" "}
                {formatDateTime(activeAssessmentForUpload.deadline)}
              </span>
              {isPastDate(activeAssessmentForUpload.deadline) && (
                <div className="text-amber-600 dark:text-amber-400 font-bold pt-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Notice: Deadline passed. Submission will be accepted but visually flagged as LATE.</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document File (PDF or DOCX only) *
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                File: <strong className="text-slate-900 dark:text-white">{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Submission Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Final draft with citations and data appendix"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isUploading}>
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Upload & Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
