"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfficialTranscriptModal } from "@/components/documents/OfficialTranscriptModal";
import { FeeReceiptModal } from "@/components/documents/FeeReceiptModal";
import { StudentHeroHeader } from "./StudentHeroHeader";
import { StudentDeliverablesTab } from "./StudentDeliverablesTab";
import { StudentMarksheetTab } from "./StudentMarksheetTab";
import { StudentFinanceTab } from "./StudentFinanceTab";
import { StudentUploadModal } from "./StudentUploadModal";
import { StudentEcClaimModal } from "./StudentEcClaimModal";
import { calculateAcademicStanding } from "@/lib/academic-engine";
import { isPastDate } from "@/lib/formatters";
import {
  API_ROUTES,
  FILTER_ALL,
  PAGINATION,
  ASSESSMENT_STATUS_FILTERS,
  FEE_CATEGORY_FILTERS,
  FEE_TYPES,
  EC_REASONS,
} from "@/constants";

interface StudentPortalProps {
  studentId: string;
  initialStudent?: any | null;
  initialAssessments?: any[];
}

export function StudentPortal({
  studentId,
  initialStudent = null,
  initialAssessments = [],
}: StudentPortalProps) {
  // 1. Core Portal States
  const [student, setStudent] = useState<any | null>(initialStudent);
  const [assessments, setAssessments] = useState<any[]>(initialAssessments);
  const [activeTab, setActiveTab] = useState<"finance" | "assessments" | "marksheet">("assessments");
  const [isLoading, setIsLoading] = useState(!initialStudent);
  const [portalError, setPortalError] = useState<string | null>(null);

  // 2. Tab 1 Deliverables Filter & Pagination States
  const [assessmentSearchTerm, setAssessmentSearchTerm] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState<string>(FILTER_ALL);
  const [assessmentsPage, setAssessmentsPage] = useState(1);
  const [assessmentsPageSize, setAssessmentsPageSize] = useState<number>(PAGINATION.CARD_PAGE_SIZE);

  // 3. Tab 2 Marksheet Filter & Pagination States
  const [gradesSearchTerm, setGradesSearchTerm] = useState("");
  const [gradesClassificationFilter, setGradesClassificationFilter] = useState<string>(FILTER_ALL);
  const [gradesPage, setGradesPage] = useState(1);
  const [gradesPageSize, setGradesPageSize] = useState<number>(PAGINATION.COMPACT_PAGE_SIZE);

  // 4. Tab 3 Fees & Ledger Filter & Pagination States
  const [feesSearchTerm, setFeesSearchTerm] = useState("");
  const [feesCategoryFilter, setFeesCategoryFilter] = useState<string>(FILTER_ALL);
  const [feesPage, setFeesPage] = useState(1);
  const [feesPageSize, setFeesPageSize] = useState<number>(PAGINATION.COMPACT_PAGE_SIZE);

  // 5. Tab 3 Payment Receipts Filter & Pagination States
  const [paymentsSearchTerm, setPaymentsSearchTerm] = useState("");
  const [paymentsMethodFilter, setPaymentsMethodFilter] = useState<string>(FILTER_ALL);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPageSize, setPaymentsPageSize] = useState<number>(PAGINATION.COMPACT_PAGE_SIZE);

  // 6. Modal Dialog States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeAssessmentForUpload, setActiveAssessmentForUpload] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any | null>(null);

  const [isEcModalOpen, setIsEcModalOpen] = useState(false);
  const [activeAssessmentForEc, setActiveAssessmentForEc] = useState<any | null>(null);
  const [ecReason, setEcReason] = useState<string>(EC_REASONS.MEDICAL);
  const [ecExplanation, setEcExplanation] = useState<string>("");
  const [ecDays, setEcDays] = useState<string>("7");
  const [isSubmittingEc, setIsSubmittingEc] = useState(false);
  const [ecError, setEcError] = useState<string | null>(null);
  const [ecSuccess, setEcSuccess] = useState<string | null>(null);

  // 7. Lifecycle & Filter Reset Effects
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncSubtab = () => {
      const p = new URLSearchParams(window.location.search);
      const sub = p.get("subtab");
      if (sub === "finance" || sub === "assessments" || sub === "marksheet") {
        setActiveTab(sub);
      }
    };
    syncSubtab();
    window.addEventListener("popstate", syncSubtab);
    return () => window.removeEventListener("popstate", syncSubtab);
  }, []);

  useEffect(() => {
    setAssessmentsPage(1);
  }, [assessmentSearchTerm, assessmentStatusFilter]);

  useEffect(() => {
    setGradesPage(1);
  }, [gradesSearchTerm, gradesClassificationFilter]);

  useEffect(() => {
    setFeesPage(1);
  }, [feesSearchTerm, feesCategoryFilter]);

  useEffect(() => {
    setPaymentsPage(1);
  }, [paymentsSearchTerm, paymentsMethodFilter]);

  const handleTabChange = (newTab: "finance" | "assessments" | "marksheet") => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      p.set("subtab", newTab);
      window.history.pushState(null, "", `?${p.toString()}`);
    }
  };

  const handleOpenEcModal = (asm: any) => {
    setActiveAssessmentForEc(asm);
    const existing = student?.extenuatingCircumstances?.find((ec: any) => ec.assessmentId === asm.id);
    if (existing) {
      setEcReason(existing.reason);
      setEcExplanation(existing.explanation);
      setEcDays(existing.requestedExtensionDays.toString());
    } else {
      setEcReason(EC_REASONS.MEDICAL);
      setEcExplanation("");
      setEcDays("7");
    }
    setEcError(null);
    setEcSuccess(null);
    setIsEcModalOpen(true);
  };

  const handleSubmitEc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentForEc || !ecExplanation.trim()) {
      setEcError("Please provide an explanation for your extenuating circumstances.");
      return;
    }

    setIsSubmittingEc(true);
    setEcError(null);
    setEcSuccess(null);

    try {
      const res = await fetch(API_ROUTES.EXTENUATING_CIRCUMSTANCES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          assessmentId: activeAssessmentForEc.id,
          reason: ecReason,
          explanation: ecExplanation,
          requestedExtensionDays: parseInt(ecDays, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit EC claim");
      }

      setEcSuccess(data.message);
      fetchStudentData();
      setTimeout(() => {
        setIsEcModalOpen(false);
        setEcSuccess(null);
      }, 1500);
    } catch (err: any) {
      setEcError(err.message);
    } finally {
      setIsSubmittingEc(false);
    }
  };

  const fetchStudentData = async () => {
    setIsLoading(true);
    setPortalError(null);
    try {
      const [resStu, resAsm] = await Promise.all([
        fetch(`${API_ROUTES.STUDENTS}/${studentId}`),
        fetch(API_ROUTES.ASSESSMENTS),
      ]);
      const dataStu = await resStu.json();
      const dataAsm = await resAsm.json();

      if (dataStu.success) {
        setStudent(dataStu.data);
      } else {
        setPortalError(
          dataStu.error || "Unable to access student candidate record."
        );
      }
      if (dataAsm.success) {
        setAssessments(dataAsm.data);
      }
    } catch (err: any) {
      console.error("Failed to load student portal data:", err);
      setPortalError(err.message || "Network error loading student portal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialStudent && initialStudent.id === studentId) {
      setStudent(initialStudent);
      if (initialAssessments && initialAssessments.length > 0) {
        setAssessments(initialAssessments);
      }
      setIsLoading(false);
      return;
    }
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId, initialStudent, initialAssessments]);

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
      const res = await fetch(API_ROUTES.SUBMISSIONS, {
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

  // 8. Derived Calculations
  const filteredAssessments = assessments.filter((asm) => {
    const matchesSearch =
      assessmentSearchTerm === "" ||
      asm.title?.toLowerCase().includes(assessmentSearchTerm.toLowerCase()) ||
      asm.moduleCode?.toLowerCase().includes(assessmentSearchTerm.toLowerCase()) ||
      asm.moduleName?.toLowerCase().includes(assessmentSearchTerm.toLowerCase());

    const mySubmission = student?.submissions?.find((s: any) => s.assessmentId === asm.id);
    const pastDeadline = isPastDate(asm.deadline);

    let matchesStatus = true;
    if (assessmentStatusFilter === ASSESSMENT_STATUS_FILTERS.OPEN) {
      matchesStatus = !pastDeadline;
    } else if (assessmentStatusFilter === ASSESSMENT_STATUS_FILTERS.PASSED) {
      matchesStatus = pastDeadline;
    } else if (assessmentStatusFilter === ASSESSMENT_STATUS_FILTERS.SUBMITTED) {
      matchesStatus = !!mySubmission;
    } else if (assessmentStatusFilter === ASSESSMENT_STATUS_FILTERS.PENDING) {
      matchesStatus = !mySubmission;
    }

    return matchesSearch && matchesStatus;
  });

  const paginatedAssessments = filteredAssessments.slice(
    (assessmentsPage - 1) * assessmentsPageSize,
    assessmentsPage * assessmentsPageSize
  );

  const publishedGrades = student?.grades?.filter((g: any) => g.isPublished) || [];
  const withheldGradesCount = (student?.grades?.length || 0) - publishedGrades.length;
  const academicStanding = student?.academicStanding || calculateAcademicStanding(student?.grades || [], true);

  const filteredGrades = publishedGrades.filter((g: any) => {
    const matchesSearch =
      gradesSearchTerm === "" ||
      g.assessment?.moduleCode?.toLowerCase().includes(gradesSearchTerm.toLowerCase()) ||
      g.assessment?.title?.toLowerCase().includes(gradesSearchTerm.toLowerCase()) ||
      (g.feedback && g.feedback.toLowerCase().includes(gradesSearchTerm.toLowerCase()));

    const matchesClass =
      gradesClassificationFilter === FILTER_ALL || g.classification === gradesClassificationFilter;

    return matchesSearch && matchesClass;
  });

  const paginatedGrades = filteredGrades.slice(
    (gradesPage - 1) * gradesPageSize,
    gradesPage * gradesPageSize
  );

  const studentFees = student?.fees || [];
  const filteredFees = studentFees.filter((fee: any) => {
    const matchesSearch =
      feesSearchTerm === "" ||
      fee.description?.toLowerCase().includes(feesSearchTerm.toLowerCase());

    const matchesCategory =
      feesCategoryFilter === FILTER_ALL ||
      (feesCategoryFilter === FEE_CATEGORY_FILTERS.SCHOLARSHIP && fee.amount < 0) ||
      (feesCategoryFilter === FEE_CATEGORY_FILTERS.INSTALMENT && fee.feeType === FEE_TYPES.INSTALMENT_TRANCHE) ||
      (feesCategoryFilter === FEE_CATEGORY_FILTERS.TUITION && fee.amount >= 0 && fee.feeType !== FEE_TYPES.INSTALMENT_TRANCHE);

    return matchesSearch && matchesCategory;
  });

  const paginatedFees = filteredFees.slice(
    (feesPage - 1) * feesPageSize,
    feesPage * feesPageSize
  );

  const studentPayments = student?.payments || [];
  const filteredPayments = studentPayments.filter((p: any) => {
    const matchesSearch =
      paymentsSearchTerm === "" ||
      p.referenceNumber?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(paymentsSearchTerm.toLowerCase()));

    const matchesMethod =
      paymentsMethodFilter === FILTER_ALL || p.paymentMethod === paymentsMethodFilter;

    return matchesSearch && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (paymentsPage - 1) * paymentsPageSize,
    paymentsPage * paymentsPageSize
  );

  // 9. Loading & Error Render Guards
  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Accessing Student Portal...</p>
      </div>
    );
  }

  if (portalError || !student) {
    return (
      <div className="py-16 text-center max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Unable to Access Student Record
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
          {portalError ||
            "The selected candidate profile could not be found or retrieved from the registry database."}
        </p>
        <Button variant="gradient" size="sm" onClick={fetchStudentData}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry Access
        </Button>
      </div>
    );
  }

  // 10. Main Component Render
  return (
    <div className="space-y-6">
      {/* Hero Header & Tab Bar */}
      <StudentHeroHeader
        student={student}
        academicStanding={academicStanding}
        publishedGradesCount={publishedGrades.length}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab 1: Coursework Submissions */}
      {activeTab === "assessments" && (
        <StudentDeliverablesTab
          student={student}
          assessments={assessments}
          searchTerm={assessmentSearchTerm}
          onSearchTermChange={setAssessmentSearchTerm}
          statusFilter={assessmentStatusFilter}
          onStatusFilterChange={setAssessmentStatusFilter}
          currentPage={assessmentsPage}
          pageSize={assessmentsPageSize}
          onPageChange={setAssessmentsPage}
          onPageSizeChange={setAssessmentsPageSize}
          paginatedAssessments={paginatedAssessments}
          totalFilteredCount={filteredAssessments.length}
          onRefresh={fetchStudentData}
          onOpenUploadModal={handleOpenUploadModal}
          onOpenEcModal={handleOpenEcModal}
        />
      )}

      {/* Tab 2: Official Marksheet */}
      {activeTab === "marksheet" && (
        <StudentMarksheetTab
          publishedGrades={publishedGrades}
          withheldGradesCount={withheldGradesCount}
          academicStanding={academicStanding}
          searchTerm={gradesSearchTerm}
          onSearchTermChange={setGradesSearchTerm}
          classificationFilter={gradesClassificationFilter}
          onClassificationFilterChange={setGradesClassificationFilter}
          currentPage={gradesPage}
          pageSize={gradesPageSize}
          onPageChange={setGradesPage}
          onPageSizeChange={setGradesPageSize}
          paginatedGrades={paginatedGrades}
          totalFilteredCount={filteredGrades.length}
          onOpenTranscriptModal={() => setIsTranscriptModalOpen(true)}
        />
      )}

      {/* Tab 3: Fees & Finance */}
      {activeTab === "finance" && (
        <StudentFinanceTab
          student={student}
          feesSearchTerm={feesSearchTerm}
          onFeesSearchTermChange={setFeesSearchTerm}
          feesCategoryFilter={feesCategoryFilter}
          onFeesCategoryFilterChange={setFeesCategoryFilter}
          feesPage={feesPage}
          feesPageSize={feesPageSize}
          onFeesPageChange={setFeesPage}
          onFeesPageSizeChange={setFeesPageSize}
          paginatedFees={paginatedFees}
          totalFilteredFeesCount={filteredFees.length}
          paymentsSearchTerm={paymentsSearchTerm}
          onPaymentsSearchTermChange={setPaymentsSearchTerm}
          paymentsMethodFilter={paymentsMethodFilter}
          onPaymentsMethodFilterChange={setPaymentsMethodFilter}
          paymentsPage={paymentsPage}
          paymentsPageSize={paymentsPageSize}
          onPaymentsPageChange={setPaymentsPage}
          onPaymentsPageSizeChange={setPaymentsPageSize}
          paginatedPayments={paginatedPayments}
          totalFilteredPaymentsCount={filteredPayments.length}
          onSelectPaymentForReceipt={(payment) => {
            setSelectedPaymentForReceipt({
              ...payment,
              reference: payment.referenceNumber,
            });
            setIsReceiptModalOpen(true);
          }}
        />
      )}

      {/* Modal: Coursework Submission File Upload */}
      <StudentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        activeAssessment={activeAssessmentForUpload}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        notes={uploadNotes}
        onNotesChange={setUploadNotes}
        isUploading={isUploading}
        error={uploadError}
        success={uploadSuccess}
        onSubmit={handleFileUpload}
      />

      {/* Modal: Extenuating Circumstances (EC) Claim */}
      <StudentEcClaimModal
        isOpen={isEcModalOpen}
        onClose={() => setIsEcModalOpen(false)}
        activeAssessment={activeAssessmentForEc}
        reason={ecReason}
        onReasonChange={setEcReason}
        days={ecDays}
        onDaysChange={setEcDays}
        explanation={ecExplanation}
        onExplanationChange={setEcExplanation}
        isSubmitting={isSubmittingEc}
        error={ecError}
        success={ecSuccess}
        onSubmit={handleSubmitEc}
      />

      {/* Modal: Official Academic Transcript */}
      <OfficialTranscriptModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        student={student}
        academicStanding={academicStanding}
      />

      {/* Modal: Official Fee Payment Receipt */}
      <FeeReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPaymentForReceipt}
        student={student}
      />
    </div>
  );
}
