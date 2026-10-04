/**
 * Global Constants for Registry & Student Management System
 * Centralizes all system-wide strings, pagination settings, thresholds,
 * roles, action types, API routes, and dropdown filter options.
 */

// ==========================================
// 1. Pagination & Sizing Constants
// ==========================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  COMPACT_PAGE_SIZE: 5,
  CARD_PAGE_SIZE: 6,
  AUDIT_PAGE_SIZE: 10,
  OPTIONS: {
    DEFAULT: [10, 25, 50],
    COMPACT: [5, 10, 20],
    CARDS: [6, 12, 24],
    AUDIT: [10, 25, 50],
  },
} as const;

// ==========================================
// 2. Generic Filter Sentinel Values
// ==========================================
export const FILTER_ALL = "all";
export const FILTER_ALL_UPPER = "ALL";

// ==========================================
// 3. User & Staff Roles
// ==========================================
export const USER_ROLES = {
  REGISTRY_ADMIN: "REGISTRY_ADMIN",
  REGISTRY_OFFICER: "REGISTRY_OFFICER",
  MODULE_LEADER: "MODULE_LEADER",
  BURSAR_FINANCE: "BURSAR_FINANCE",
  STUDENT: "STUDENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ==========================================
// 4. Audit Log Actions & Event Filters
// ==========================================
export const AUDIT_ACTIONS = {
  GRADE_RECORDED: "GRADE_RECORDED",
  GRADE_MODIFIED: "GRADE_MODIFIED",
  BOARD_PUBLISHED_RESULTS: "BOARD_PUBLISHED_RESULTS",
  BOARD_WITHHELD_RESULTS: "BOARD_WITHHELD_RESULTS",
  GRADE_PUBLISHED: "GRADE_PUBLISHED",
  GRADE_WITHHELD: "GRADE_WITHHELD",
  EC_CLAIM_APPROVED: "EC_CLAIM_APPROVED",
  EC_CLAIM_REJECTED: "EC_CLAIM_REJECTED",
  SCHOLARSHIP_AWARDED: "SCHOLARSHIP_AWARDED",
  INSTALMENT_PLAN_GENERATED: "INSTALMENT_PLAN_GENERATED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ACTION_FILTERS = {
  ALL: "ALL",
  GRADES: "GRADES",
  EC: "EC",
  FINANCE: "FINANCE",
} as const;

export type AuditActionFilter = (typeof AUDIT_ACTION_FILTERS)[keyof typeof AUDIT_ACTION_FILTERS];

export const AUDIT_PILLS = [
  { key: AUDIT_ACTION_FILTERS.ALL, label: "All Events" },
  { key: AUDIT_ACTION_FILTERS.GRADES, label: "Grading & Board" },
  { key: AUDIT_ACTION_FILTERS.EC, label: "EC Claims" },
  { key: AUDIT_ACTION_FILTERS.FINANCE, label: "Finance" },
] as const;

// ==========================================
// 5. Academic Grading & Classifications
// ==========================================
export const GRADE_CLASSIFICATIONS = {
  DISTINCTION: "DISTINCTION",
  MERIT: "MERIT",
  PASS: "PASS",
  FAIL: "FAIL",
} as const;

export type GradeClassificationType = (typeof GRADE_CLASSIFICATIONS)[keyof typeof GRADE_CLASSIFICATIONS];

export const GRADE_THRESHOLDS = {
  DISTINCTION: 70,
  MERIT: 60,
  PASS: 40,
} as const;

export const CLASSIFICATION_FILTER_OPTIONS = [
  { value: "all", label: "All Grades" },
  { value: GRADE_CLASSIFICATIONS.DISTINCTION, label: `Distinction (${GRADE_THRESHOLDS.DISTINCTION}%+)` },
  { value: GRADE_CLASSIFICATIONS.MERIT, label: `Merit (${GRADE_THRESHOLDS.MERIT}-${GRADE_THRESHOLDS.DISTINCTION - 1}%)` },
  { value: GRADE_CLASSIFICATIONS.PASS, label: `Pass (${GRADE_THRESHOLDS.PASS}-${GRADE_THRESHOLDS.MERIT - 1}%)` },
  { value: GRADE_CLASSIFICATIONS.FAIL, label: `Fail (<${GRADE_THRESHOLDS.PASS}%)` },
] as const;

export const PUBLICATION_STATUS_FILTERS = {
  ALL: "all",
  PUBLISHED: "published",
  WITHHELD: "withheld",
} as const;

// ==========================================
// 6. Fees, Billing & Payment Methods
// ==========================================
export const FEE_TYPES = {
  TUITION: "TUITION",
  INSTALMENT_TRANCHE: "INSTALMENT_TRANCHE",
  SCHOLARSHIP_WAIVER: "SCHOLARSHIP_WAIVER",
  HARDSHIP_BURSARY: "HARDSHIP_BURSARY",
  ADMINISTRATIVE: "ADMINISTRATIVE",
} as const;

export type FeeTypeKey = (typeof FEE_TYPES)[keyof typeof FEE_TYPES];

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Cheque",
  "Sponsorship Wire",
] as const;

export const DEFAULT_PAYMENT_METHOD = "Bank Transfer";

export const ACCOUNT_BALANCE_FILTERS = {
  ALL: "all",
  OVERDUE: "overdue",
  OUTSTANDING: "outstanding",
  SETTLED: "settled",
} as const;

export const ACCOUNT_BALANCE_FILTER_OPTIONS = [
  { value: ACCOUNT_BALANCE_FILTERS.ALL, label: "All Accounts" },
  { value: ACCOUNT_BALANCE_FILTERS.OVERDUE, label: "Overdue Only" },
  { value: ACCOUNT_BALANCE_FILTERS.OUTSTANDING, label: "Outstanding Balance" },
  { value: ACCOUNT_BALANCE_FILTERS.SETTLED, label: "Fully Settled" },
] as const;

export const FEE_CATEGORY_FILTERS = {
  ALL: "all",
  TUITION: "TUITION",
  INSTALMENT: "INSTALMENT",
  SCHOLARSHIP: "SCHOLARSHIP",
} as const;

export const FEE_CATEGORY_FILTER_OPTIONS = [
  { value: FEE_CATEGORY_FILTERS.ALL, label: "All Items" },
  { value: FEE_CATEGORY_FILTERS.TUITION, label: "Tuition Only" },
  { value: FEE_CATEGORY_FILTERS.INSTALMENT, label: "Instalments" },
  { value: FEE_CATEGORY_FILTERS.SCHOLARSHIP, label: "Scholarships / Waivers" },
] as const;

// ==========================================
// 7. Enrolment Statuses
// ==========================================
export const ENROLMENT_STATUSES = {
  ENROLLED: "ENROLLED",
  DEFERRED: "DEFERRED",
  WITHDRAWN: "WITHDRAWN",
  COMPLETED: "COMPLETED",
} as const;

export type EnrolmentStatusKey = (typeof ENROLMENT_STATUSES)[keyof typeof ENROLMENT_STATUSES];

export const ENROLMENT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: ENROLMENT_STATUSES.ENROLLED, label: "Enrolled" },
  { value: ENROLMENT_STATUSES.DEFERRED, label: "Deferred" },
  { value: ENROLMENT_STATUSES.WITHDRAWN, label: "Withdrawn" },
  { value: ENROLMENT_STATUSES.COMPLETED, label: "Completed" },
] as const;

// ==========================================
// 8. Assessment & Coursework Statuses
// ==========================================
export const ASSESSMENT_STATUS_FILTERS = {
  ALL: "all",
  OPEN: "open",
  PASSED: "passed",
  SUBMITTED: "submitted",
  PENDING: "pending",
} as const;

export const ASSESSMENT_STATUS_FILTER_OPTIONS = [
  { value: ASSESSMENT_STATUS_FILTERS.ALL, label: "All Deliverables" },
  { value: ASSESSMENT_STATUS_FILTERS.OPEN, label: "Open for Submission" },
  { value: ASSESSMENT_STATUS_FILTERS.PASSED, label: "Deadline Passed" },
  { value: ASSESSMENT_STATUS_FILTERS.SUBMITTED, label: "Submitted" },
  { value: ASSESSMENT_STATUS_FILTERS.PENDING, label: "Pending Upload" },
] as const;

export const ASSESSMENT_DEFAULTS = {
  CREDITS: 15,
  TOTAL_MARKS: 100,
  EXTENSION_DAYS: 7,
} as const;

// ==========================================
// 9. Extenuating Circumstances (EC)
// ==========================================
export const EC_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const EC_REASONS = {
  MEDICAL: "MEDICAL",
  BEREAVEMENT: "BEREAVEMENT",
  ACUTE_PERSONAL: "ACUTE_PERSONAL",
  TECHNICAL_FAILURE: "TECHNICAL_FAILURE",
} as const;

export const EC_REASON_OPTIONS = [
  { value: EC_REASONS.MEDICAL, label: "Medical Emergency / Illness" },
  { value: EC_REASONS.BEREAVEMENT, label: "Bereavement / Family Loss" },
  { value: EC_REASONS.ACUTE_PERSONAL, label: "Acute Personal Crisis" },
  { value: EC_REASONS.TECHNICAL_FAILURE, label: "Major System / Technical Malfunction" },
] as const;

export const EC_EXTENSION_DAY_OPTIONS = [
  { value: "7", label: "7 Days Extension (Standard)" },
  { value: "14", label: "14 Days Extension (Major Medical)" },
  { value: "21", label: "21 Days Extension (Exceptional)" },
] as const;

// ==========================================
// 10. Late Penalty Configuration
// ==========================================
export const LATE_PENALTY_CONFIG = {
  DAILY_DEDUCTION_PERCENTAGE: 5,
  MAX_ALLOWED_LATE_DAYS: 7,
} as const;

// ==========================================
// 11. Centralized API Routes
// ==========================================
export const API_ROUTES = {
  ASSESSMENTS: "/api/assessments",
  AUDIT_LOGS: "/api/audit-logs",
  DASHBOARD_STATS: "/api/dashboard/stats",
  EXTENUATING_CIRCUMSTANCES: "/api/extenuating-circumstances",
  FEES: "/api/fees",
  FEES_INSTALMENTS: "/api/fees/instalments",
  FEES_SCHOLARSHIP: "/api/fees/scholarship",
  GRADES: "/api/grades",
  GRADES_PUBLISH: "/api/grades/publish",
  PAYMENTS: "/api/payments",
  PROGRAMMES: "/api/programmes",
  STUDENTS: "/api/students",
  SUBMISSIONS: "/api/submissions",
} as const;
