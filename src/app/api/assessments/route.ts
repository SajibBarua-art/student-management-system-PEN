import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const programmeId = searchParams.get("programmeId");

    const where: any = {};
    if (programmeId) where.programmeId = programmeId;

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { deadline: "asc" },
      include: {
        programme: {
          select: { id: true, code: true, name: true },
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();

    const formatted = assessments.map((asm) => {
      const isDeadlinePassed = new Date(asm.deadline) < now;
      const totalSubmissions = asm.submissions.length;
      const lateSubmissions = asm.submissions.filter((s) => s.isLate).length;
      const gradedCount = asm.grades.length;
      const publishedCount = asm.grades.filter((g) => g.isPublished).length;

      return {
        ...asm,
        isDeadlinePassed,
        stats: {
          totalSubmissions,
          lateSubmissions,
          gradedCount,
          publishedCount,
        },
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve assessments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      moduleCode,
      moduleName,
      deadline,
      description,
      programmeId,
      totalMarks,
      academicYear,
    } = body;

    if (!title || !moduleCode || !moduleName || !deadline) {
      return NextResponse.json(
        { success: false, error: "Title, module code, module name, and deadline are required." },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        title: title.trim(),
        moduleCode: moduleCode.trim().toUpperCase(),
        moduleName: moduleName.trim(),
        deadline: new Date(deadline),
        description: description?.trim() || null,
        programmeId: programmeId || null,
        totalMarks: totalMarks ? parseInt(totalMarks, 10) : 100,
        academicYear: academicYear || "2024/2025",
      },
      include: {
        programme: true,
      },
    });

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create assessment" },
      { status: 500 }
    );
  }
}
