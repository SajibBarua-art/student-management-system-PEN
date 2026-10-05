"use client";

import React from "react";
import { UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatDateTime, isPastDate } from "@/lib/formatters";

interface StudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssessment: any | null;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isUploading: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function StudentUploadModal({
  isOpen,
  onClose,
  activeAssessment,
  selectedFile,
  onFileSelect,
  notes,
  onNotesChange,
  isUploading,
  error,
  success,
  onSubmit,
}: StudentUploadModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeAssessment
          ? `Submit Deliverable: ${activeAssessment.title}`
          : "Upload Assessment Submission"
      }
      description="Select and submit your coursework file. Restricted strictly to PDF (.pdf) or Word document (.docx, .doc)."
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
              {activeAssessment.moduleCode} — {activeAssessment.moduleName}
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              Submission Deadline: {formatDateTime(activeAssessment.deadline)}
            </span>
            {isPastDate(activeAssessment.deadline) && (
              <div className="text-amber-600 dark:text-amber-400 font-bold pt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Notice: Deadline passed. Submission will be accepted but visually flagged as LATE.</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Document File (PDF or DOCX only) *
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
              }
            }}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
          {selectedFile && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              File: <strong className="text-slate-900 dark:text-white">{selectedFile.name}</strong> (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Submission Remarks (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Final draft with citations and data appendix"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isUploading}>
            <UploadCloud className="w-4 h-4 mr-1.5" />
            Upload & Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
