import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const programmes = await prisma.programme.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            students: true,
            assessments: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: programmes });
  } catch (error) {
    console.error("Failed to fetch programmes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve programmes" },
      { status: 500 }
    );
  }
}
