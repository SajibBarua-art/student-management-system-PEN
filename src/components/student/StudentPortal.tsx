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
  getStatusBadgeColor,
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

  // Fetch full student record and assessments
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
      }, 1800);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <p className="text-zinc-500 text-sm">Loading Student Self-Service Portal...</p>
      </div>
    );
  }

  // Published grades only for this student
  const publishedGrades = student.grades?.filter((g: any) => g.isPublished) || [];
  const withheldGradesCount = (student.grades?.length || 0) - publishedGrades.length;

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {student.fullName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-100 font-semibold">
                  {student.studentId}
                </span>
                <Badge className={getStatusBadgeColor(student.status)}>
                  {student.status}
                </Badge>
              </div>
              <p className="text-sm text-indigo-200 mt-1">
                {student.programme?.name} ({student.programme?.code}) • Academic Year:{" "}
                {student.academicYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-right">
              <span className="text-[11px] text-indigo-200 block">
                Tuition Balance
              </span>
              <span
                className={`text-lg font-bold block ${
                  student.balance > 0 ? "text-amber-300" : "text-emerald-300"
                }`}
              >
                {formatCurrency(student.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("assessments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "assessments"
                ? "bg-white text-indigo-950 shadow-md"
                : "text-indigo-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>My Assessments & Submissions</span>
          </button>

          <button
            onClick={() => setActiveTab("marksheet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "marksheet"
                ? "bg-white text-indigo-950 shadow-md"
                : "text-indigo-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Marksheet ({publishedGrades.length} Published)</span>
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "finance"
                ? "bg-white text-indigo-950 shadow-md"
                : "text-indigo-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fees & Finance Ledger</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Assessments & Submissions */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Coursework Submissions
              </h3>
              <p className="text-xs text-zinc-500">
                Upload your assignments in PDF or DOCX format. Resubmissions are allowed before the official deadline.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchStudentData}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
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
                  className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                        {asm.moduleCode}
                      </span>
                      {pastDeadline ? (
                        <Badge variant="secondary">Deadline Passed</Badge>
                      ) : (
                        <Badge variant="success">Open for Submission</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{asm.title}</CardTitle>
                    <p className="text-xs text-zinc-500">{asm.moduleName}</p>
                  </CardHeader>

                  <CardContent className="py-2 text-xs space-y-3">
                    {asm.description && (
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {asm.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span>Deadline: {formatDateTime(asm.deadline)}</span>
                    </div>

                    {/* Submission status for this student */}
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50">
                      {mySubmission ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Submission Received
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              Version {mySubmission.version}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span className="font-mono truncate max-w-[200px]">
                              {mySubmission.fileName}
                            </span>
                            {mySubmission.isLate && (
                              <Badge variant="danger" className="text-[10px]">
                                Submitted Late
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Uploaded on: {formatDateTime(mySubmission.submittedAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-zinc-500 italic flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-zinc-400" />
                          <span>No submission uploaded yet</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {mySubmission ? (
                      <>
                        <a
                          href={mySubmission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download My File
                        </a>

                        {/* Resubmission logic: allowed before deadline */}
                        {!pastDeadline ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenUploadModal(asm)}
                            className="text-xs"
                          >
                            <UploadCloud className="w-3.5 h-3.5 mr-1" />
                            Resubmit File
                          </Button>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">
                            Resubmission closed
                          </span>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenUploadModal(asm)}
                        className="w-full text-xs"
                      >
                        <UploadCloud className="w-4 h-4 mr-1.5" />
                        Upload Submission (PDF / DOCX)
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
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Official Academic Marksheet
              </h3>
              <p className="text-xs text-zinc-500">
                Verified grades published by the Registry Examination Board.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Registry Verified
            </span>
          </div>

          {/* If there are withheld results */}
          {withheldGradesCount > 0 && (
            <Alert variant="info" title="Examination Board Moderation in Progress">
              {withheldGradesCount} assessment result(s) are currently undergoing external moderation and will be made visible once formally published by the Registry.
            </Alert>
          )}

          {publishedGrades.length === 0 ? (
            <Card className="p-12 text-center text-zinc-500">
              <Lock className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
              <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                No Results Published Yet
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Your submitted assessments are being evaluated. As soon as a Registry administrator publishes your grade, it will appear here.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Module Code</th>
                      <th className="py-3 px-4">Assessment Title</th>
                      <th className="py-3 px-4">Numeric Score</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Tutor Feedback</th>
                      <th className="py-3 px-4 text-right">Published Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {publishedGrades.map((grade: any) => (
                      <tr
                        key={grade.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {grade.assessment?.moduleCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {grade.assessment?.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                            {grade.numericGrade}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            className={getClassificationBadgeColor(
                              grade.classification
                            )}
                          >
                            {getClassificationLabel(grade.classification)}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 italic max-w-xs">
                          {grade.feedback || "Satisfactory academic performance."}
                        </td>
                        <td className="py-3.5 px-4 text-right text-zinc-500 font-mono text-xs">
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
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              My Student Ledger & Fees
            </h3>
            <p className="text-xs text-zinc-500">
              Overview of programme tuition charges, recorded payments, and outstanding liability.
            </p>
          </div>

          {/* Overdue Banner if applicable */}
          {student.isOverdue && (
            <Alert
              variant="danger"
              title="Tuition Balance Overdue"
            >
              You have an outstanding balance of {formatCurrency(student.balance)} that is past the scheduled due date. Please contact the Registry Finance Desk.
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-zinc-50/60 dark:bg-zinc-800/40">
              <span className="text-xs text-zinc-500 uppercase font-semibold block">
                Total Fees Assigned
              </span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 block">
                {formatCurrency(student.totalFees)}
              </span>
            </Card>
            <Card className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 uppercase font-semibold block">
                Total Payments Made
              </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                {formatCurrency(student.totalPaid)}
              </span>
            </Card>
            <Card className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
              <span className="text-xs text-rose-800 dark:text-rose-300 uppercase font-semibold block">
                Outstanding Balance
              </span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">
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
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Transaction Reference</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Notes</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {student.payments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    student.payments?.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {p.referenceNumber}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-2.5 px-4">{p.paymentMethod}</td>
                        <td className="py-2.5 px-4 text-zinc-500 italic">
                          {p.notes || "Tuition fee settlement"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
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
            ? `Submit: ${activeAssessmentForUpload.title}`
            : "Upload Assessment Submission"
        }
        description="Select and submit your coursework file. Strictly restricted to PDF (.pdf) or Word document (.docx, .doc)."
        maxWidth="md"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {activeAssessmentForUpload && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                {activeAssessmentForUpload.moduleCode} —{" "}
                {activeAssessmentForUpload.moduleName}
              </span>
              <span className="text-zinc-500 block">
                Submission Deadline:{" "}
                {formatDateTime(activeAssessmentForUpload.deadline)}
              </span>
              {isPastDate(activeAssessmentForUpload.deadline) && (
                <div className="text-amber-600 font-semibold pt-1">
                  ⚠️ Note: Deadline has passed. Your submission will be recorded and visually flagged as LATE.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select File (PDF or DOCX only) *
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
              className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-[11px] text-zinc-500 mt-1">
                Selected: <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Submission Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Final draft including appendix and references"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUploading}>
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Submit Assessment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
