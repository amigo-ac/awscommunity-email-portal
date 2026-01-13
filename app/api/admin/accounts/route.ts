import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db, accounts, auditLogs } from "@/lib/db";
import { desc, like, eq, or, sql } from "drizzle-orm";
import { deleteGoogleWorkspaceUser } from "@/lib/google-admin";

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
          like(accounts.alternativeEmail, `%${search}%`),
          like(accounts.firstName, `%${search}%`)
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

// DELETE - Delete an account from Google Workspace and database
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, email } = body;

    if (!accountId || !email) {
      return NextResponse.json({ error: "Account ID and email are required" }, { status: 400 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

    // Verify account exists in local database
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete from Google Workspace first
    const workspaceResult = await deleteGoogleWorkspaceUser(email);

    if (!workspaceResult.success) {
      await db.insert(auditLogs).values({
        action: "account_delete_failed",
        actorEmail: session.user.email,
        details: {
          accountId,
          email,
          reason: "workspace_deletion_failed",
          error: workspaceResult.error,
        },
        ipAddress,
      });
      return NextResponse.json(
        { error: workspaceResult.error || "Failed to delete from Google Workspace" },
        { status: 500 }
      );
    }

    // Delete from local database
    await db.delete(accounts).where(eq(accounts.id, accountId));

    // Log the successful deletion
    await db.insert(auditLogs).values({
      action: "account_deleted",
      actorEmail: session.user.email,
      details: {
        accountId,
        email,
        accountData: existingAccount[0],
      },
      ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
