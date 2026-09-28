import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const fees = await prisma.studentFee.findMany({
      where,
      orderBy: { dueDate: "asc" },
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

    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve fee records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, amount, description, dueDate, academicYear } = body;

    if (!studentId || !amount || !description || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Student, amount, description, and due date are required." },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found." },
        { status: 404 }
      );
    }

    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        description: description.trim(),
        dueDate: new Date(dueDate),
        academicYear: academicYear || student.academicYear,
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error: any) {
    console.error("Error assigning fee:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign fee" },
      { status: 500 }
    );
  }
}
