import prisma from "./prisma";
export { generateTransactionReference } from "./transaction-ref";

/**
 * Auto-generates a unique Student ID in format SMS-YYYY-XXXX (e.g., SMS-2025-0001)
 * Used on the server in API routes.
 */
export async function generateNextStudentId(year?: number): Promise<string> {
  const currentYear = year || new Date().getFullYear();
  const prefix = `SMS-${currentYear}-`;

  const latestStudent = await prisma.student.findFirst({
    where: {
      studentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      studentId: "desc",
    },
    select: {
      studentId: true,
    },
  });

  if (!latestStudent) {
    return `${prefix}0001`;
  }

  const parts = latestStudent.studentId.split("-");
  const lastNumber = parseInt(parts[2] || "0", 10);
  const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
  const padded = String(nextNumber).padStart(4, "0");

  return `${prefix}${padded}`;
}
