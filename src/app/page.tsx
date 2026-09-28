"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { OverviewDashboard } from "@/components/staff/OverviewDashboard";
import { EnrolmentWorkflow } from "@/components/staff/EnrolmentWorkflow";
import { FeesPaymentsWorkflow } from "@/components/staff/FeesPaymentsWorkflow";
import { AssessmentsWorkflow } from "@/components/staff/AssessmentsWorkflow";
import { MarksheetWorkflow } from "@/components/staff/MarksheetWorkflow";
import { StudentPortal } from "@/components/student/StudentPortal";

export default function Home() {
  const [role, setRole] = useState<"staff" | "student">("staff");
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Navbar
        role={role}
        onRoleChange={setRole}
        students={students}
        activeStudentId={activeStudentId}
        onStudentChange={setActiveStudentId}
        activeStaffTab={activeStaffTab}
        onStaffTabChange={setActiveStaffTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PEN Global Registry Module • Built with Next.js App Router, Prisma ORM & PostgreSQL
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            Role Mode: {role === "staff" ? "Registry Administrator (Staff)" : "Student Self-Service"}
          </span>
        </div>
      </footer>
    </div>
  );
}
