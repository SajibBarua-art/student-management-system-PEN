export interface GradeWithCredits {
  id?: string;
  numericGrade: number;
  isPublished?: boolean;
  assessment?: {
    credits?: number | null;
    moduleCode?: string;
    title?: string;
  } | null;
}

export interface AcademicStandingResult {
  wam: number; // Weighted Average Mark
  unweightedAverage: number;
  totalAttemptedCredits: number;
  totalEarnedCredits: number;
  failedCredits: number;
  standing: "FIRST_CLASS_TRACK" | "UPPER_SECOND_TRACK" | "LOWER_SECOND_TRACK" | "THIRD_CLASS_TRACK" | "RESIT_REQUIRED" | "ACADEMIC_WARNING" | "IN_PROGRESS";
  standingLabel: string;
  progressionDecision: string;
  awardClassification: string;
  badgeVariant: "success" | "warning" | "danger" | "purple" | "secondary";
}

/**
 * Calculates the Weighted Average Mark (WAM) and Academic Progression Standing
 * according to standard higher-education Examination Board regulations.
 */
export function calculateAcademicStanding(
  grades: GradeWithCredits[] = [],
  filterPublishedOnly: boolean = false
): AcademicStandingResult {
  const applicableGrades = filterPublishedOnly
    ? grades.filter((g) => g.isPublished)
    : grades;

  if (applicableGrades.length === 0) {
    return {
      wam: 0,
      unweightedAverage: 0,
      totalAttemptedCredits: 0,
      totalEarnedCredits: 0,
      failedCredits: 0,
      standing: "IN_PROGRESS",
      standingLabel: "Coursework In Progress",
      progressionDecision: "Pending Examination Board Review",
      awardClassification: "Pending",
      badgeVariant: "secondary",
    };
  }

  let totalWeightedScore = 0;
  let totalCredits = 0;
  let totalEarnedCredits = 0;
  let failedCredits = 0;
  let unweightedTotal = 0;
  let hasMarginalFail = false; // 30 - 39%
  let hasHardFail = false; // < 30%

  for (const g of applicableGrades) {
    const credits = g.assessment?.credits ?? 15;
    const score = g.numericGrade;

    totalWeightedScore += score * credits;
    totalCredits += credits;
    unweightedTotal += score;

    if (score >= 40) {
      totalEarnedCredits += credits;
    } else {
      failedCredits += credits;
      if (score >= 30) {
        hasMarginalFail = true;
      } else {
        hasHardFail = true;
      }
    }
  }

  const wam = totalCredits > 0 ? Math.round((totalWeightedScore / totalCredits) * 10) / 10 : 0;
  const unweightedAverage = Math.round((unweightedTotal / applicableGrades.length) * 10) / 10;

  // Determine Award Classification
  let awardClassification = "Fail";
  if (wam >= 70) awardClassification = "First Class Honours (1st)";
  else if (wam >= 60) awardClassification = "Upper Second Class (2:1)";
  else if (wam >= 50) awardClassification = "Lower Second Class (2:2)";
  else if (wam >= 40) awardClassification = "Third Class (3rd)";

  // Determine Progression Status
  let standing: AcademicStandingResult["standing"] = "IN_PROGRESS";
  let standingLabel = "In Good Standing";
  let progressionDecision = "Eligible to Progress to Next Stage";
  let badgeVariant: AcademicStandingResult["badgeVariant"] = "success";

  if (hasHardFail || failedCredits > 30) {
    standing = "ACADEMIC_WARNING";
    standingLabel = "Academic Warning / Review";
    progressionDecision = "Unsatisfactory Progress — Mandatory Academic Review Required";
    badgeVariant = "danger";
  } else if (hasMarginalFail || failedCredits > 0) {
    standing = "RESIT_REQUIRED";
    standingLabel = "Re-assessment / Resit Required";
    progressionDecision = `Referral Granted for ${failedCredits} Credit(s) in Supplementary Board Period`;
    badgeVariant = "warning";
  } else if (wam >= 70) {
    standing = "FIRST_CLASS_TRACK";
    standingLabel = "First Class Honours Track";
    progressionDecision = "Progress with Commendation / Distinction Standing";
    badgeVariant = "purple";
  } else if (wam >= 60) {
    standing = "UPPER_SECOND_TRACK";
    standingLabel = "Upper Second (2:1) Standing";
    progressionDecision = "Progress to Next Stage with Good Standing";
    badgeVariant = "success";
  } else if (wam >= 50) {
    standing = "LOWER_SECOND_TRACK";
    standingLabel = "Lower Second (2:2) Standing";
    progressionDecision = "Progress to Next Stage";
    badgeVariant = "secondary";
  } else {
    standing = "THIRD_CLASS_TRACK";
    standingLabel = "Pass / Third Class Standing";
    progressionDecision = "Progress with Minimum Credit Threshold";
    badgeVariant = "secondary";
  }

  return {
    wam,
    unweightedAverage,
    totalAttemptedCredits: totalCredits,
    totalEarnedCredits,
    failedCredits,
    standing,
    standingLabel,
    progressionDecision,
    awardClassification,
    badgeVariant,
  };
}
