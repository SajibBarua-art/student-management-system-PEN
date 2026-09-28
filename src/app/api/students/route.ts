import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateNextStudentId } from "@/lib/student-id";
import { EnrolmentStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") as EnrolmentStatus | null;
    const programmeId = searchParams.get("programmeId");
    const overdueOnly = searchParams.get("overdueOnly") === "true";

    // Build Prisma where filter
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { studentId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["ENROLLED", "DEFERRED", "WITHDRAWN", "COMPLETED"].includes(status)) {
      where.status = status;
    }

    if (programmeId) {
      where.programmeId = programmeId;
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        programme: {
          select: {
            id: true,
            code: true,
            name: true,
            standardFee: true,
          },
        },
        fees: true,
        payments: true,
        grades: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                moduleCode: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            assessmentId: true,
            isLate: true,
            submittedAt: true,
          },
        },
      },
    });

    const now = new Date();

    // Compute real-time balances and overdue flags
    const processedStudents = students.map((student) => {
      const totalFees = student.fees.reduce((sum, f) => sum + f.amount, 0);
      const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = Math.max(0, totalFees - totalPaid);

      // Check if any fee is past due date and remaining balance exists
      const hasOverdueFee = student.fees.some(
        (f) => new Date(f.dueDate) < now && balance > 0
      );

      return {
        ...student,
        totalFees,
        totalPaid,
        balance,
        isOverdue: hasOverdueFee,
      };
    });

    const filtered = overdueOnly
      ? processedStudents.filter((s) => s.isOverdue)
      : processedStudents;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve student records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, dateOfBirth, programmeId, academicYear, status } = body;

    // Validation
    if (!fullName || !email || !dateOfBirth || !programmeId || !academicYear) {
      return NextResponse.json(
        { success: false, error: "All student fields are required." },
        { status: 400 }
      );
    }

    // Check unique email
    const existing = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A student with this email address already exists." },
        { status: 409 }
      );
    }

    // Verify programme
    const programme = await prisma.programme.findUnique({
      where: { id: programmeId },
    });
    if (!programme) {
      return NextResponse.json(
        { success: false, error: "Selected programme does not exist." },
        { status: 404 }
      );
    }

    // Generate unique Student ID: SMS-YYYY-XXXX
    const studentId = await generateNextStudentId();

    // Default fee due date 30 days from enrolment
    const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create student and automatically assign initial programme fee
    const newStudent = await prisma.student.create({
      data: {
        studentId,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        dateOfBirth: new Date(dateOfBirth),
        academicYear: academicYear.trim(),
        status: status || "ENROLLED",
        programmeId,
        fees: {
          create: {
            amount: programme.standardFee,
            description: `Annual Tuition Fee ${academicYear}`,
            dueDate: defaultDueDate,
            academicYear: academicYear.trim(),
          },
        },
      },
      include: {
        programme: true,
        fees: true,
        payments: true,
      },
    });

    const totalFees = newStudent.fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = 0;
    const balance = totalFees;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newStudent,
          totalFees,
          totalPaid,
          balance,
          isOverdue: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create student record" },
      { status: 500 }
    );
  }
}
