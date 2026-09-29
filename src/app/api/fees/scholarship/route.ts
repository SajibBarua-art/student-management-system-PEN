import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, scholarshipName, amount, feeType, notes } = body;

    if (!studentId || !scholarshipName || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: "studentId, scholarshipName, and amount are required",
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    const numAmount = Math.abs(parseFloat(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // A scholarship or fee waiver is recorded as a negative fee amount to deduct from total liability
    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        amount: -numAmount,
        description: `${scholarshipName.trim()}${notes ? ` — ${notes.trim()}` : ""}`,
        feeType: feeType === "HARDSHIP_BURSARY" ? "HARDSHIP_BURSARY" : "SCHOLARSHIP_WAIVER",
        dueDate: new Date(),
        academicYear: student.academicYear,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully awarded ${scholarshipName} of $${numAmount.toLocaleString()} to ${student.fullName}.`,
      data: fee,
    });
  } catch (error: any) {
    console.error("Error awarding scholarship:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to award scholarship",
      },
      { status: 500 }
    );
  }
}
