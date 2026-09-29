"use client";

import React, { useRef } from "react";
import { Printer, X, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { printDocument } from "@/lib/print-document";
import { DocumentQrCode } from "@/components/documents/DocumentQrCode";

interface FeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  student: any;
}

/**
 * Authentic Vector Bursary Paid Stamp
 * Rendered as pure SVG with mathematically bounded concentric rings and typography,
 * guaranteeing zero text wrapping or circular boundary overflow across all PDF renderers.
 */
function BursarStamp({ size = 68 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0 select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="47" stroke="#047857" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43.5" stroke="#047857" strokeWidth="0.8" strokeDasharray="1.5, 1.5" />
      <circle cx="50" cy="50" r="32" stroke="#047857" strokeWidth="1" />

      <text
        x="50"
        y="21"
        textAnchor="middle"
        fill="#047857"
        fontSize="5.2"
        fontWeight="800"
        letterSpacing="0.8"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      >
        BURSARY DIVISION
      </text>

      <rect x="25" y="38" width="50" height="17" rx="3" fill="#047857" fillOpacity="0.08" stroke="#047857" strokeWidth="1" />
      <text
        x="50"
        y="50.5"
        textAnchor="middle"
        fill="#047857"
        fontSize="11.5"
        fontWeight="900"
        letterSpacing="2"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      >
        PAID
      </text>

      <text
        x="50"
        y="62"
        textAnchor="middle"
        fill="#047857"
        fontSize="5.2"
        fontWeight="800"
        letterSpacing="0.6"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      >
        FINANCE OFFICE
      </text>

      <text
        x="50"
        y="78"
        textAnchor="middle"
        fill="#047857"
        fontSize="4.8"
        fontWeight="700"
        letterSpacing="1"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      >
        ★ CASHIER STAMP ★
      </text>
    </svg>
  );
}

export function FeeReceiptModal({
  isOpen,
  onClose,
  payment,
  student,
}: FeeReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const receiptSerial = `REC-${new Date(payment.paymentDate || Date.now()).getFullYear()}-${(payment.id || "000000").slice(0, 8).toUpperCase()}`;
  const baseUrl = typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3000";
  const receiptRef = payment.referenceNumber || payment.reference || payment.id;
  const verificationUrl = `${baseUrl}/verify?type=receipt&serial=${receiptSerial}&ref=${receiptRef}&studentId=${student?.studentId || ""}`;

  const handlePrint = () => {
    printDocument(
      "official-receipt-document",
      `Payment_Receipt_${receiptRef}`
    );
  };

  return (
    <div className="receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
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
          .receipt-modal-overlay {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            backdrop-filter: none !important;
          }
          .receipt-modal-card {
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
          .receipt-modal-scroll {
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #official-receipt-document,
          #official-receipt-document * {
            visibility: visible !important;
          }
          #official-receipt-document {
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

      <div className="receipt-modal-card relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Official Bursary & Finance Payment Receipt
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
              Print Receipt
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
        <div className="receipt-modal-scroll overflow-y-auto p-4 sm:p-6 space-y-4">
          <div
            id="official-receipt-document"
            ref={printRef}
            className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-white flex flex-col items-center justify-center font-serif shadow-sm shrink-0 border border-indigo-800">
                  <span className="text-xl font-black leading-none">U</span>
                  <span className="text-[6px] uppercase font-sans tracking-widest text-indigo-300 mt-1 font-bold">BURSARY</span>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 font-serif">
                    University of Advanced Studies
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
                    Finance Directorate • Bursary Cashier Office
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official Electronic Receipt & Confirmation of Payment
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold text-slate-800">
                  {receiptSerial}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Issued: {formatDateTime(payment.paymentDate || new Date())}
                </div>
              </div>
            </div>

            {/* Payer and Student Information */}
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Student Name
                </span>
                <span className="font-extrabold text-slate-900 block text-sm">
                  {student?.fullName || "Registered Student"}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  ID: {student?.studentId}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Degree Programme
                </span>
                <span className="font-semibold text-slate-800 block">
                  {student?.programme?.name || "Academic Programme"}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Academic Year: {student?.academicYear || "2024/2025"}
                </span>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="mb-5">
              <table className="w-full text-xs text-left border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {payment.notes || "Tuition / Modular Fee Payment"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono">
                      {payment.method || "BANK_TRANSFER"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">
                      {payment.reference}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono text-sm">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Payment Status
                </span>
                <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" /> CLEARED & SETTLED
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Total Tendered
                </span>
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>

            {/* Authentication and QR Footer */}
            <div className="border-t border-slate-300 pt-4 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <BursarStamp size={64} />
                  <div>
                    <span className="font-serif italic font-bold text-xs text-slate-800 block">
                      University Bursary Office
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Certified Institutional Payment Receipt
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end text-right shrink-0">
                <DocumentQrCode value={verificationUrl} size={70} />
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                  Scan to verify payment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
