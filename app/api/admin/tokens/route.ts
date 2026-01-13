import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db, tokens, auditLogs, communityTypes, communityLabels, type CommunityType } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET - List all tokens
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allTokens = await db.select().from(tokens);

    // Return tokens info without the hash, and include missing types
    const tokenMap = new Map(allTokens.map((t) => [t.type, t]));

    const result = communityTypes.map((type) => {
      const existingToken = tokenMap.get(type);
      return {
        type,
        label: communityLabels[type as CommunityType],
        configured: !!existingToken,
        updatedAt: existingToken?.updatedAt,
      };
    });

    return NextResponse.json({ tokens: result });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or regenerate a token
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (!type || !communityTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid community type" }, { status: 400 });
    }

    // Generate a new random token
    const newToken = crypto.randomBytes(16).toString("hex");
    const tokenHash = await bcrypt.hash(newToken, 10);

    // Check if token exists for this type
    const existingToken = await db
      .select()
      .from(tokens)
      .where(eq(tokens.type, type))
      .limit(1);

    if (existingToken.length > 0) {
      // Update existing token
      await db
        .update(tokens)
        .set({ tokenHash, updatedAt: new Date() })
        .where(eq(tokens.type, type));
    } else {
      // Create new token
      await db.insert(tokens).values({
        type,
        tokenHash,
      });
    }

    // Log the action
    await db.insert(auditLogs).values({
      action: existingToken.length > 0 ? "token_regenerated" : "token_created",
      actorEmail: session.user.email,
      details: { type },
    });

    return NextResponse.json({
      success: true,
      token: newToken, // Return the plain text token (only time it's visible)
      type,
    });
  } catch (error) {
    console.error("Error creating/regenerating token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
