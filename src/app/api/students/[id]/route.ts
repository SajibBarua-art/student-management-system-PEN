import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateAcademicStanding } from "@/lib/academic-engine";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        programme: true,
        fees: {
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        submissions: {
          include: {
            assessment: true,
          },
          orderBy: { submittedAt: "desc" },
        },
        grades: {
          include: {
            assessment: true,
          },
          orderBy: { createdAt: "desc" },
        },
        extenuatingCircumstances: {
          include: {
            assessment: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student record not found" },
        { status: 404 }
      );
    }

    const totalFees = student.fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, totalFees - totalPaid);

    const now = new Date();
    const isOverdue = student.fees.some(
      (f) => new Date(f.dueDate) < now && balance > 0
    );

    const academicStanding = calculateAcademicStanding(student.grades, true);
    const internalAcademicStanding = calculateAcademicStanding(student.grades, false);

    return NextResponse.json({
      success: true,
      data: {
        ...student,
        totalFees,
        totalPaid,
        balance,
        isOverdue,
        academicStanding,
        internalAcademicStanding,
      },
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, fullName, email, academicYear, programmeId } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (academicYear) updateData.academicYear = academicYear.trim();
    if (programmeId) updateData.programmeId = programmeId;

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        programme: true,
        fees: true,
        payments: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.student.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Student record deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student record" },
      { status: 500 }
    );
  }
}
