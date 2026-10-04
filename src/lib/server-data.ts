import prisma from "@/lib/prisma";
import { InstitutionalPersona } from "@/components/layout/Navbar";
import { calculateAcademicStanding } from "@/lib/academic-engine";

export interface StudentPersona {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programme: { code: string; name: string };
  status: string;
}

/**
 * Lightweight student persona list for Navbar persona switcher
 */
export async function getStudentPersonas(): Promise<StudentPersona[]> {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true,
        status: true,
        programme: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { studentId: "asc" },
    });
    return students;
  } catch (error) {
    console.error("Error fetching student personas on server:", error);
    return [];
  }
}

/**
 * Server-side calculation of Executive Dashboard stats
 */
export async function getDashboardStats() {
  try {
    const now = new Date();

    const [
      students,
      programmes,
      assessments,
      submissions,
      grades,
      fees,
      payments,
    ] = await Promise.all([
      prisma.student.findMany({
        include: {
          programme: { select: { code: true, name: true } },
          fees: true,
          payments: true,
        },
      }),
      prisma.programme.findMany(),
      prisma.assessment.findMany({
        include: {
          submissions: true,
          grades: true,
        },
      }),
      prisma.submission.findMany(),
      prisma.grade.findMany(),
      prisma.studentFee.findMany(),
      prisma.payment.findMany(),
    ]);

    const totalFeesAssigned = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaymentsCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstandingBalance = Math.max(0, totalFeesAssigned - totalPaymentsCollected);

    const overdueStudents: any[] = [];
    const studentStatusCounts = {
      ENROLLED: 0,
      DEFERRED: 0,
      WITHDRAWN: 0,
      COMPLETED: 0,
    };

    students.forEach((s) => {
      if (studentStatusCounts[s.status as keyof typeof studentStatusCounts] !== undefined) {
        studentStatusCounts[s.status as keyof typeof studentStatusCounts]++;
      }

      const sTotalFees = s.fees.reduce((sum, f) => sum + f.amount, 0);
      const sTotalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
      const sBalance = Math.max(0, sTotalFees - sTotalPaid);

      const hasPastDueFee = s.fees.some(
        (f) => new Date(f.dueDate) < now && sBalance > 0
      );

      if (hasPastDueFee && sBalance > 0) {
        overdueStudents.push({
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          programme: s.programme.name,
          balance: sBalance,
        });
      }
    });

    const gradeBreakdown = {
      DISTINCTION: 0,
      MERIT: 0,
      PASS: 0,
      FAIL: 0,
    };
    let publishedGradesCount = 0;
    let withheldGradesCount = 0;

    grades.forEach((g) => {
      if (gradeBreakdown[g.classification as keyof typeof gradeBreakdown] !== undefined) {
        gradeBreakdown[g.classification as keyof typeof gradeBreakdown]++;
      }
      if (g.isPublished) {
        publishedGradesCount++;
      } else {
        withheldGradesCount++;
      }
    });

    const lateSubmissionsCount = submissions.filter((sub) => sub.isLate).length;

    return {
      overview: {
        totalStudents: students.length,
        statusCounts: studentStatusCounts,
        totalProgrammes: programmes.length,
        totalAssessments: assessments.length,
      },
      finances: {
        totalFeesAssigned,
        totalPaymentsCollected,
        totalOutstandingBalance,
        collectionRate:
          totalFeesAssigned > 0
            ? Math.round((totalPaymentsCollected / totalFeesAssigned) * 100)
            : 0,
        overdueCount: overdueStudents.length,
        overdueStudents: overdueStudents.slice(0, 5),
      },
      assessments: {
        totalAssessments: assessments.length,
        totalSubmissions: submissions.length,
        lateSubmissions: lateSubmissionsCount,
      },
      grades: {
        totalGraded: grades.length,
        published: publishedGradesCount,
        withheld: withheldGradesCount,
        breakdown: gradeBreakdown,
      },
    };
  } catch (error) {
    console.error("Error generating dashboard stats on server:", error);
    return null;
  }
}

/**
 * Server-side fetch of complete student list for Enrolment and Fees workflows
 */
export async function getStudentsFull() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        programme: {
          select: {
            id: true,
            code: true,
            name: true,
            standardFee: true,
          },
        },
        fees: true,
        payments: true,
        grades: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                moduleCode: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            assessmentId: true,
            submittedAt: true,
            isLate: true,
            version: true,
          },
        },
        extenuatingCircumstances: {
          include: {
            assessment: {
              select: {
                id: true,
                moduleCode: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();

    return students.map((s) => {
      const totalFees = s.fees.reduce((sum, f) => sum + f.amount, 0);
      const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = Math.max(0, totalFees - totalPaid);
      const isOverdue = s.fees.some(
        (f) => new Date(f.dueDate) < now && balance > 0
      );

      const academicStanding = calculateAcademicStanding(s.grades, false);

      return {
        ...s,
        financialSummary: {
          totalFees,
          totalPaid,
          balance,
          isOverdue,
        },
        academicStanding,
      };
    });
  } catch (error) {
    console.error("Error fetching students on server:", error);
    return [];
  }
}

/**
 * Server-side fetch of programmes
 */
export async function getProgrammesFull() {
  try {
    return await prisma.programme.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: {
            students: true,
            assessments: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching programmes on server:", error);
    return [];
  }
}

/**
 * Server-side fetch of Audit Logs
 */
export async function getAuditLogs(limit = 150) {
  try {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching audit logs on server:", error);
    return [];
  }
}
