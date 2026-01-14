import { NextRequest, NextResponse } from "next/server";
import { db, tokens, accounts, auditLogs, emailPrefixes, communityTypes, type CommunityType } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  createGoogleWorkspaceUser,
  checkGoogleWorkspaceUserExists,
  sendConfirmationEmail,
  addUserToGroup,
  getGroupEmail,
  formatGoogleWorkspaceName,
  getOrganizationalUnit,
  uploadGoogleWorkspaceUserPhoto,
} from "@/lib/google-admin";
import { registrationRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "awscommunity.mx";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit by IP
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(registrationRateLimit, clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const {
      type,
      username,
      token,
      firstName,
      lastName,
      phone,
      alternativeEmail,
      // Profile fields
      bio,
      location,
      company,
      jobTitle,
      profileImage,
      // Social networks
      linkedin,
      twitter,
      github,
      instagram,
      facebook,
      youtube,
      website,
    } = body;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

    // Validate input
    if (!type || !username || !token || !firstName || !alternativeEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For CB and Hero, lastName is required
    if ((type === "cb" || type === "hero") && !lastName) {
      return NextResponse.json({ error: "Last name is required for this community type" }, { status: 400 });
    }

    if (!communityTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid community type" }, { status: 400 });
    }

    // Validate username format
    if (!/^[a-z0-9]+$/.test(username) || username.length < 2) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternativeEmail)) {
      return NextResponse.json({ error: "Invalid alternative email format" }, { status: 400 });
    }

    // Verify token again
    const storedToken = await db
      .select()
      .from(tokens)
      .where(eq(tokens.type, type))
      .limit(1);

    if (!storedToken.length) {
      await db.insert(auditLogs).values({
        action: "registration_failed",
        actorEmail: alternativeEmail,
        details: { type, username, reason: "no_token_configured" },
        ipAddress,
      });
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const isTokenValid = await bcrypt.compare(token, storedToken[0].tokenHash);
    if (!isTokenValid) {
      await db.insert(auditLogs).values({
        action: "registration_failed",
        actorEmail: alternativeEmail,
        details: { type, username, reason: "invalid_token" },
        ipAddress,
      });
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Build full email
    const prefix = emailPrefixes[type as CommunityType];
    const fullEmail = `${prefix}${username}@${EMAIL_DOMAIN}`;

    // Check if email already exists in our database
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, fullEmail))
      .limit(1);

    if (existingAccount.length > 0) {
      await db.insert(auditLogs).values({
        action: "registration_failed",
        actorEmail: alternativeEmail,
        details: { type, username, fullEmail, reason: "email_exists_in_db" },
        ipAddress,
      });
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Check if user exists in Google Workspace
    const existsInWorkspace = await checkGoogleWorkspaceUserExists(fullEmail);
    if (existsInWorkspace) {
      await db.insert(auditLogs).values({
        action: "registration_failed",
        actorEmail: alternativeEmail,
        details: { type, username, fullEmail, reason: "email_exists_in_workspace" },
        ipAddress,
      });
      return NextResponse.json({ error: "Email already exists in workspace" }, { status: 400 });
    }

    // Format the Google Workspace display name based on community type
    const { givenName, familyName, displayName } = formatGoogleWorkspaceName(
      type as CommunityType,
      firstName,
      lastName
    );

    // Get the organizational unit path for this community type
    const orgUnitPath = getOrganizationalUnit(type);

    // Create user in Google Workspace with organizational unit
    const result = await createGoogleWorkspaceUser(fullEmail, givenName, familyName, orgUnitPath || undefined);

    if (!result.success) {
      await db.insert(auditLogs).values({
        action: "registration_failed",
        actorEmail: alternativeEmail,
        details: { type, username, fullEmail, reason: "workspace_creation_failed", error: result.error },
        ipAddress,
      });
      return NextResponse.json({ error: result.error || "Failed to create email" }, { status: 500 });
    }

    // Add user to the corresponding community group
    const groupEmail = getGroupEmail(type);
    let addedToGroup = false;
    if (groupEmail) {
      const groupResult = await addUserToGroup(fullEmail, groupEmail);
      addedToGroup = groupResult.success;
      if (!groupResult.success) {
        console.error(`Failed to add ${fullEmail} to group ${groupEmail}`);
      }
    }

    // Upload profile image to Google Workspace and get the processed version back
    let storedProfileImage: string | null = null;
    if (profileImage) {
      const photoResult = await uploadGoogleWorkspaceUserPhoto(fullEmail, profileImage);
      if (photoResult.success && photoResult.photoData) {
        storedProfileImage = photoResult.photoData; // Store Google's processed version
      } else {
        console.error(`Failed to upload profile photo to Google Workspace for ${fullEmail}`);
        storedProfileImage = profileImage; // Fallback to original
      }
    }

    // Save to our database
    await db.insert(accounts).values({
      email: fullEmail,
      type,
      username,
      firstName,
      lastName: lastName || "",
      phone: phone || null,
      alternativeEmail,
      googleDisplayName: displayName,
      // Profile fields
      bio: bio || null,
      location: location || null,
      company: company || null,
      jobTitle: jobTitle || null,
      profileImage: storedProfileImage, // Store synced from Google
      // Social networks
      linkedin: linkedin || null,
      twitter: twitter || null,
      github: github || null,
      instagram: instagram || null,
      facebook: facebook || null,
      youtube: youtube || null,
      website: website || null,
    });

    // Log success
    await db.insert(auditLogs).values({
      action: "registration_success",
      actorEmail: alternativeEmail,
      details: { type, username, fullEmail, addedToGroup, groupEmail, displayName, orgUnitPath },
      ipAddress,
    });

    // Send confirmation email to the alternative email (don't fail if this fails)
    await sendConfirmationEmail(alternativeEmail, fullEmail, result.tempPassword!);

    return NextResponse.json({
      success: true,
      email: fullEmail,
      tempPassword: result.tempPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
