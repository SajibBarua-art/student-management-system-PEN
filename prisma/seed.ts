import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:password@localhost:5433/sms_registry?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Registry database seed...");

  // Clean existing tables in reverse dependency order
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.programme.deleteMany();

  console.log("🧹 Cleared existing database records.");

  // 1. Create Programmes
  const bscCS = await prisma.programme.create({
    data: {
      code: "BSC-CS",
      name: "BSc (Hons) Computer Science",
      department: "School of Computing & Mathematical Sciences",
      standardFee: 9250.0,
      durationYears: 3,
      description:
        "Comprehensive undergraduate degree covering software engineering, algorithms, systems design, and AI.",
    },
  });

  const mscDSAI = await prisma.programme.create({
    data: {
      code: "MSC-DSAI",
      name: "MSc Data Science & Artificial Intelligence",
      department: "School of Computing & Mathematical Sciences",
      standardFee: 11500.0,
      durationYears: 1,
      description:
        "Postgraduate specialist degree in predictive modeling, deep neural networks, and big data engineering.",
    },
  });

  const mbaFT = await prisma.programme.create({
    data: {
      code: "MBA-FT",
      name: "Master of Business Administration",
      department: "School of Business & Management",
      standardFee: 14000.0,
      durationYears: 1,
      description:
        "Executive leadership and corporate management curriculum focusing on finance, strategy, and global operations.",
    },
  });

  console.log("✅ Seeded 3 programmes.");

  // 2. Create Assessments
  const pastDeadline = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const futureDeadline1 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
  const futureDeadline2 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
  const pastDeadline2 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  const asmCS102 = await prisma.assessment.create({
    data: {
      title: "Coursework 1: Algorithms & Data Structures",
      moduleCode: "CS102",
      moduleName: "Data Structures & Algorithms",
      programmeId: bscCS.id,
      deadline: pastDeadline,
      totalMarks: 100,
      academicYear: "2024/2025",
      description:
        "Design and analyze balanced search trees and graph shortest-path implementations with empirical benchmarking.",
    },
  });

  const asmCS105 = await prisma.assessment.create({
    data: {
      title: "Coursework 2: Full-Stack Web Development",
      moduleCode: "CS105",
      moduleName: "Web Technologies & Architecture",
      programmeId: bscCS.id,
      deadline: futureDeadline1,
      totalMarks: 100,
      academicYear: "2024/2025",
      description:
        "Develop an authenticated Next.js registry application with PostgreSQL persistence and upload PDF/DOCX documentation.",
    },
  });

  const asmDSAI501 = await prisma.assessment.create({
    data: {
      title: "Applied Machine Learning Case Study",
      moduleCode: "DSAI501",
      moduleName: "Machine Learning Principles",
      programmeId: mscDSAI.id,
      deadline: futureDeadline2,
      totalMarks: 100,
      academicYear: "2024/2025",
      description:
        "Train, validate, and interpret deep learning classifiers for biomedical datasets. Submit final PDF/DOCX report.",
    },
  });

  const asmMBA701 = await prisma.assessment.create({
    data: {
      title: "Strategic Financial Valuation & Thesis",
      moduleCode: "MBA701",
      moduleName: "Corporate Strategy & Finance",
      programmeId: mbaFT.id,
      deadline: pastDeadline2,
      totalMarks: 100,
      academicYear: "2024/2025",
      description:
        "Comprehensive DCF and M&A valuation case study evaluating cross-border enterprise acquisitions.",
    },
  });

  console.log("✅ Seeded 4 assessments.");

  // 3. Create Students with assigned fees, payments, submissions & grades
  // Student 1: Amina Rahman (Enrolled, BSC-CS, fully paid, Distinction grades published)
  const student1 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0001",
      fullName: "Amina Rahman",
      email: "amina.rahman@campus.ac.uk",
      dateOfBirth: new Date("2003-04-15"),
      academicYear: "2024/2025",
      status: "ENROLLED",
      programmeId: bscCS.id,
      fees: {
        create: {
          amount: 9250.0,
          description: "Annual Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          academicYear: "2024/2025",
        },
      },
      payments: {
        create: [
          {
            amount: 5000.0,
            paymentDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2024-00101",
            paymentMethod: "Bank Transfer",
            notes: "Term 1 installment",
          },
          {
            amount: 4250.0,
            paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2025-00142",
            paymentMethod: "Debit Card",
            notes: "Term 2 settlement in full",
          },
        ],
      },
    },
  });

  // Student 1 Submissions & Grades
  await prisma.submission.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student1.id,
      fileName: "Amina_Rahman_CS102_CW1.pdf",
      fileUrl: "/uploads/demo/Amina_Rahman_CS102_CW1.pdf",
      fileSize: 1048576, // 1MB
      mimeType: "application/pdf",
      submittedAt: new Date(pastDeadline.getTime() - 24 * 60 * 60 * 1000), // on time (1 day before)
      isLate: false,
      version: 1,
    },
  });

  await prisma.grade.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student1.id,
      numericGrade: 84.0,
      classification: "DISTINCTION",
      feedback:
        "Outstanding rigor in time-complexity analysis and comprehensive unit tests.",
      isPublished: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 2: Liam O'Connor (Enrolled, BSC-CS, overdue balance, late submission)
  const student2 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0002",
      fullName: "Liam O'Connor",
      email: "liam.oconnor@campus.ac.uk",
      dateOfBirth: new Date("2002-11-20"),
      academicYear: "2024/2025",
      status: "ENROLLED",
      programmeId: bscCS.id,
      fees: {
        create: {
          amount: 9250.0,
          description: "Annual Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Overdue!
          academicYear: "2024/2025",
        },
      },
      payments: {
        create: [
          {
            amount: 3000.0,
            paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2025-00215",
            paymentMethod: "Credit Card",
            notes: "Partial payment",
          },
        ],
      },
    },
  });

  // Student 2 submitted late (3 hours after deadline)
  await prisma.submission.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student2.id,
      fileName: "Liam_OConnor_Algorithms.docx",
      fileUrl: "/uploads/demo/Liam_OConnor_Algorithms.docx",
      fileSize: 856000,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      submittedAt: new Date(pastDeadline.getTime() + 3 * 60 * 60 * 1000), // late!
      isLate: true,
      version: 1,
      notes: "Submitted 3 hours post deadline due to connection timeout.",
    },
  });

  await prisma.grade.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student2.id,
      numericGrade: 64.0,
      classification: "MERIT",
      feedback:
        "Good algorithmic logic. 5-mark deduction applied for late submission as per university policy.",
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 3: Elena Rostova (Enrolled, MSC-DSAI, fully paid, Grade withheld / not published)
  const student3 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0003",
      fullName: "Elena Rostova",
      email: "elena.rostova@campus.ac.uk",
      dateOfBirth: new Date("2001-08-10"),
      academicYear: "2024/2025",
      status: "ENROLLED",
      programmeId: mscDSAI.id,
      fees: {
        create: {
          amount: 11500.0,
          description: "Postgraduate Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          academicYear: "2024/2025",
        },
      },
      payments: {
        create: [
          {
            amount: 11500.0,
            paymentDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2025-00309",
            paymentMethod: "Bank Transfer",
            notes: "Scholarship & personal funding wire",
          },
        ],
      },
    },
  });

  // Grade is graded but WITHHELD / unpublished by Registry Exam Board
  await prisma.grade.create({
    data: {
      assessmentId: asmDSAI501.id,
      studentId: student3.id,
      numericGrade: 76.0,
      classification: "DISTINCTION",
      feedback:
        "Impressive model ablation study. Result withheld pending final external examiner moderation.",
      isPublished: false, // WITHHELD! Student cannot see yet
      publishedAt: null,
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 4: Marcus Vance (DEFERRED, BSC-CS, deposit paid, remaining overdue)
  const student4 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0004",
      fullName: "Marcus Vance",
      email: "marcus.vance@campus.ac.uk",
      dateOfBirth: new Date("2002-02-03"),
      academicYear: "2024/2025",
      status: "DEFERRED",
      programmeId: bscCS.id,
      fees: {
        create: {
          amount: 9250.0,
          description: "Annual Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          academicYear: "2024/2025",
        },
      },
      payments: {
        create: [
          {
            amount: 1000.0,
            paymentDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2024-00088",
            paymentMethod: "Credit Card",
            notes: "Admission hold deposit",
          },
        ],
      },
    },
  });

  // Student 5: Zainab Al-Mansoor (COMPLETED, MBA-FT, fully paid, Distinction published)
  const student5 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0005",
      fullName: "Zainab Al-Mansoor",
      email: "zainab.mansoor@campus.ac.uk",
      dateOfBirth: new Date("2000-05-18"),
      academicYear: "2024/2025",
      status: "COMPLETED",
      programmeId: mbaFT.id,
      fees: {
        create: {
          amount: 14000.0,
          description: "MBA Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          academicYear: "2024/2025",
        },
      },
      payments: {
        create: [
          {
            amount: 14000.0,
            paymentDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
            referenceNumber: "TXN-2024-00045",
            paymentMethod: "Bank Transfer",
            notes: "Employer corporate sponsorship",
          },
        ],
      },
    },
  });

  await prisma.submission.create({
    data: {
      assessmentId: asmMBA701.id,
      studentId: student5.id,
      fileName: "Zainab_AlMansoor_MBA701_Valuation.pdf",
      fileUrl: "/uploads/demo/Zainab_AlMansoor_MBA701_Valuation.pdf",
      fileSize: 2450000,
      mimeType: "application/pdf",
      submittedAt: new Date(pastDeadline2.getTime() - 48 * 60 * 60 * 1000),
      isLate: false,
      version: 1,
    },
  });

  await prisma.grade.create({
    data: {
      assessmentId: asmMBA701.id,
      studentId: student5.id,
      numericGrade: 88.0,
      classification: "DISTINCTION",
      feedback:
        "Exemplary corporate valuation analysis with outstanding risk sensitivity matrices.",
      isPublished: true,
      publishedAt: new Date(pastDeadline2.getTime() + 10 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(pastDeadline2.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 6: David Chen (ENROLLED, BSC-CS, Unpaid/Overdue, Failed grade published)
  const student6 = await prisma.student.create({
    data: {
      studentId: "SMS-2025-0006",
      fullName: "David Chen",
      email: "david.chen@campus.ac.uk",
      dateOfBirth: new Date("2004-01-25"),
      academicYear: "2024/2025",
      status: "ENROLLED",
      programmeId: bscCS.id,
      fees: {
        create: {
          amount: 9250.0,
          description: "Annual Tuition Fee 2024/2025",
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Overdue!
          academicYear: "2024/2025",
        },
      },
    },
  });

  await prisma.submission.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student6.id,
      fileName: "David_Chen_CS102_CW1.pdf",
      fileUrl: "/uploads/demo/David_Chen_CS102_CW1.pdf",
      fileSize: 720000,
      mimeType: "application/pdf",
      submittedAt: new Date(pastDeadline.getTime() - 10 * 60 * 60 * 1000),
      isLate: false,
      version: 1,
    },
  });

  await prisma.grade.create({
    data: {
      assessmentId: asmCS102.id,
      studentId: student6.id,
      numericGrade: 34.0,
      classification: "FAIL",
      feedback:
        "Incomplete algorithmic implementations; failing test cases on red-black tree rebalancing. Resit required.",
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seeded 6 students with full fees, payments, submissions & grades.");
  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
