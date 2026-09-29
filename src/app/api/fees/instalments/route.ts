import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        programme: true,
        fees: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if instalments already exist
    const hasExistingInstalments = student.fees.some(
      (f) => f.feeType === "INSTALMENT_TRANCHE"
    );
    if (hasExistingInstalments) {
      return NextResponse.json(
        {
          success: false,
          error: "An active instalment plan is already configured for this student.",
        },
        { status: 400 }
      );
    }

    // Calculate base total tuition (either from existing TUITION fee or programme standardFee)
    const existingTuitionFee = student.fees.find(
      (f) => f.feeType === "TUITION" && f.amount > 0
    );
    const baseAmount =
      existingTuitionFee?.amount || student.programme?.standardFee || 9000;

    // Delete the single flat tuition fee to replace with 3 tranches
    if (existingTuitionFee) {
      await prisma.studentFee.delete({
        where: { id: existingTuitionFee.id },
      });
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    // 3 Institutional Tranches (40% / 30% / 30%)
    const tranche1 = Math.round(baseAmount * 0.4);
    const tranche2 = Math.round(baseAmount * 0.3);
    const tranche3 = baseAmount - tranche1 - tranche2; // Remainder to avoid rounding drift

    const dueDates = [
      new Date(currentYear, 9, 15), // Oct 15 (Term 1 Autumn)
      new Date(currentYear + 1, 0, 15), // Jan 15 (Term 2 Spring)
      new Date(currentYear + 1, 3, 15), // Apr 15 (Term 3 Summer)
    ];

    const tranches = await prisma.$transaction([
      prisma.studentFee.create({
        data: {
          studentId,
          amount: tranche1,
          description: `Tuition Instalment Tranche 1 (Autumn Term — 40%)`,
          feeType: "INSTALMENT_TRANCHE",
          dueDate: dueDates[0],
          academicYear: student.academicYear,
        },
      }),
      prisma.studentFee.create({
        data: {
          studentId,
          amount: tranche2,
          description: `Tuition Instalment Tranche 2 (Spring Term — 30%)`,
          feeType: "INSTALMENT_TRANCHE",
          dueDate: dueDates[1],
          academicYear: student.academicYear,
        },
      }),
      prisma.studentFee.create({
        data: {
          studentId,
          amount: tranche3,
          description: `Tuition Instalment Tranche 3 (Summer Term — 30%)`,
          feeType: "INSTALMENT_TRANCHE",
          dueDate: dueDates[2],
          academicYear: student.academicYear,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "3-Tranche institutional instalment plan generated successfully.",
      data: tranches,
    });
  } catch (error: any) {
    console.error("Error creating instalment plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate instalment plan",
      },
      { status: 500 }
    );
  }
}
