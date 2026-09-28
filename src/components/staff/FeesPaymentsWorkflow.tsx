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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { generateTransactionReference } from "@/lib/transaction-ref";

interface FeesPaymentsWorkflowProps {
  students: any[];
  onRefresh: () => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  preselectedStudentId?: string | null;
}

export function FeesPaymentsWorkflow({
  students,
  onRefresh,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  preselectedStudentId,
}: FeesPaymentsWorkflowProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
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

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentForPay(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  // Fetch payments list
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
    fetchPayments();
  }, []);

  // When payment modal opens, auto-generate reference number
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

  // Calculations
  const totalAssignedAll = students.reduce((sum, s) => sum + s.totalFees, 0);
  const totalPaidAll = students.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalOutstandingAll = Math.max(0, totalAssignedAll - totalPaidAll);
  const overdueStudentsCount = students.filter((s) => s.isOverdue).length;

  const currentPayingStudent = students.find((s) => s.id === selectedStudentForPay);

  // Filter students ledger
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOverdue = !showOverdueOnly || s.isOverdue;
    return matchesSearch && matchesOverdue;
  });

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Fees & Payments Management
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time balance tracking, fee scheduling by programme, and payment transaction logging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFeeAssignModalOpen(true)}
            size="sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Assign Extra Fee
          </Button>
          <Button onClick={() => openNewPaymentModal()} size="sm">
            <CreditCard className="w-4 h-4 mr-1.5" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-50/60 dark:bg-zinc-800/40">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
            Total Fees Assigned
          </span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 block">
            {formatCurrency(totalAssignedAll)}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Aggregated programme tuition & fees
          </span>
        </Card>

        <Card className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            Total Payments Collected
          </span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
            {formatCurrency(totalPaidAll)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            Receipted in Registry ledger
          </span>
        </Card>

        <Card className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
            Total Outstanding Balance
          </span>
          <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">
            {formatCurrency(totalOutstandingAll)}
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">
            Remaining student liabilities
          </span>
        </Card>

        <Card className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              Overdue Students
            </span>
            <BadgeAlert className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1 block">
            {overdueStudentsCount} Student(s)
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
            Requires Registry follow-up
          </span>
        </Card>
      </div>

      {/* Student Balances Ledger Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Student Accounts & Balance Ledger</CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live balances calculated from programme fees minus verified transactions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Show Overdue Only</span>
            </label>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4">Assigned Fees</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Current Balance</th>
                <th className="py-3 px-4">Overdue Flag</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                    s.isOverdue ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {s.studentId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.fullName}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {s.programme?.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(s.totalFees)}
                  </td>
                  <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.totalPaid)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        s.balance > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(s.balance)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE
                      </span>
                    ) : s.balance === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cleared
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Normal</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.balance > 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openNewPaymentModal(s.id)}
                        className="text-xs h-7 py-0 px-2.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                        Pay
                      </Button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No Dues</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction History Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded Payment Transactions</CardTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit log of all registered student payments with bank reference identifiers.
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Notes / Purpose</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {p.referenceNumber}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {p.student?.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500">
                        {p.student?.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-xs max-w-xs truncate">
                      {p.notes || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Transaction Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Transaction"
        description="Log an incoming student tuition fee payment into the Registry ledger."
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {paymentError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {paymentError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentId}) — Outstanding: {formatCurrency(s.balance)}
                </option>
              ))}
            </select>
          </div>

          {currentPayingStudent && (
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block">Current Outstanding Balance:</span>
                <span className="font-bold text-base text-rose-600 dark:text-rose-400">
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
                Pay Full Balance
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="TXN-2025-XXXX"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Method *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque / Draft</option>
                <option value="Sponsorship Wire">Corporate / Government Sponsor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Internal Notes / Receipt Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Term 2 installment received via Barclays"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
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
        title="Assign Additional Fee to Student"
        description="Add a supplementary fee charge (e.g. re-sit exam, bench fee, field trip) to a student's ledger."
        maxWidth="md"
      >
        <form onSubmit={handleAssignFee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Student *
            </label>
            <select
              value={feeAssignStudentId}
              onChange={(e) => setFeeAssignStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fee Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fee Description *
            </label>
            <input
              type="text"
              required
              value={feeDesc}
              onChange={(e) => setFeeDesc(e.target.value)}
              placeholder="e.g., Re-sit Examination Fee"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFeeAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Assign Fee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
