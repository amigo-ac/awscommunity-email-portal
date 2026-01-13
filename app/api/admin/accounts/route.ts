import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db, accounts } from "@/lib/db";
import { desc, like, eq, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(accounts.email, `%${search}%`),
          like(accounts.creatorGmail, `%${search}%`)
        )
      );
    }
    if (type) {
      conditions.push(eq(accounts.type, type));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(accounts)
      .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined);

    // Get accounts with pagination
    let query = db.select().from(accounts);

    if (conditions.length === 1) {
      query = query.where(conditions[0]) as typeof query;
    }

    const result = await query
      .orderBy(desc(accounts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      accounts: result,
      total: countResult?.count ?? 0,
      page,
      totalPages: Math.ceil((countResult?.count ?? 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
