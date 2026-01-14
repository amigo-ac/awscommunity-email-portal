import { NextRequest, NextResponse } from "next/server";
import { db, tokens, auditLogs, communityTypes } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { tokenValidationRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit by IP
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(tokenValidationRateLimit, clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, token } = body;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

    // Validate input
    if (!type || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!communityTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid community type" }, { status: 400 });
    }

    // Get the stored token hash for this type
    const storedToken = await db
      .select()
      .from(tokens)
      .where(eq(tokens.type, type))
      .limit(1);

    if (!storedToken.length) {
      // Log failed attempt
      await db.insert(auditLogs).values({
        action: "token_validation_failed",
        actorEmail: "anonymous",
        details: { type, reason: "no_token_configured" },
        ipAddress,
      });
      return NextResponse.json({ valid: false });
    }

    // Compare the provided token with the stored hash
    const isValid = await bcrypt.compare(token, storedToken[0].tokenHash);

    // Log the attempt
    await db.insert(auditLogs).values({
      action: isValid ? "token_validation_success" : "token_validation_failed",
      actorEmail: "anonymous",
      details: { type },
      ipAddress,
    });

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
