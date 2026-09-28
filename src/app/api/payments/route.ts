import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateTransactionReference } from "@/lib/student-id";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            programme: { select: { code: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve payments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      amount,
      paymentDate,
      referenceNumber,
      paymentMethod,
      notes,
    } = body;

    if (!studentId || !amount) {
      return NextResponse.json(
        { success: false, error: "Student ID and payment amount are required." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be a positive number." },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { fees: true, payments: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student record not found." },
        { status: 404 }
      );
    }

    // Reference number generation or deduplication check
    const finalRef =
      referenceNumber?.trim() || generateTransactionReference();

    const existingRef = await prisma.payment.findUnique({
      where: { referenceNumber: finalRef },
    });
    if (existingRef) {
      return NextResponse.json(
        { success: false, error: `Transaction reference '${finalRef}' already exists.` },
        { status: 409 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: parsedAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        referenceNumber: finalRef,
        paymentMethod: paymentMethod?.trim() || "Bank Transfer",
        notes: notes?.trim() || null,
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
          },
        },
      },
    });

    // Compute updated balance
    const totalFees = student.fees.reduce((sum, f) => sum + f.amount, 0);
    const updatedTotalPaid =
      student.payments.reduce((sum, p) => sum + p.amount, 0) + parsedAmount;
    const newBalance = Math.max(0, totalFees - updatedTotalPaid);

    return NextResponse.json(
      {
        success: true,
        data: payment,
        balanceInfo: {
          totalFees,
          totalPaid: updatedTotalPaid,
          outstandingBalance: newBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record payment transaction" },
      { status: 500 }
    );
  }
}
