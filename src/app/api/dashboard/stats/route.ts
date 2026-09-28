import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
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

    // Financial summaries
    const totalFeesAssigned = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaymentsCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstandingBalance = Math.max(0, totalFeesAssigned - totalPaymentsCollected);

    // Compute student balances and identify overdue students
    const overdueStudents: any[] = [];
    const studentStatusCounts = {
      ENROLLED: 0,
      DEFERRED: 0,
      WITHDRAWN: 0,
      COMPLETED: 0,
    };

    students.forEach((s) => {
      if (studentStatusCounts[s.status] !== undefined) {
        studentStatusCounts[s.status]++;
      }

      const sTotalFees = s.fees.reduce((sum, f) => sum + f.amount, 0);
      const sTotalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
      const sBalance = Math.max(0, sTotalFees - sTotalPaid);

      const hasPastDueFee = s.fees.some(
        (f) => new Date(f.dueDate) < now && sBalance > 0
      );

      if (hasPastDueFee) {
        overdueStudents.push({
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          programme: s.programme.name,
          programmeCode: s.programme.code,
          balance: sBalance,
          fees: s.fees,
        });
      }
    });

    // Assessment stats
    const openAssessmentsCount = assessments.filter(
      (a) => new Date(a.deadline) >= now
    ).length;
    const closedAssessmentsCount = assessments.length - openAssessmentsCount;
    const lateSubmissionsCount = submissions.filter((s) => s.isLate).length;
    const publishedGradesCount = grades.filter((g) => g.isPublished).length;
    const pendingGradesCount = submissions.length - grades.length;

    return NextResponse.json({
      success: true,
      data: {
        students: {
          total: students.length,
          statusCounts: studentStatusCounts,
        },
        finances: {
          totalAssigned: totalFeesAssigned,
          totalCollected: totalPaymentsCollected,
          outstandingBalance: totalOutstandingBalance,
          overdueCount: overdueStudents.length,
          overdueStudents,
        },
        assessments: {
          total: assessments.length,
          open: openAssessmentsCount,
          closed: closedAssessmentsCount,
          totalSubmissions: submissions.length,
          lateSubmissions: lateSubmissionsCount,
        },
        grades: {
          total: grades.length,
          published: publishedGradesCount,
          withheld: grades.length - publishedGradesCount,
          pending: Math.max(0, pendingGradesCount),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compile dashboard metrics" },
      { status: 500 }
    );
  }
}
