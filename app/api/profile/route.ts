import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, accounts } from "@/lib/db";
import { eq } from "drizzle-orm";
import { uploadGoogleWorkspaceUserPhoto } from "@/lib/google-admin";

// GET - Fetch current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the account by the user's email
    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, session.user.email))
      .limit(1);

    if (account.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: account[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the account by the user's email
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, session.user.email))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      bio,
      location,
      company,
      jobTitle,
      profileImage,
      linkedin,
      twitter,
      github,
      instagram,
      facebook,
      youtube,
      website,
    } = body;

    // Upload profile image to Google Workspace if provided and changed
    let profileImageUrl = existingAccount[0].profileImageUrl;
    if (profileImage && profileImage !== existingAccount[0].profileImageUrl) {
      const photoResult = await uploadGoogleWorkspaceUserPhoto(
        session.user.email,
        profileImage
      );
      if (photoResult.success && photoResult.photoUrl) {
        profileImageUrl = photoResult.photoUrl;
      } else {
        console.error(`Failed to upload profile photo for ${session.user.email}`);
      }
    }

    // Update profile in database
    await db
      .update(accounts)
      .set({
        bio: bio ?? existingAccount[0].bio,
        location: location ?? existingAccount[0].location,
        company: company ?? existingAccount[0].company,
        jobTitle: jobTitle ?? existingAccount[0].jobTitle,
        profileImageUrl,
        linkedin: linkedin ?? existingAccount[0].linkedin,
        twitter: twitter ?? existingAccount[0].twitter,
        github: github ?? existingAccount[0].github,
        instagram: instagram ?? existingAccount[0].instagram,
        facebook: facebook ?? existingAccount[0].facebook,
        youtube: youtube ?? existingAccount[0].youtube,
        website: website ?? existingAccount[0].website,
      })
      .where(eq(accounts.email, session.user.email));

    // Fetch updated profile
    const updatedAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, session.user.email))
      .limit(1);

    return NextResponse.json({ success: true, profile: updatedAccount[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
