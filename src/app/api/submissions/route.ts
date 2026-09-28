import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/octet-stream", // Some browsers/OS report octet-stream for docx
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (assessmentId) where.assessmentId = assessmentId;
    if (studentId) where.studentId = studentId;

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            moduleCode: true,
            deadline: true,
          },
        },
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const studentId = formData.get("studentId") as string | null;
    const assessmentId = formData.get("assessmentId") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!file || !studentId || !assessmentId) {
      return NextResponse.json(
        { success: false, error: "File, student ID, and assessment ID are required." },
        { status: 400 }
      );
    }

    // Validate assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment does not exist." },
        { status: 404 }
      );
    }

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student does not exist." },
        { status: 404 }
      );
    }

    // Validate file extension
    const originalName = file.name;
    const fileExt = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type '${fileExt}'. Only PDF (.pdf) and Word documents (.docx, .doc) are permitted.`,
        },
        { status: 400 }
      );
    }

    // Check MIME type
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `MIME type '${file.type}' is not supported. Please upload a PDF or DOCX file.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const isPastDeadline = now > new Date(assessment.deadline);

    // Check if student already submitted for this assessment
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId,
        },
      },
    });

    if (existingSubmission) {
      // If student already submitted and deadline is passed: reject resubmission
      if (isPastDeadline) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The submission deadline has passed. Resubmission is only permitted before the deadline.",
          },
          { status: 403 }
        );
      }
    }

    // Save file to disk in public/uploads/submissions
    const uploadDir = path.resolve(process.cwd(), "public/uploads/submissions");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const safeBaseName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.[^/.]+$/, "");
    const fileName = `${student.studentId}_${assessment.moduleCode}_${Date.now()}_${safeBaseName}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/submissions/${fileName}`;

    let resultSubmission;

    if (existingSubmission) {
      // Update existing submission (resubmission before deadline)
      resultSubmission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileName: originalName,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          submittedAt: now,
          isLate: false, // resubmission occurred before deadline
          version: existingSubmission.version + 1,
          notes: notes?.trim() || existingSubmission.notes,
        },
        include: {
          assessment: true,
          student: true,
        },
      });
    } else {
      // First-time submission (can be late if deadline passed)
      resultSubmission = await prisma.submission.create({
        data: {
          assessmentId,
          studentId,
          fileName: originalName,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          submittedAt: now,
          isLate: isPastDeadline, // visually flagged late if after deadline
          version: 1,
          notes: notes?.trim() || null,
        },
        include: {
          assessment: true,
          student: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: resultSubmission,
        isResubmission: !!existingSubmission,
        isLate: resultSubmission.isLate,
        message: existingSubmission
          ? `Submission updated successfully (Version ${resultSubmission.version}).`
          : resultSubmission.isLate
          ? "Assessment submitted successfully. Note: Marked as LATE submission as deadline has passed."
          : "Assessment submitted successfully on time.",
      },
      { status: existingSubmission ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Error handling submission upload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process file submission" },
      { status: 500 }
    );
  }
}
