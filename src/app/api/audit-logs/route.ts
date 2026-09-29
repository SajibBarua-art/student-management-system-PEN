import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (entityType && entityType !== "ALL") where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve registry audit logs",
      },
      { status: 500 }
    );
  }
}
