"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar, InstitutionalPersona } from "@/components/layout/Navbar";
import { OverviewDashboard } from "@/components/staff/OverviewDashboard";
import { EnrolmentWorkflow } from "@/components/staff/EnrolmentWorkflow";
import { FeesPaymentsWorkflow } from "@/components/staff/FeesPaymentsWorkflow";
import { AssessmentsWorkflow } from "@/components/staff/AssessmentsWorkflow";
import { MarksheetWorkflow } from "@/components/staff/MarksheetWorkflow";
import { AuditTrailWorkflow } from "@/components/staff/AuditTrailWorkflow";
import { StudentPortal } from "@/components/student/StudentPortal";

export default function Home() {
  // Use consistent SSR-safe initial state to prevent React hydration mismatch
  const [role, setRole] = useState<"staff" | "student">("staff");
  const [persona, setPersona] = useState<InstitutionalPersona>("REGISTRY_ADMIN");
  const [activeStaffTab, setActiveStaffTab] = useState<string>("overview");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Global data states
  const [students, setStudents] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal triggers from Overview or other workflows
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedPayStudentId, setPreselectedPayStudentId] = useState<string | null>(null);
  const [gradingAssessmentId, setGradingAssessmentId] = useState<string | null>(null);

  // Synchronize browser URL bar and history without full page reload
  const updateUrl = useCallback(
    (
      newRole: "staff" | "student",
      newTab: string,
      newPersona: InstitutionalPersona,
      newStudentId: string | null
    ) => {
      if (typeof window === "undefined") return;
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
      const targetUrl = qs ? `?${qs}` : window.location.pathname;
      if (window.location.search !== (qs ? `?${qs}` : "")) {
        window.history.pushState(null, "", targetUrl);
      }
    },
    []
  );

  // Synchronize state when browser Back / Forward buttons are clicked
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const p = new URLSearchParams(window.location.search);
      const urlRole = p.get("role");
      const urlTab = p.get("tab");
      const urlPersona = p.get("persona");
      const urlStudentId = p.get("studentId");

      if (urlRole === "student") {
        setRole("student");
        setPersona("STUDENT");
      } else {
        setRole("staff");
      }

      if (
        urlTab &&
        ["overview", "enrolment", "fees", "assessments", "marksheet", "audit"].includes(
          urlTab
        )
      ) {
        setActiveStaffTab(urlTab);
      } else if (!urlTab && urlRole !== "student") {
        setActiveStaffTab("overview");
      }

      if (
        urlPersona &&
        ["REGISTRY_ADMIN", "MODULE_LEADER", "BURSAR_FINANCE", "STUDENT"].includes(
          urlPersona
        )
      ) {
        setPersona(urlPersona as InstitutionalPersona);
      }

      if (urlStudentId) {
        setActiveStudentId(urlStudentId);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Load all foundational data
  const fetchData = useCallback(async () => {
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
      if (dataStudents.success) {
        setStudents(dataStudents.data);
        if (dataStudents.data.length > 0) {
          setActiveStudentId((prev) => {
            const urlStudentId =
              typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("studentId")
                : null;
            const targetId = prev || urlStudentId;
            if (targetId) {
              const matched = dataStudents.data.find(
                (s: any) => s.id === targetId || s.studentId === targetId
              );
              if (matched) return matched.id;
            }
            return dataStudents.data[0].id;
          });
        }
      }
      if (dataProgrammes.success) setProgrammes(dataProgrammes.data);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab change handler
  const handleStaffTabChange = (newTab: string) => {
    setActiveStaffTab(newTab);
    updateUrl(role, newTab, persona, activeStudentId);
  };

  // Student selection handler
  const handleStudentChange = (newStudentId: string) => {
    setActiveStudentId(newStudentId);
    updateUrl(role, activeStaffTab, persona, newStudentId);
  };

  // Navigate to Marksheet with selected assessment
  const handleNavigateToGrading = (assessmentId: string) => {
    setGradingAssessmentId(assessmentId);
    setActiveStaffTab("marksheet");
    updateUrl(role, "marksheet", persona, activeStudentId);
  };

  // Open enrol modal for new student
  const handleOpenEnrolModal = () => {
    setActiveStaffTab("enrolment");
    updateUrl(role, "enrolment", persona, activeStudentId);
    setIsEnrolModalOpen(true);
  };

  // Open payment modal for specific student
  const handleOpenPaymentModal = (studentId?: string) => {
    if (studentId) {
      setPreselectedPayStudentId(studentId);
    } else {
      setPreselectedPayStudentId(null);
    }
    setActiveStaffTab("fees");
    updateUrl(role, "fees", persona, activeStudentId);
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
        setActiveStaffTab("assessments");
      } else if (
        newPersona === "BURSAR_FINANCE" &&
        (activeStaffTab === "assessments" || activeStaffTab === "marksheet")
      ) {
        nextTab = "fees";
        setActiveStaffTab("fees");
      }
    }
    updateUrl(nextRole, nextTab, newPersona, activeStudentId);
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
    updateUrl(newRole, activeStaffTab, nextPersona, activeStudentId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Navbar
        role={role}
        onRoleChange={handleRoleChange}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        students={students}
        activeStudentId={activeStudentId}
        onStudentChange={handleStudentChange}
        activeStaffTab={activeStaffTab}
        onStaffTabChange={handleStaffTabChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 sm:py-6">
        {role === "staff" ? (
          <div>
            {activeStaffTab === "overview" && (
              <OverviewDashboard
                stats={stats}
                persona={persona}
                onNavigateTab={handleStaffTabChange}
                onOpenEnrolModal={handleOpenEnrolModal}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            )}

            {activeStaffTab === "enrolment" && (
              <EnrolmentWorkflow
                students={students}
                programmes={programmes}
                isLoading={isLoading}
                onRefresh={fetchData}
                onOpenPaymentModal={handleOpenPaymentModal}
                isEnrolModalOpen={isEnrolModalOpen}
                setIsEnrolModalOpen={setIsEnrolModalOpen}
              />
            )}

            {activeStaffTab === "fees" && (
              <FeesPaymentsWorkflow
                students={students}
                onRefresh={fetchData}
                isPaymentModalOpen={isPaymentModalOpen}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                preselectedStudentId={preselectedPayStudentId}
              />
            )}

            {activeStaffTab === "assessments" && (
              <AssessmentsWorkflow
                programmes={programmes}
                onNavigateToGrading={handleNavigateToGrading}
              />
            )}

            {activeStaffTab === "marksheet" && (
              <MarksheetWorkflow
                initialAssessmentId={gradingAssessmentId}
                onRefreshGlobalStats={fetchData}
              />
            )}

            {activeStaffTab === "audit" && <AuditTrailWorkflow />}
          </div>
        ) : (
          <div>
            {activeStudentId ? (
              <StudentPortal studentId={activeStudentId} />
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
            <span>Next.js 16 (App Router)</span>
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
