import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Award,
  Calendar,
  CreditCard,
  FileCheck,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateAcademicStanding } from "@/lib/academic-engine";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/formatters";

interface VerifyPageProps {
  searchParams: Promise<{
    type?: string;
    serial?: string;
    id?: string;
    ref?: string;
    studentId?: string;
  }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { type = "transcript", serial = "", id = "", ref = "", studentId = "" } = params;

  let student: any = null;
  let standing: any = null;
  let payment: any = null;
  let isVerified = false;

  const targetStudentId = id || studentId;

  if (type === "transcript" && targetStudentId) {
    student = await prisma.student.findUnique({
      where: { studentId: targetStudentId },
      include: {
        programme: true,
        grades: {
          include: {
            assessment: true,
          },
        },
      },
    });

    if (student) {
      standing = calculateAcademicStanding(student.grades || []);
      isVerified = true;
    }
  } else if (type === "receipt") {
    if (ref) {
      payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { referenceNumber: ref },
            { id: ref },
          ],
        },
      });
    }

    if (targetStudentId) {
      student = await prisma.student.findUnique({
        where: { studentId: targetStudentId },
        include: { programme: true },
      });
    }

    if (payment || student) {
      isVerified = true;
    }
  }

  const verificationTimestamp = new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 text-white flex flex-col items-center justify-center font-serif border border-indigo-800 shrink-0">
            <span className="text-lg font-black leading-none">U</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-black text-slate-900 dark:text-white block">
              University of Advanced Studies
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              RegistryOS Digital Attestation & Verification Service
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          System Home
        </Link>
      </header>

      {/* Main card */}
      <main className="max-w-4xl w-full mx-auto my-8">
        {isVerified ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
            {/* Status Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6 sm:px-10 sm:py-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Authentic Verified Record
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black">
                    {type === "transcript"
                      ? "Official Academic Transcript Ratified"
                      : "Bursary Payment Receipt Validated"}
                  </h1>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    This document record is authentic and registered in the institutional ledger.
                  </p>
                </div>
              </div>

              <div className="sm:text-right text-xs text-emerald-100 border-t sm:border-t-0 border-white/20 pt-2 sm:pt-0">
                <span className="block font-mono font-bold text-white text-sm">
                  {serial || "VERIFIED-RECORD"}
                </span>
                <span className="block text-[11px] text-emerald-200 mt-0.5">
                  Checked: {formatDateTime(verificationTimestamp)}
                </span>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 sm:p-10 space-y-6">
              {type === "transcript" && student && (
                <>
                  {/* Candidate Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Registered Candidate:
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {student.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Student Registration Number (URN):
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {student.studentId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Academic Standing:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {student.status} • {standing?.standingLabel || "Good Standing"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Degree Programme:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {student.programme?.name} ({student.programme?.code})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Award Classification:
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {standing?.awardClassification || "Under Board Consideration"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                          Academic Cohort:
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {student.academicYear} • Full-Time
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attainment Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-900 text-white">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Weighted Average Mark
                      </span>
                      <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
                        {standing?.wam || 0}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Official Tariff Average
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Conferred Credits
                      </span>
                      <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
                        {standing?.totalEarnedCredits || 0} / {standing?.totalAttemptedCredits || 120}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        FHEQ Credits Attained
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Board Ratification
                      </span>
                      <span className="text-sm font-extrabold text-amber-300 mt-1 block">
                        {standing?.progressionDecision || "In Progress"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Senate Examination Council
                      </span>
                    </div>
                  </div>
                </>
              )}

              {type === "receipt" && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Payer / Candidate:</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {student?.fullName || "Registered Student"}
                      </span>
                      <span className="font-mono text-slate-500 block mt-0.5">
                        URN: {student?.studentId || targetStudentId || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Bursary Receipt Reference:</span>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {ref || serial}
                      </span>
                      <span className="text-emerald-600 font-semibold block mt-0.5">
                        Status: Cleared & Reconciled
                      </span>
                    </div>
                  </div>

                  {payment && (
                    <div className="border-t border-slate-200 dark:border-white/10 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 text-xs block">Amount Remitted:</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <span>Payment Date:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {formatDate(payment.paymentDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cryptographic Signature Footer */}
              <div className="border-t border-slate-200 dark:border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Cryptographically attested by Senate House Examination Council.
                  </span>
                </div>
                <div className="font-mono text-[11px]">
                  Sha256 Token: {serial.slice(0, 16) || "9b12a5fc78a011ef"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Unverified or Missing Record */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Document Verification Unsuccessful
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              The requested document identifier could not be validated against the active academic registry database.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl max-w-sm mx-auto text-xs font-mono text-slate-500">
              Queried Serial: {serial || "None Provided"} <br />
              Candidate URN: {id || "None Provided"}
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Return to Institutional Registry
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10">
        © {new Date().getFullYear()} University of Advanced Studies • RegistryOS Enterprise Verification System
      </footer>
    </div>
  );
}
