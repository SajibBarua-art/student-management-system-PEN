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
  const [role, setRole] = useState<"staff" | "student">("staff");
  const [persona, setPersona] = useState<InstitutionalPersona>("REGISTRY_ADMIN");
  const [activeStaffTab, setActiveStaffTab] = useState<string>("overview");

  // Global data states
  const [students, setStudents] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal triggers from Overview or other workflows
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedPayStudentId, setPreselectedPayStudentId] = useState<string | null>(null);
  const [gradingAssessmentId, setGradingAssessmentId] = useState<string | null>(null);

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
        if (!activeStudentId && dataStudents.data.length > 0) {
          setActiveStudentId(dataStudents.data[0].id);
        }
      }
      if (dataProgrammes.success) setProgrammes(dataProgrammes.data);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeStudentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate to Marksheet with selected assessment
  const handleNavigateToGrading = (assessmentId: string) => {
    setGradingAssessmentId(assessmentId);
    setActiveStaffTab("marksheet");
  };

  // Open payment modal for specific student
  const handleOpenPaymentModal = (studentId?: string) => {
    if (studentId) {
      setPreselectedPayStudentId(studentId);
    } else {
      setPreselectedPayStudentId(null);
    }
    setActiveStaffTab("fees");
    setIsPaymentModalOpen(true);
  };

  // Persona Change Handler (RBAC)
  const handlePersonaChange = (newPersona: InstitutionalPersona) => {
    setPersona(newPersona);
    if (newPersona === "STUDENT") {
      setRole("student");
    } else {
      setRole("staff");
      if (
        newPersona === "MODULE_LEADER" &&
        (activeStaffTab === "fees" || activeStaffTab === "enrolment")
      ) {
        setActiveStaffTab("assessments");
      } else if (
        newPersona === "BURSAR_FINANCE" &&
        (activeStaffTab === "assessments" || activeStaffTab === "marksheet")
      ) {
        setActiveStaffTab("fees");
      }
    }
  };

  const handleRoleChange = (newRole: "staff" | "student") => {
    setRole(newRole);
    if (newRole === "student") {
      setPersona("STUDENT");
    } else {
      if (persona === "STUDENT") {
        setPersona("REGISTRY_ADMIN");
      }
    }
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
        onStudentChange={setActiveStudentId}
        activeStaffTab={activeStaffTab}
        onStaffTabChange={setActiveStaffTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 sm:py-6">
        {role === "staff" ? (
          <div>
            {activeStaffTab === "overview" && (
              <OverviewDashboard
                stats={stats}
                onNavigateTab={setActiveStaffTab}
                onOpenEnrolModal={() => setIsEnrolModalOpen(true)}
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
