"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  Receipt,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  PAGINATION,
  FILTER_ALL,
  FEE_CATEGORY_FILTER_OPTIONS,
} from "@/constants";

interface StudentFinanceTabProps {
  student: any;
  feesSearchTerm: string;
  onFeesSearchTermChange: (term: string) => void;
  feesCategoryFilter: string;
  onFeesCategoryFilterChange: (filter: string) => void;
  feesPage: number;
  feesPageSize: number;
  onFeesPageChange: (page: number) => void;
  onFeesPageSizeChange: (size: number) => void;
  paginatedFees: any[];
  totalFilteredFeesCount: number;
  paymentsSearchTerm: string;
  onPaymentsSearchTermChange: (term: string) => void;
  paymentsMethodFilter: string;
  onPaymentsMethodFilterChange: (filter: string) => void;
  paymentsPage: number;
  paymentsPageSize: number;
  onPaymentsPageChange: (page: number) => void;
  onPaymentsPageSizeChange: (size: number) => void;
  paginatedPayments: any[];
  totalFilteredPaymentsCount: number;
  onSelectPaymentForReceipt: (payment: any) => void;
}

export function StudentFinanceTab({
  student,
  feesSearchTerm,
  onFeesSearchTermChange,
  feesCategoryFilter,
  onFeesCategoryFilterChange,
  feesPage,
  feesPageSize,
  onFeesPageChange,
  onFeesPageSizeChange,
  paginatedFees,
  totalFilteredFeesCount,
  paymentsSearchTerm,
  onPaymentsSearchTermChange,
  paymentsMethodFilter,
  onPaymentsMethodFilterChange,
  paymentsPage,
  paymentsPageSize,
  onPaymentsPageChange,
  onPaymentsPageSizeChange,
  paginatedPayments,
  totalFilteredPaymentsCount,
  onSelectPaymentForReceipt,
}: StudentFinanceTabProps) {
  const studentFees = student?.fees || [];
  const studentPayments = student?.payments || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          My Student Tuition Ledger
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Overview of assigned programme tuition schedules, recorded receipts, and outstanding balance.
        </p>
      </div>

      {student?.isOverdue && (
        <Alert
          variant="danger"
          title="Tuition Payment Overdue"
        >
          You have an outstanding balance of {formatCurrency(student.balance)} that is past the scheduled due date. Please arrange settlement with the Registry Finance Desk.
        </Alert>
      )}

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-slate-200 dark:border-white/[0.08]">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">
            Total Fees Assigned
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">
            {formatCurrency(student?.totalFees || 0)}
          </span>
        </Card>
        <Card className="p-5 border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/15">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
            Total Payments Made
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1.5 block">
            {formatCurrency(student?.totalPaid || 0)}
          </span>
        </Card>
        <Card className="p-5 border-rose-200 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/15">
          <span className="text-xs text-rose-700 dark:text-rose-400 uppercase font-bold block">
            Outstanding Balance
          </span>
          <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1.5 block">
            {formatCurrency(student?.balance || 0)}
          </span>
        </Card>
      </div>

      {/* Fee Billing Schedule & Scholarships */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">Fee Billing Schedule & Scholarships</CardTitle>
              {studentFees.some((f: any) => f.feeType === "INSTALMENT_TRANCHE") && (
                <Badge variant="purple" dot className="hidden sm:inline-flex">
                  Instalment Plan Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Itemized modular tuition tranches, lab levies, and institutional scholarship awards.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search billing item..."
                value={feesSearchTerm}
                onChange={(e) => onFeesSearchTermChange(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 sm:w-52"
              />
              {feesSearchTerm && (
                <button
                  type="button"
                  onClick={() => onFeesSearchTermChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
              <select
                value={feesCategoryFilter}
                onChange={(e) => onFeesCategoryFilterChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {FEE_CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-5">Billing Item / Tranche</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Scheduled Due Date</th>
                <th className="py-3 px-5 text-right">Invoiced Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {studentFees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No billing items scheduled yet.
                  </td>
                </tr>
              ) : totalFilteredFeesCount === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No billing items match your search or category filter.
                  </td>
                </tr>
              ) : (
                paginatedFees.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="py-3 px-5 font-semibold text-slate-900 dark:text-white">
                      {fee.description}
                    </td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={
                          fee.amount < 0
                            ? "success"
                            : fee.feeType === "INSTALMENT_TRANCHE"
                            ? "purple"
                            : "secondary"
                        }
                      >
                        {fee.amount < 0
                          ? "SCHOLARSHIP / WAIVER"
                          : fee.feeType === "INSTALMENT_TRANCHE"
                          ? "INSTALMENT TRANCHE"
                          : "STANDARD TUITION"}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-400">
                      {fee.amount < 0 ? "Credited to Ledger" : formatDate(fee.dueDate)}
                    </td>
                    <td
                      className={`py-3 px-5 text-right font-extrabold font-mono ${
                        fee.amount < 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {fee.amount < 0
                        ? `-${formatCurrency(Math.abs(fee.amount))}`
                        : formatCurrency(fee.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={feesPage}
          totalItems={totalFilteredFeesCount}
          pageSize={feesPageSize}
          onPageChange={onFeesPageChange}
          onPageSizeChange={onFeesPageSizeChange}
          pageSizeOptions={[...PAGINATION.OPTIONS.COMPACT]}
          itemLabel="billing items"
        />
      </Card>

      {/* Payment Receipts & History */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Payment Receipts & History</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified payments received and credited to your institutional tuition account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ref or notes..."
                value={paymentsSearchTerm}
                onChange={(e) => onPaymentsSearchTermChange(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 sm:w-52"
              />
              {paymentsSearchTerm && (
                <button
                  type="button"
                  onClick={() => onPaymentsSearchTermChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Method:</span>
              <select
                value={paymentsMethodFilter}
                onChange={(e) => onPaymentsMethodFilterChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={FILTER_ALL}>All Methods</option>
                {Array.from(new Set<string>(studentPayments.map((p: any) => p.paymentMethod).filter(Boolean))).map((method: string) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Transaction Reference</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Notes</th>
                <th className="py-3.5 px-5 text-right">Amount Paid</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {studentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No payment records registered yet.
                  </td>
                </tr>
              ) : totalFilteredPaymentsCount === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No payment records match your search or method filter.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                      {p.referenceNumber}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 italic">
                      {p.notes || "Tuition fee settlement"}
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectPaymentForReceipt(p)}
                        className="text-xs h-7 px-2.5"
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
          currentPage={paymentsPage}
          totalItems={totalFilteredPaymentsCount}
          pageSize={paymentsPageSize}
          onPageChange={onPaymentsPageChange}
          onPageSizeChange={onPaymentsPageSizeChange}
          pageSizeOptions={[...PAGINATION.OPTIONS.COMPACT]}
          itemLabel="payments"
        />
      </Card>
    </div>
  );
}
