import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getGradeClassification } from "@/lib/grade-classification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");
    const studentId = searchParams.get("studentId");
    const publishedOnly = searchParams.get("publishedOnly") === "true";

    const where: any = {};
    if (assessmentId) where.assessmentId = assessmentId;
    if (studentId) where.studentId = studentId;
    if (publishedOnly) where.isPublished = true;

    const grades = await prisma.grade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            moduleCode: true,
            moduleName: true,
            totalMarks: true,
            academicYear: true,
          },
        },
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            programme: {
              select: { code: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve grade records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assessmentId,
      studentId,
      numericGrade,
      feedback,
      isPublished = false,
    } = body;

    if (!assessmentId || !studentId || numericGrade === undefined || numericGrade === null) {
      return NextResponse.json(
        { success: false, error: "Assessment ID, student ID, and numeric grade are required." },
        { status: 400 }
      );
    }

    const score = parseFloat(numericGrade);
    if (isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: "Numeric grade must be a number between 0 and 100." },
        { status: 400 }
      );
    }

    // Auto-calculate classification
    const classification = getGradeClassification(score);
    const now = new Date();

    const grade = await prisma.grade.upsert({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId,
        },
      },
      update: {
        numericGrade: score,
        classification,
        feedback: feedback?.trim() || null,
        isPublished: Boolean(isPublished),
        publishedAt: isPublished ? now : null,
        gradedAt: now,
      },
      create: {
        assessmentId,
        studentId,
        numericGrade: score,
        classification,
        feedback: feedback?.trim() || null,
        isPublished: Boolean(isPublished),
        publishedAt: isPublished ? now : null,
        gradedAt: now,
      },
      include: {
        assessment: true,
        student: true,
      },
    });

    return NextResponse.json({ success: true, data: grade }, { status: 200 });
  } catch (error: any) {
    console.error("Error entering grade:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record grade" },
      { status: 500 }
    );
  }
}
