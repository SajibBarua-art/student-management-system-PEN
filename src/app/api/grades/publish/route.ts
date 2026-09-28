import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gradeId, isPublished, assessmentId, publishAll } = body;

    const now = new Date();

    // Batch publish/withhold all grades for an assessment
    if (publishAll && assessmentId) {
      const updatedBatch = await prisma.grade.updateMany({
        where: { assessmentId },
        data: {
          isPublished: Boolean(isPublished),
          publishedAt: isPublished ? now : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully ${isPublished ? "published" : "withheld"} all ${updatedBatch.count} grades for this assessment.`,
        count: updatedBatch.count,
      });
    }

    // Single student grade publish/withhold toggle
    if (!gradeId) {
      return NextResponse.json(
        { success: false, error: "Grade ID is required." },
        { status: 400 }
      );
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        isPublished: Boolean(isPublished),
        publishedAt: isPublished ? now : null,
      },
      include: {
        assessment: true,
        student: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedGrade,
      message: `Result for ${updatedGrade.student.fullName} has been ${
        updatedGrade.isPublished ? "published" : "withheld"
      }.`,
    });
  } catch (error: any) {
    console.error("Error publishing grade:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update publication status" },
      { status: 500 }
    );
  }
}
