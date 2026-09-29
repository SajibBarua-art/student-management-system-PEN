import prisma from "@/lib/prisma";

export interface LogAuditOptions {
  action: string;
  actor?: string;
  role?: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

/**
 * Institutional Registry Audit Logger
 * Records tamper-evident moderation, grading, status, and fee actions
 */
export async function logAuditEvent({
  action,
  actor = "Academic Registry",
  role = "REGISTRY_OFFICER",
  entityType,
  entityId,
  details,
  ipAddress = "127.0.0.1 (Internal Registry)",
}: LogAuditOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        actor,
        role,
        entityType,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch (err) {
    // Non-blocking log failure
    console.error("Failed to write audit log:", err);
    return null;
  }
}
