import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const assessmentId = searchParams.get("assessmentId");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (assessmentId) where.assessmentId = assessmentId;

    const claims = await prisma.extenuatingCircumstance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            moduleCode: true,
            title: true,
            deadline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: claims });
  } catch (error) {
    console.error("Error fetching extenuating circumstances:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch EC claims" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, assessmentId, reason, explanation, requestedExtensionDays } = body;

    if (!studentId || !assessmentId || !explanation) {
      return NextResponse.json(
        { success: false, error: "Student ID, assessment ID, and explanation are required." },
        { status: 400 }
      );
    }

    // Upsert or create EC claim
    const claim = await prisma.extenuatingCircumstance.upsert({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId,
        },
      },
      update: {
        reason: reason || "MEDICAL",
        explanation: explanation.trim(),
        requestedExtensionDays: requestedExtensionDays ? parseInt(requestedExtensionDays, 10) : 7,
        status: "PENDING",
      },
      create: {
        studentId,
        assessmentId,
        reason: reason || "MEDICAL",
        explanation: explanation.trim(),
        requestedExtensionDays: requestedExtensionDays ? parseInt(requestedExtensionDays, 10) : 7,
        status: "PENDING",
      },
      include: {
        assessment: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Extenuating Circumstances claim lodged successfully for Examination Board review.",
        data: claim,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting EC claim:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit EC claim" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, staffNotes, reviewedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Claim ID and status (APPROVED/REJECTED) are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.extenuatingCircumstance.update({
      where: { id },
      data: {
        status,
        staffNotes: staffNotes?.trim() || null,
        reviewedBy: reviewedBy || "Registry Examination Board",
        reviewedAt: new Date(),
      },
      include: {
        student: true,
        assessment: true,
      },
    });

    await logAuditEvent({
      action: status === "APPROVED" ? "EC_CLAIM_APPROVED" : "EC_CLAIM_REJECTED",
      actor: reviewedBy || "Registry Examination Board",
      role: "EXAM_BOARD",
      entityType: "EXTENUATING_CIRCUMSTANCE",
      entityId: updated.id,
      details: `Extenuating circumstances claim ${status} for ${updated.student.fullName} (${updated.student.studentId}) on ${updated.assessment.moduleCode}: ${updated.assessment.title} (Grounds: ${updated.reason}). ${status === "APPROVED" ? "Late penalty formally waived." : "Penalty remains in effect."}`,
    });

    return NextResponse.json({
      success: true,
      message: `Extenuating Circumstance claim ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error reviewing EC claim:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update EC claim" },
      { status: 500 }
    );
  }
}
