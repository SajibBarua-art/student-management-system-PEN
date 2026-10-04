import {
  getStudentPersonas,
  getDashboardStats,
  getStudentsFull,
  getProgrammesFull,
  getAuditLogs,
  getAssessmentsFull,
} from "@/lib/server-data";
import { AppClientShell } from "@/components/AppClientShell";
import { InstitutionalPersona } from "@/components/layout/Navbar";

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
 * Server Component Entry Point (Next.js 16 App Router)
 *
 * Adheres to the Next.js Golden Rule:
 * - Server Component by default with zero client-side waterfall fetches on page load.
 * - Extracts searchParams on the server to conditionally query only the data needed for the active tab.
 * - Passes pre-rendered data directly down to leaf interactive client components.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const role = (params.role === "student" ? "student" : "staff") as "staff" | "student";
  const tab = params.tab || "overview";
  const persona = (params.persona as InstitutionalPersona) || (role === "student" ? "STUDENT" : "REGISTRY_ADMIN");
  const studentId = params.studentId || null;

  // 1. Fetch lightweight personas for the Navbar switcher (always needed for the layout)
  const studentPersonas = await getStudentPersonas();

  // 2. Tab-specific conditional SSR data fetching (eliminates fetching unused data)
  let stats = null;
  let students: any[] = [];
  let programmes: any[] = [];
  let auditLogs: any[] = [];
  let assessments: any[] = [];

  if (role === "staff") {
    if (tab === "overview") {
      stats = await getDashboardStats();
    } else if (tab === "audit") {
      auditLogs = await getAuditLogs(150);
    } else if (tab === "enrolment" || tab === "fees") {
      const [studentsData, programmesData] = await Promise.all([
        getStudentsFull(),
        getProgrammesFull(),
      ]);
      students = studentsData;
      programmes = programmesData;
    } else if (tab === "assessments") {
      const [programmesData, assessmentsData] = await Promise.all([
        getProgrammesFull(),
        getAssessmentsFull(),
      ]);
      programmes = programmesData;
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
    />
  );
}
