import {
  getStudentPersonas,
  getDashboardStats,
  getStudentsFull,
  getProgrammesFull,
  getAuditLogs,
  getAssessmentsFull,
  getPaymentsFull,
  getStudentDetail,
} from "@/lib/server-data";
import { AppClientShell } from "@/components/AppClientShell";
import { InstitutionalPersona } from "@/components/layout/Navbar";
import { USER_ROLES } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    role?: string;
    persona?: string;
    studentId?: string;
  }>;
}

/**
 * True SSR Server Component Entry Point (Next.js 16 App Router)
 *
 * Adheres to the Next.js Golden Rule:
 * - Server Component by default with zero client-side waterfall fetches on page load or tab switch.
 * - Extracts searchParams on the server to query only the database models needed for the active view.
 * - Passes pre-rendered data directly down to leaf interactive client components.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const role = (params.role === "student" ? "student" : "staff") as "staff" | "student";
  const tab = params.tab || "overview";
  const persona = (params.persona as InstitutionalPersona) || (role === "student" ? USER_ROLES.STUDENT : USER_ROLES.REGISTRY_ADMIN);

  // 1. Fetch lightweight personas for the Navbar switcher (always needed for layout)
  const studentPersonas = await getStudentPersonas();
  const studentId = params.studentId || (studentPersonas.length > 0 ? studentPersonas[0].id : null);

  // 2. Tab-specific conditional SSR data fetching
  let stats = null;
  let students: any[] = [];
  let programmes: any[] = [];
  let auditLogs: any[] = [];
  let assessments: any[] = [];
  let payments: any[] = [];
  let studentDetail = null;

  if (role === "staff") {
    if (tab === "overview") {
      stats = await getDashboardStats();
    } else if (tab === "audit") {
      auditLogs = await getAuditLogs(150);
    } else if (tab === "enrolment") {
      const [studentsData, programmesData] = await Promise.all([
        getStudentsFull(),
        getProgrammesFull(),
      ]);
      students = studentsData;
      programmes = programmesData;
    } else if (tab === "fees") {
      const [studentsData, paymentsData] = await Promise.all([
        getStudentsFull(),
        getPaymentsFull(),
      ]);
      students = studentsData;
      payments = paymentsData;
    } else if (tab === "assessments") {
      const [programmesData, assessmentsData] = await Promise.all([
        getProgrammesFull(),
        getAssessmentsFull(),
      ]);
      programmes = programmesData;
      assessments = assessmentsData;
    } else if (tab === "marksheet") {
      const [assessmentsData, studentsData] = await Promise.all([
        getAssessmentsFull(),
        getStudentsFull(),
      ]);
      assessments = assessmentsData;
      students = studentsData;
    }
  } else {
    // role === "student"
    if (studentId) {
      const [detailData, assessmentsData] = await Promise.all([
        getStudentDetail(studentId),
        getAssessmentsFull(),
      ]);
      studentDetail = detailData;
      assessments = assessmentsData;
    }
  }

  return (
    <AppClientShell
      initialRole={role}
      initialTab={tab}
      initialPersona={persona}
      initialStudentId={studentId}
      studentPersonas={studentPersonas}
      initialStats={stats}
      initialStudents={students}
      initialProgrammes={programmes}
      initialAuditLogs={auditLogs}
      initialAssessments={assessments}
      initialPayments={payments}
      initialStudentDetail={studentDetail}
    />
  );
}
