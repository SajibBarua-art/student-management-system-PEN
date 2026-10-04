"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Hash,
  ArrowDownLeft,
  FileText,
  BadgeAlert,
  Wallet,
  Receipt,
  Sparkles,
  Award,
  Split,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { generateTransactionReference } from "@/lib/transaction-ref";
import { FeeReceiptModal } from "@/components/documents/FeeReceiptModal";
import { Pagination } from "@/components/ui/pagination";

interface FeesPaymentsWorkflowProps {
  students: any[];
  onRefresh: () => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  preselectedStudentId?: string | null;
  initialPayments?: any[];
}

export function FeesPaymentsWorkflow({
  students,
  onRefresh,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  preselectedStudentId,
  initialPayments,
}: FeesPaymentsWorkflowProps) {
  const [payments, setPayments] = useState<any[]>(initialPayments || []);
  const [isLoadingPayments, setIsLoadingPayments] = useState(!initialPayments || initialPayments.length === 0);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string>(
    preselectedStudentId || (students[0]?.id ?? "")
  );

  // Filter state for students ledger
  const [searchTerm, setSearchTerm] = useState("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // New Payment Form state
  const [payAmount, setPayAmount] = useState<string>("");
  const [payDate, setPayDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [payRef, setPayRef] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Bank Transfer");
  const [payNotes, setPayNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Additional fee assignment modal
  const [isFeeAssignModalOpen, setIsFeeAssignModalOpen] = useState(false);
  const [feeAssignStudentId, setFeeAssignStudentId] = useState<string>(
    students[0]?.id ?? ""
  );
  const [feeAmount, setFeeAmount] = useState<string>("500");
  const [feeDesc, setFeeDesc] = useState<string>("Laboratory & Practical Module Fee");
  const [feeDueDate, setFeeDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Instalment Plan state
  const [isInstalmentModalOpen, setIsInstalmentModalOpen] = useState(false);
  const [instalmentStudentId, setInstalmentStudentId] = useState<string>(
    students[0]?.id ?? ""
  );
  const [isGeneratingInstalments, setIsGeneratingInstalments] = useState(false);

  // Scholarship & Bursary award state
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [scholarshipStudentId, setScholarshipStudentId] = useState<string>(
    students[0]?.id ?? ""
  );
  const [scholarshipName, setScholarshipName] = useState<string>(
    "Dean's Merit Scholarship"
  );
  const [scholarshipAmount, setScholarshipAmount] = useState<string>("2000");
  const [scholarshipType, setScholarshipType] = useState<string>(
    "SCHOLARSHIP_WAIVER"
  );
  const [scholarshipNotes, setScholarshipNotes] = useState<string>(
    "Academic excellence commendation award"
  );
  const [isAwardingScholarship, setIsAwardingScholarship] = useState(false);

  // Receipt Modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] =
    useState<any | null>(null);

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentForPay(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (initialPayments !== undefined) {
      setPayments(initialPayments);
      setIsLoadingPayments(false);
    } else {
      fetchPayments();
    }
  }, [initialPayments]);

  const openNewPaymentModal = (studentId?: string) => {
    if (studentId) {
      setSelectedStudentForPay(studentId);
      const student = students.find((s) => s.id === studentId);
      if (student && student.balance > 0) {
        setPayAmount(student.balance.toString());
      } else {
        setPayAmount("1000");
      }
    } else {
      setPayAmount("1000");
    }
    setPayRef(generateTransactionReference());
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentForPay,
          amount: parseFloat(payAmount),
          paymentDate: new Date(payDate),
          referenceNumber: payRef,
          paymentMethod: payMethod,
          notes: payNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record payment");
      }

      setIsPaymentModalOpen(false);
      setPayNotes("");
      fetchPayments();
      onRefresh();
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: feeAssignStudentId,
          amount: parseFloat(feeAmount),
          description: feeDesc,
          dueDate: new Date(feeDueDate),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign fee");

      setIsFeeAssignModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInstalments = async (studentId: string) => {
    setIsGeneratingInstalments(true);
    try {
      const res = await fetch("/api/fees/instalments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate instalment plan");
      }
      setIsInstalmentModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingInstalments(false);
    }
  };

  const handleAwardScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAwardingScholarship(true);
    try {
      const res = await fetch("/api/fees/scholarship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: scholarshipStudentId,
          scholarshipName,
          amount: parseFloat(scholarshipAmount),
          feeType: scholarshipType,
          notes: scholarshipNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to award scholarship");
      }
      setIsScholarshipModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAwardingScholarship(false);
    }
  };

  const totalAssignedAll = students.reduce(
    (sum, s) => sum + (Number(s.totalFees ?? s.financialSummary?.totalFees) || 0),
    0
  );
  const totalPaidAll = students.reduce(
    (sum, s) => sum + (Number(s.totalPaid ?? s.financialSummary?.totalPaid) || 0),
    0
  );
  const totalOutstandingAll = Math.max(0, totalAssignedAll - totalPaidAll);
  const overdueStudentsCount = students.filter((s) => s.isOverdue).length;

  const currentPayingStudent = students.find((s) => s.id === selectedStudentForPay);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOverdue = !showOverdueOnly || s.isOverdue;
    return matchesSearch && matchesOverdue;
  });

  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);
  const [studentsPageSize, setStudentsPageSize] = useState(10);

  useEffect(() => {
    setStudentsCurrentPage(1);
  }, [searchTerm, showOverdueOnly]);

  const paginatedStudents = filteredStudents.slice(
    (studentsCurrentPage - 1) * studentsPageSize,
    studentsCurrentPage * studentsPageSize
  );

  const [paymentsCurrentPage, setPaymentsCurrentPage] = useState(1);
  const [paymentsPageSize, setPaymentsPageSize] = useState(10);

  const paginatedPayments = payments.slice(
    (paymentsCurrentPage - 1) * paymentsPageSize,
    paymentsCurrentPage * paymentsPageSize
  );

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fees & Payments Ledger
            </h2>
            <Badge variant="purple">Real-Time Balances</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track programme fee schedules, record verified bank transactions, and monitor overdue accounts.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsScholarshipModalOpen(true)}
            size="sm"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-300"
          >
            <Award className="w-4 h-4 mr-1.5" />
            Award Scholarship / Grant
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFeeAssignModalOpen(true)}
            size="sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Assign Extra Fee
          </Button>
          <Button onClick={() => openNewPaymentModal()} variant="gradient" size="sm">
            <CreditCard className="w-4 h-4 mr-1.5" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 dark:border-white/[0.08]">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Invoiced Fees
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">
            {formatCurrency(totalAssignedAll)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Programme tuition & charges
          </span>
        </Card>

        <Card className="p-5 border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/15">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Total Collected
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1.5 block">
            {formatCurrency(totalPaidAll)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1 block">
            Verified in bank transactions
          </span>
        </Card>

        <Card className="p-5 border-rose-200 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/15">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
            Outstanding Balance
          </span>
          <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1.5 block">
            {formatCurrency(totalOutstandingAll)}
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1 block">
            Remaining student liabilities
          </span>
        </Card>

        <Card className="p-5 border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-950/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Overdue Accounts
            </span>
            <BadgeAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1.5 block">
            {overdueStudentsCount} Student(s)
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1 block">
            Past deadline with positive balance
          </span>
        </Card>
      </div>

      {/* Student Balances Ledger Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Student Accounts & Balance Ledger</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live balances computed automatically from assigned fees minus recorded payments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showOverdueOnly
                  ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
              <span>Overdue Only</span>
            </button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Student ID</th>
                <th className="py-3.5 px-5">Student Name</th>
                <th className="py-3.5 px-5">Programme</th>
                <th className="py-3.5 px-5">Assigned Fees</th>
                <th className="py-3.5 px-5">Total Paid</th>
                <th className="py-3.5 px-5">Current Balance</th>
                <th className="py-3.5 px-5">Status Flag</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {paginatedStudents.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors ${
                    s.isOverdue ? "bg-rose-50/50 dark:bg-rose-500/[0.04]" : ""
                  }`}
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {s.studentId}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {s.fullName}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                    {s.programme?.code}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-200">
                    {formatCurrency(s.totalFees)}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.totalPaid)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`font-extrabold ${
                        s.balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(s.balance)}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col gap-1 items-start">
                      {s.isOverdue ? (
                        <Badge variant="danger" dot>OVERDUE</Badge>
                      ) : s.balance === 0 ? (
                        <Badge variant="success" dot>Cleared</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                      {s.fees?.some((f: any) => f.feeType === "INSTALMENT_TRANCHE") && (
                        <Badge variant="purple">3-Tranches</Badge>
                      )}
                      {s.fees?.some(
                        (f: any) =>
                          f.feeType === "SCHOLARSHIP_WAIVER" ||
                          f.feeType === "HARDSHIP_BURSARY"
                      ) && <Badge variant="success">Scholarship</Badge>}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!s.fees?.some(
                        (f: any) => f.feeType === "INSTALMENT_TRANCHE"
                      ) && (
                        <Button
                          size="sm"
                          variant="outline"
                          title="Generate 3-Tranche Instalment Plan"
                          onClick={() => {
                            setInstalmentStudentId(s.id);
                            setIsInstalmentModalOpen(true);
                          }}
                          className="text-xs h-7 px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300"
                        >
                          <Split className="w-3.5 h-3.5 mr-1" />
                          Split
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        title="Award Scholarship / Grant"
                        onClick={() => {
                          setScholarshipStudentId(s.id);
                          setIsScholarshipModalOpen(true);
                        }}
                        className="text-xs h-7 px-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-300"
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        Grant
                      </Button>
                      {s.balance > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openNewPaymentModal(s.id)}
                          className="text-xs h-7 px-2.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10 font-bold"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Pay
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={studentsCurrentPage}
          totalItems={filteredStudents.length}
          pageSize={studentsPageSize}
          onPageChange={setStudentsCurrentPage}
          onPageSizeChange={setStudentsPageSize}
          itemLabel="student accounts"
        />
      </Card>

      {/* Transaction History Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded Payment Transactions</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified ledger of all receipted tuition fees with unique transaction identifiers.
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Reference No.</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Notes / Purpose</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                      {p.referenceNumber}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {p.student?.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {p.student?.studentId}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                      {p.notes || "—"}
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPaymentForReceipt({
                            ...p,
                            reference: p.referenceNumber,
                          });
                          setIsReceiptModalOpen(true);
                        }}
                        className="text-xs h-7 px-2"
                      >
                        <Receipt className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={paymentsCurrentPage}
          totalItems={payments.length}
          pageSize={paymentsPageSize}
          onPageChange={setPaymentsCurrentPage}
          onPageSizeChange={setPaymentsPageSize}
          itemLabel="transactions"
        />
      </Card>

      {/* Record Payment Transaction Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Student Payment"
        description="Log an incoming tuition fee settlement into the Registry PostgreSQL ledger."
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {paymentError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs rounded-xl">
              {paymentError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Student *
            </label>
            <select
              value={selectedStudentForPay}
              onChange={(e) => {
                const sId = e.target.value;
                setSelectedStudentForPay(sId);
                const match = students.find((s) => s.id === sId);
                if (match && match.balance > 0) {
                  setPayAmount(match.balance.toString());
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                  {s.fullName} ({s.studentId}) — Outstanding: {formatCurrency(s.balance)}
                </option>
              ))}
            </select>
          </div>

          {currentPayingStudent && (
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/25 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">Current Outstanding Balance:</span>
                <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                  {formatCurrency(currentPayingStudent.balance)}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPayAmount(currentPayingStudent.balance.toString())}
                className="text-[11px] h-7"
              >
                Auto-Fill Balance
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Reference *
              </label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="TXN-2025-XXXX"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Method *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Bank Transfer" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Bank Transfer / Wire</option>
                <option value="Debit Card" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Debit Card</option>
                <option value="Credit Card" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Credit Card</option>
                <option value="Cheque" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Cheque / Draft</option>
                <option value="Sponsorship Wire" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Sponsorship Wire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Internal Ledger Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Term 1 installment receipted"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="success">
              Confirm & Post Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Extra Fee Modal */}
      <Modal
        isOpen={isFeeAssignModalOpen}
        onClose={() => setIsFeeAssignModalOpen(false)}
        title="Assign Additional Student Fee"
        description="Add a supplementary fee schedule (e.g. re-sit exam, laboratory charge) to a student's ledger."
        maxWidth="md"
      >
        <form onSubmit={handleAssignFee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Student *
            </label>
            <select
              value={feeAssignStudentId}
              onChange={(e) => setFeeAssignStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fee Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Fee Description *
            </label>
            <input
              type="text"
              required
              value={feeDesc}
              onChange={(e) => setFeeDesc(e.target.value)}
              placeholder="e.g. Re-sit Examination Assessment Fee"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFeeAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isSubmitting}>
              Assign Fee Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate 3-Tranche Instalment Plan Modal */}
      <Modal
        isOpen={isInstalmentModalOpen}
        onClose={() => setIsInstalmentModalOpen(false)}
        title="Generate Institutional Instalment Plan"
        description="Split standard tuition into 3 scheduled tranches (Autumn 40%, Spring 30%, Summer 30%) with individual term-based deadlines."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Student *
            </label>
            <select
              value={instalmentStudentId}
              onChange={(e) => setInstalmentStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                  {s.fullName} ({s.studentId}) — Balance: {formatCurrency(s.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/25 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
              Instalment Tranche Structure:
            </span>
            <div className="flex justify-between border-b border-indigo-100 dark:border-indigo-500/10 pb-1">
              <span>Tranche 1 (Autumn Term — 40%)</span>
              <span className="font-mono font-bold">Due 15 Oct</span>
            </div>
            <div className="flex justify-between border-b border-indigo-100 dark:border-indigo-500/10 pb-1">
              <span>Tranche 2 (Spring Term — 30%)</span>
              <span className="font-mono font-bold">Due 15 Jan</span>
            </div>
            <div className="flex justify-between">
              <span>Tranche 3 (Summer Term — 30%)</span>
              <span className="font-mono font-bold">Due 15 Apr</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInstalmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              isLoading={isGeneratingInstalments}
              onClick={() => handleGenerateInstalments(instalmentStudentId)}
            >
              <Split className="w-4 h-4 mr-1.5" />
              Generate 3 Tranches
            </Button>
          </div>
        </div>
      </Modal>

      {/* Award Scholarship / Bursary Modal */}
      <Modal
        isOpen={isScholarshipModalOpen}
        onClose={() => setIsScholarshipModalOpen(false)}
        title="Award Scholarship, Bursary, or Fee Waiver"
        description="Directly apply a negative credit adjustment to the student's tuition ledger under university authority."
        maxWidth="md"
      >
        <form onSubmit={handleAwardScholarship} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Student *
            </label>
            <select
              value={scholarshipStudentId}
              onChange={(e) => setScholarshipStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Award Category *
              </label>
              <select
                value={scholarshipType}
                onChange={(e) => setScholarshipType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="SCHOLARSHIP_WAIVER" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Merit Scholarship</option>
                <option value="HARDSHIP_BURSARY" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Hardship / Access Grant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Credit Deduction (£) *
              </label>
              <input
                type="number"
                step="50"
                min="50"
                required
                value={scholarshipAmount}
                onChange={(e) => setScholarshipAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Award Title / Designation *
            </label>
            <input
              type="text"
              required
              value={scholarshipName}
              onChange={(e) => setScholarshipName(e.target.value)}
              placeholder="e.g. Dean's Excellence Scholarship"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Registry Award Notes (Optional)
            </label>
            <input
              type="text"
              value={scholarshipNotes}
              onChange={(e) => setScholarshipNotes(e.target.value)}
              placeholder="e.g. Awarded by University Council for academic distinction"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScholarshipModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={isAwardingScholarship}>
              <Award className="w-4 h-4 mr-1.5" />
              Credit to Student Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Payment Receipt Modal */}
      <FeeReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPaymentForReceipt}
        student={selectedPaymentForReceipt?.student}
      />
    </div>
  );
}
