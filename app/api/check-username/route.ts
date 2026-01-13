import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, accounts, emailPrefixes, communityTypes, type CommunityType } from "@/lib/db";
import { eq } from "drizzle-orm";

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "awscommunity.mx";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, username } = body;

    // Validate input
    if (!type || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!communityTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid community type" }, { status: 400 });
    }

    // Validate username format (only lowercase letters and numbers)
    if (!/^[a-z0-9]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: "Username can only contain lowercase letters and numbers"
      });
    }

    // Check minimum length
    if (username.length < 2) {
      return NextResponse.json({
        available: false,
        error: "Username must be at least 2 characters"
      });
    }

    // Build the full email address
    const prefix = emailPrefixes[type as CommunityType];
    const fullEmail = `${prefix}${username}@${EMAIL_DOMAIN}`;

    // Check if the email already exists in our database
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, fullEmail))
      .limit(1);

    if (existingAccount.length > 0) {
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
