"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, InstitutionalPersona } from "@/components/layout/Navbar";
import { OverviewDashboard } from "@/components/staff/OverviewDashboard";
import { EnrolmentWorkflow } from "@/components/staff/EnrolmentWorkflow";
import { FeesPaymentsWorkflow } from "@/components/staff/FeesPaymentsWorkflow";
import { AssessmentsWorkflow } from "@/components/staff/AssessmentsWorkflow";
import { MarksheetWorkflow } from "@/components/staff/MarksheetWorkflow";
import { AuditTrailWorkflow } from "@/components/staff/AuditTrailWorkflow";
import { StudentPortal } from "@/components/student/StudentPortal";
import { StudentPersona } from "@/lib/server-data";

interface AppClientShellProps {
  initialRole: "staff" | "student";
  initialTab: string;
  initialPersona: InstitutionalPersona;
  initialStudentId: string | null;
  studentPersonas: StudentPersona[];
  initialStats?: any | null;
  initialStudents?: any[];
  initialProgrammes?: any[];
  initialAuditLogs?: any[];
  initialAssessments?: any[];
  initialPayments?: any[];
  initialStudentDetail?: any | null;
}

export function AppClientShell({
  initialRole,
  initialTab,
  initialPersona,
  initialStudentId,
  studentPersonas,
  initialStats,
  initialStudents = [],
  initialProgrammes = [],
  initialAuditLogs = [],
  initialAssessments = [],
  initialPayments = [],
  initialStudentDetail = null,
}: AppClientShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = React.useTransition();

  const [role, setRole] = useState<"staff" | "student">(initialRole);
  const [persona, setPersona] = useState<InstitutionalPersona>(initialPersona);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(
    initialStudentId || (studentPersonas.length > 0 ? studentPersonas[0].id : null)
  );

  // The active staff tab is driven by pending transition or server initialTab
  const activeStaffTab = pendingTab || initialTab;

  // Data states initialized from server-rendered SSR payloads
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [programmes, setProgrammes] = useState<any[]>(initialProgrammes);
  const [stats, setStats] = useState<any | null>(initialStats || null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal triggers
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedPayStudentId, setPreselectedPayStudentId] = useState<string | null>(null);
  const [gradingAssessmentId, setGradingAssessmentId] = useState<string | null>(null);

  // Clear pending tab once server render completes
  useEffect(() => {
    setPendingTab(null);
  }, [initialTab]);

  // Sync state if server route parameters change (e.g., via Next.js RSC navigation or Back/Forward)
  useEffect(() => {
    if (initialRole !== role) setRole(initialRole);
    if (initialPersona !== persona) setPersona(initialPersona);
    if (initialStudentId && initialStudentId !== activeStudentId) {
      setActiveStudentId(initialStudentId);
    }
  }, [initialRole, initialPersona, initialStudentId]);

  // Sync server data updates if passed from fresh server navigation
  useEffect(() => {
    if (initialStats) setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    if (initialStudents && initialStudents.length > 0) setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    if (initialProgrammes && initialProgrammes.length > 0) setProgrammes(initialProgrammes);
  }, [initialProgrammes]);

  // Update browser URL query parameters and notify Next.js router
  const updateUrl = useCallback(
    (
      newRole: "staff" | "student",
      newTab: string,
      newPersona: InstitutionalPersona,
      newStudentId: string | null
    ) => {
      const params = new URLSearchParams();
      if (newRole === "student") {
        params.set("role", "student");
        if (newStudentId) params.set("studentId", newStudentId);
      } else {
        if (newTab && newTab !== "overview") {
          params.set("tab", newTab);
        }
        if (newPersona && newPersona !== "REGISTRY_ADMIN") {
          params.set("persona", newPersona);
        }
      }
      const qs = params.toString();
      const targetUrl = qs ? `?${qs}` : "/";
      router.push(targetUrl, { scroll: false });
    },
    [router]
  );

  // Client-side on-demand refresh (invoked after mutations like enrolling student or recording payment)
  const refreshClientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resStats, resStudents, resProgrammes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/students"),
        fetch("/api/programmes"),
      ]);
      const dataStats = await resStats.json();
      const dataStudents = await resStudents.json();
      const dataProgrammes = await resProgrammes.json();

      if (dataStats.success) setStats(dataStats.data);
      if (dataStudents.success) setStudents(dataStudents.data);
      if (dataProgrammes.success) setProgrammes(dataProgrammes.data);
    } catch (err) {
      console.error("Failed to refresh client data:", err);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  }, [router]);

  // Tab change handler
  const handleStaffTabChange = (newTab: string) => {
    setPendingTab(newTab);
    startTransition(() => {
      updateUrl(role, newTab, persona, activeStudentId);
    });
  };

  // Student selection handler
  const handleStudentChange = (newStudentId: string) => {
    setActiveStudentId(newStudentId);
    startTransition(() => {
      updateUrl(role, activeStaffTab, persona, newStudentId);
    });
  };

  // Navigate to Marksheet with selected assessment
  const handleNavigateToGrading = (assessmentId: string) => {
    setGradingAssessmentId(assessmentId);
    setPendingTab("marksheet");
    startTransition(() => {
      updateUrl(role, "marksheet", persona, activeStudentId);
    });
  };

  // Open enrol modal for new student
  const handleOpenEnrolModal = () => {
    setPendingTab("enrolment");
    startTransition(() => {
      updateUrl(role, "enrolment", persona, activeStudentId);
    });
    setIsEnrolModalOpen(true);
  };

  // Open payment modal for specific student
  const handleOpenPaymentModal = (studentId?: string) => {
    if (studentId) {
      setPreselectedPayStudentId(studentId);
    } else {
      setPreselectedPayStudentId(null);
    }
    setPendingTab("fees");
    startTransition(() => {
      updateUrl(role, "fees", persona, activeStudentId);
    });
    setIsPaymentModalOpen(true);
  };

  // Persona Change Handler (RBAC)
  const handlePersonaChange = (newPersona: InstitutionalPersona) => {
    setPersona(newPersona);
    let nextRole: "staff" | "student" = role;
    let nextTab = activeStaffTab;

    if (newPersona === "STUDENT") {
      nextRole = "student";
      setRole("student");
    } else {
      nextRole = "staff";
      setRole("staff");
      if (
        newPersona === "MODULE_LEADER" &&
        (activeStaffTab === "fees" || activeStaffTab === "enrolment")
      ) {
        nextTab = "assessments";
        setPendingTab("assessments");
      } else if (
        newPersona === "BURSAR_FINANCE" &&
        (activeStaffTab === "assessments" || activeStaffTab === "marksheet")
      ) {
        nextTab = "fees";
        setPendingTab("fees");
      }
    }
    startTransition(() => {
      updateUrl(nextRole, nextTab, newPersona, activeStudentId);
    });
  };

  const handleRoleChange = (newRole: "staff" | "student") => {
    setRole(newRole);
    let nextPersona = persona;
    if (newRole === "student") {
      nextPersona = "STUDENT";
      setPersona("STUDENT");
    } else {
      if (persona === "STUDENT") {
        nextPersona = "REGISTRY_ADMIN";
        setPersona("REGISTRY_ADMIN");
      }
    }
    startTransition(() => {
      updateUrl(newRole, activeStaffTab, nextPersona, activeStudentId);
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Transition Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 z-50 animate-pulse" />
      )}

      {/* Top Navigation Bar with Persona & Role Switcher */}
      <Navbar
        role={role}
        onRoleChange={handleRoleChange}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        students={studentPersonas}
        activeStudentId={activeStudentId}
        onStudentChange={handleStudentChange}
        activeStaffTab={activeStaffTab}
        onStaffTabChange={handleStaffTabChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 sm:py-6">
        {role === "staff" ? (
          <div>
            {initialTab === "overview" && (
              <OverviewDashboard
                stats={stats}
                persona={persona}
                onNavigateTab={handleStaffTabChange}
                onOpenEnrolModal={handleOpenEnrolModal}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            )}

            {initialTab === "enrolment" && (
              <EnrolmentWorkflow
                students={initialStudents.length > 0 ? initialStudents : students}
                programmes={initialProgrammes.length > 0 ? initialProgrammes : programmes}
                isLoading={isLoading}
                onRefresh={refreshClientData}
                onOpenPaymentModal={handleOpenPaymentModal}
                isEnrolModalOpen={isEnrolModalOpen}
                setIsEnrolModalOpen={setIsEnrolModalOpen}
              />
            )}

            {initialTab === "fees" && (
              <FeesPaymentsWorkflow
                students={initialStudents.length > 0 ? initialStudents : students}
                onRefresh={refreshClientData}
                isPaymentModalOpen={isPaymentModalOpen}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                preselectedStudentId={preselectedPayStudentId}
                initialPayments={initialPayments}
              />
            )}

            {initialTab === "assessments" && (
              <AssessmentsWorkflow
                programmes={initialProgrammes.length > 0 ? initialProgrammes : programmes}
                onNavigateToGrading={handleNavigateToGrading}
                initialAssessments={initialAssessments}
              />
            )}

            {initialTab === "marksheet" && (
              <MarksheetWorkflow
                initialAssessmentId={gradingAssessmentId}
                onRefreshGlobalStats={refreshClientData}
                initialAssessments={initialAssessments}
                initialStudents={initialStudents.length > 0 ? initialStudents : students}
              />
            )}

            {initialTab === "audit" && (
              <AuditTrailWorkflow initialLogs={initialAuditLogs} />
            )}
          </div>
        ) : (
          <div>
            {activeStudentId ? (
              <StudentPortal
                studentId={activeStudentId}
                initialStudent={initialStudentDetail}
                initialAssessments={initialAssessments}
              />
            ) : (
              <div className="py-20 text-center text-zinc-500">
                <p>No active students found in the registry.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-[#0b0e17]/80 backdrop-blur-xl py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">RegistryOS</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>PEN Global Higher Education Management</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Next.js 16 (App Router SSR)</span>
            <span>•</span>
            <span>PostgreSQL 18</span>
            <span>•</span>
            <span>Prisma ORM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
