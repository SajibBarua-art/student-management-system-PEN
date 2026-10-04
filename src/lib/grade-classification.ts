import { GradeClassification } from "@/generated/prisma/client";
import { GRADE_THRESHOLDS, GRADE_CLASSIFICATIONS } from "@/constants";

/**
 * Calculates academic grade classification:
 * - Distinction: >= 70
 * - Merit: >= 60
 * - Pass: >= 40
 * - Fail: < 40
 */
export function getGradeClassification(score: number): GradeClassification {
  if (score >= GRADE_THRESHOLDS.DISTINCTION) return GRADE_CLASSIFICATIONS.DISTINCTION;
  if (score >= GRADE_THRESHOLDS.MERIT) return GRADE_CLASSIFICATIONS.MERIT;
  if (score >= GRADE_THRESHOLDS.PASS) return GRADE_CLASSIFICATIONS.PASS;
  return GRADE_CLASSIFICATIONS.FAIL;
}

export function getClassificationLabel(classification: GradeClassification): string {
  switch (classification) {
    case GRADE_CLASSIFICATIONS.DISTINCTION:
      return `Distinction (≥${GRADE_THRESHOLDS.DISTINCTION}%)`;
    case GRADE_CLASSIFICATIONS.MERIT:
      return `Merit (≥${GRADE_THRESHOLDS.MERIT}%)`;
    case GRADE_CLASSIFICATIONS.PASS:
      return `Pass (≥${GRADE_THRESHOLDS.PASS}%)`;
    case GRADE_CLASSIFICATIONS.FAIL:
      return `Fail (<${GRADE_THRESHOLDS.PASS}%)`;
    default:
      return classification;
  }
}

export function getClassificationBadgeColor(classification: GradeClassification): string {
  switch (classification) {
    case "DISTINCTION":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    case "MERIT":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    case "PASS":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "FAIL":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300";
  }
}
