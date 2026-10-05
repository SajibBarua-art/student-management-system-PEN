"use client";

import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatters";
import {
  EC_REASON_OPTIONS,
  EC_EXTENSION_DAY_OPTIONS,
} from "@/constants";

interface StudentEcClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssessment: any | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  days: string;
  onDaysChange: (days: string) => void;
  explanation: string;
  onExplanationChange: (explanation: string) => void;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function StudentEcClaimModal({
  isOpen,
  onClose,
  activeAssessment,
  reason,
  onReasonChange,
  days,
  onDaysChange,
  explanation,
  onExplanationChange,
  isSubmitting,
  error,
  success,
  onSubmit,
}: StudentEcClaimModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeAssessment
          ? `Extenuating Circumstances (EC) Claim: ${activeAssessment.moduleCode}`
          : "Lodge Extenuating Circumstances Claim"
      }
      description="Request a penalty-free submission extension or late penalty waiver subject to formal Registry Examination Board approval."
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {activeAssessment && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              {activeAssessment.title} ({activeAssessment.moduleName})
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              Official Module Deadline: {formatDateTime(activeAssessment.deadline)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Circumstance Category *
            </label>
            <select
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold"
            >
              {EC_REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Requested Extension Days *
            </label>
            <select
              value={days}
              onChange={(e) => onDaysChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold"
            >
              {EC_EXTENSION_DAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Explanation & Supporting Evidence Summary *
          </label>
          <textarea
            rows={4}
            required
            placeholder="State the circumstances preventing on-time coursework submission and summarize evidence available (e.g. medical practitioner note, police report, or certificate)..."
            value={explanation}
            onChange={(e) => onExplanationChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            By lodging this claim, you declare that the facts provided are true. False extenuating circumstances claims constitute academic misconduct.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isSubmitting}>
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-300" />
            Lodge EC Claim
          </Button>
        </div>
      </form>
    </Modal>
  );
}
