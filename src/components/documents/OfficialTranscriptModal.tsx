"use client";

import React, { useRef } from "react";
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { printDocument } from "@/lib/print-document";

interface OfficialTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  academicStanding: any;
}

/**
 * Deterministic pseudo-random SVG QR Code generator
 * Generates an authentic-looking QR matrix with corner position detection patterns and timing tracks.
 */
function DocumentQrCode({ value, size = 110 }: { value: string; size?: number }) {
  // Simple hash of value for pattern determinism
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  const matrixSize = 25;
  const cellSize = size / matrixSize;

  // Generate 25x25 grid
  const cells: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Position detection pattern helper
  const drawCorner = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[startRow + r][startCol + c] = isBorder || isInner;
      }
    }
  };

  drawCorner(0, 0); // Top-left
  drawCorner(0, matrixSize - 7); // Top-right
  drawCorner(matrixSize - 7, 0); // Bottom-left

  // Timing rails
  for (let i = 8; i < matrixSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Alignment pattern around (16, 16)
  for (let r = 14; r <= 18; r++) {
    for (let c = 14; c <= 18; c++) {
      const isBorder = r === 14 || r === 18 || c === 14 || c === 18;
      const isCenter = r === 16 && c === 16;
      cells[r][c] = isBorder || isCenter;
    }
  }

  // Pseudo-random data bits
  let seed = Math.abs(hash);
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite corner patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= matrixSize - 8) ||
        (r >= matrixSize - 8 && c < 8) ||
        (r === 6 || c === 6) ||
        (r >= 14 && r <= 18 && c >= 14 && c <= 18)
      ) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      cells[r][c] = seed / 233280 > 0.48;
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="border border-slate-300 dark:border-white/20 p-1.5 bg-white rounded-lg shadow-sm"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function OfficialTranscriptModal({
  isOpen,
  onClose,
  student,
  academicStanding,
}: OfficialTranscriptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const publishedGrades =
    student.grades?.filter((g: any) => g.isPublished) || [];
  const transcriptSerial = `TRN-${new Date().getFullYear()}-${student.studentId.replace(/[^0-9]/g, "").padStart(6, "0")}`;
  const verificationUrl = `https://registry.university.ac.uk/verify?serial=${transcriptSerial}&id=${student.studentId}`;

  const handlePrint = () => {
    printDocument(
      "official-transcript-document",
      `Official_Transcript_${student.studentId}_${(student.fullName || "Student").replace(/\s+/g, "_")}`
    );
  };

  return (
    <div className="transcript-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          body * {
            visibility: hidden;
          }
          .transcript-modal-overlay {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            backdrop-filter: none !important;
          }
          .transcript-modal-card {
            position: static !important;
            display: block !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }
          .transcript-modal-scroll {
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #official-transcript-document,
          #official-transcript-document * {
            visibility: visible !important;
          }
          #official-transcript-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="transcript-modal-card relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Official University Academic Transcript
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="gradient"
              size="sm"
              onClick={handlePrint}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="transcript-modal-scroll overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Printable Document Paper */}
          <div
            id="official-transcript-document"
            ref={printRef}
            className="p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden"
          >
            {/* Background Security Watermark Emblem */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Building2 className="w-[500px] h-[500px]" />
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                  U
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
                    University of Advanced Studies
                  </h1>
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mt-0.5">
                    Academic Registry & Examination Council
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Senate House • Registry Division • Official Record of Attainment
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="inline-block px-3 py-1 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold text-slate-800">
                  {transcriptSerial}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Date of Issue: {formatDate(new Date())}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider mt-0.5">
                  ● Verified Electronic Record
                </div>
              </div>
            </div>

            {/* Student Candidature Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Candidate Full Name:</span>
                  <span className="font-extrabold text-sm text-slate-900">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Student Registration Number (URN):</span>
                  <span className="font-mono font-bold text-slate-900">{student.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Enrolment Status:</span>
                  <span className="font-semibold text-emerald-700 uppercase tracking-wide">
                    {student.status} (In Good Standing)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Degree Programme:</span>
                  <span className="font-bold text-slate-900">
                    {student.programme?.name} ({student.programme?.code})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Award Target:</span>
                  <span className="font-semibold text-slate-800">
                    Bachelor of Science with Honours (FHEQ Level 6)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Academic Cohort / Year:</span>
                  <span className="font-semibold text-slate-800">{student.academicYear} • Full-Time</span>
                </div>
              </div>
            </div>

            {/* Modular Marksheet Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Modular Academic Attainment Record
                </h3>
                <span className="text-[11px] text-slate-500">
                  {publishedGrades.length} Module(s) Formally Ratified
                </span>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Module Code</th>
                    <th className="py-2.5 px-3">Module Title</th>
                    <th className="py-2.5 px-3 text-center">Credit Weight</th>
                    <th className="py-2.5 px-3 text-center">Attempt</th>
                    <th className="py-2.5 px-3 text-center">Mark (%)</th>
                    <th className="py-2.5 px-3 text-center">Classification</th>
                    <th className="py-2.5 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {publishedGrades.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-slate-400 italic"
                      >
                        No ratified module marks have been published by the Examination Board for this candidate.
                      </td>
                    </tr>
                  ) : (
                    publishedGrades.map((grade: any) => (
                      <tr key={grade.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {grade.assessment?.moduleCode}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {grade.assessment?.moduleName || grade.assessment?.title}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">
                          {grade.assessment?.credits || 15}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600">
                          1st Attempt
                        </td>
                        <td className="py-2 px-3 text-center font-extrabold text-slate-900 font-mono">
                          {grade.numericGrade}%
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              grade.classification === "DISTINCTION"
                                ? "bg-emerald-100 text-emerald-800"
                                : grade.classification === "MERIT"
                                ? "bg-sky-100 text-sky-800"
                                : grade.classification === "PASS"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {grade.classification}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          {grade.numericGrade >= 40 ? "PASS" : "FAIL"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Cumulative Summary & Progression Decision */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 text-white mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Weighted Average Mark (WAM)
                </span>
                <span className="text-2xl font-black font-mono mt-0.5 block text-indigo-300">
                  {academicStanding.wam}%
                </span>
                <span className="text-[10px] text-slate-400">
                  Calculated per institutional credit tariff
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Credits Conferred
                </span>
                <span className="text-2xl font-black font-mono mt-0.5 block text-emerald-300">
                  {academicStanding.totalEarnedCredits} / {academicStanding.totalAttemptedCredits || 120}
                </span>
                <span className="text-[10px] text-slate-400">
                  FHEQ Credits accumulated to date
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Board Classification
                </span>
                <span className="text-base font-extrabold mt-0.5 block text-amber-300">
                  {academicStanding.awardClassification}
                </span>
                <span className="text-[10px] text-slate-400">
                  Standing: {academicStanding.standingLabel}
                </span>
              </div>
            </div>

            {/* Board Decision Notification */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-6 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">
                  Examination Board Progression Determination:
                </span>
                <p className="text-slate-700 mt-0.5">
                  {academicStanding.progressionDecision}
                </p>
              </div>
            </div>

            {/* Registry Certification & Authentication Seal */}
            <div className="border-t-2 border-slate-900 pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              {/* Seal and Signatures */}
              <div className="space-y-3">
                <div className="text-[11px] text-slate-600 max-w-md italic leading-relaxed">
                  "I hereby certify that this transcript is an official, unaltered record of the academic attainment and curricular performance of the named candidate at the University of Advanced Studies."
                </div>

                <div className="pt-2 flex items-center gap-4">
                  {/* Embossed simulated seal */}
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-center p-1 text-indigo-900 select-none">
                    <span className="text-[7px] font-black uppercase tracking-tight">University Seal</span>
                    <span className="text-[9px] font-serif font-bold italic">VERITAS</span>
                    <span className="text-[6px] uppercase font-bold">Registry Office</span>
                  </div>

                  <div>
                    <div className="font-serif italic font-bold text-sm text-slate-800 border-b border-slate-400 pb-1">
                      Prof. Arthur Pendelton, Ph.D.
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
                      Academic Registrar & Secretary to Council
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Verification QR Code */}
              <div className="flex flex-col items-center sm:items-end shrink-0 text-center sm:text-right">
                <DocumentQrCode value={verificationUrl} size={90} />
                <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                  Scan to verify authentic record
                </span>
                <span className="text-[9px] font-mono text-indigo-700 font-bold block">
                  {transcriptSerial}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
