import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db, auditLogs } from "@/lib/db";
import { desc, like, eq, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (search) {
      conditions.push(like(auditLogs.actorEmail, `%${search}%`));
    }
    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined);

    // Get logs with pagination
    let query = db.select().from(auditLogs);

    if (conditions.length === 1) {
      query = query.where(conditions[0]) as typeof query;
    }

    const result = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unique actions for filter
    const actions = await db
      .selectDistinct({ action: auditLogs.action })
      .from(auditLogs);

    return NextResponse.json({
      logs: result,
      total: countResult?.count ?? 0,
      page,
      totalPages: Math.ceil((countResult?.count ?? 0) / limit),
      actions: actions.map((a) => a.action),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
