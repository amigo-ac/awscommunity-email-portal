import { google } from "googleapis";
import { type CommunityType } from "@/lib/db";

// Group email addresses for each community type
const communityGroups: Record<string, string> = {
  cc: "cloudclubs@awscommunity.mx",
  ug: "usergroups@awscommunity.mx",
  cb: "communitybuilders@awscommunity.mx",
  hero: "heroes@awscommunity.mx",
};

// Organizational Unit paths for each community type
const organizationalUnits: Record<string, string> = {
  cc: "/Asociación Mexicana para la Innovación y Gestión de Oportunidades, A.C./AWS Community México/AWS Cloud Clubs",
  ug: "/Asociación Mexicana para la Innovación y Gestión de Oportunidades, A.C./AWS Community México/AWS User Groups",
  cb: "/Asociación Mexicana para la Innovación y Gestión de Oportunidades, A.C./AWS Community México/AWS Community Builders",
  hero: "/Asociación Mexicana para la Innovación y Gestión de Oportunidades, A.C./AWS Community México/AWS Heroes",
};

// Get organizational unit path for a community type
export function getOrganizationalUnit(communityType: string): string | null {
  return organizationalUnits[communityType] || null;
}

// Format Google Workspace name based on community type
// CC: "AWS Cloud Club at {name}" + "(México)"
// UG: "AWS User Group {name}" + "(México)"
// CB: "{FirstName}" + "{LastName} (Community Builder)"
// Hero: "{FirstName}" + "{LastName} (AWS Hero)"
export function formatGoogleWorkspaceName(
  type: CommunityType,
  firstName: string,
  lastName?: string
): { givenName: string; familyName: string; displayName: string } {
  switch (type) {
    case "cc":
      return {
        givenName: `AWS Cloud Club at ${firstName}`,
        familyName: "(México)",
        displayName: `AWS Cloud Club at ${firstName} (México)`,
      };
    case "ug":
      return {
        givenName: `AWS User Group ${firstName}`,
        familyName: "(México)",
        displayName: `AWS User Group ${firstName} (México)`,
      };
    case "cb":
      return {
        givenName: firstName,
        familyName: `${lastName} (Community Builder)`,
        displayName: `${firstName} ${lastName} (Community Builder)`,
      };
    case "hero":
      return {
        givenName: firstName,
        familyName: `${lastName} (AWS Hero)`,
        displayName: `${firstName} ${lastName} (AWS Hero)`,
      };
    default:
      return {
        givenName: firstName,
        familyName: lastName || "",
        displayName: `${firstName} ${lastName || ""}`.trim(),
      };
  }
}

// Generate a random password
export function generateTempPassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

// Get authenticated Google Admin Directory API client
async function getAdminClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const adminEmail = process.env.GOOGLE_ADMIN_EMAIL;

  if (!serviceAccountEmail || !serviceAccountKey || !adminEmail) {
    throw new Error("Missing Google service account configuration");
  }

  // Decode the base64-encoded service account key
  const keyJson = JSON.parse(Buffer.from(serviceAccountKey, "base64").toString("utf-8"));

  // Create JWT client with domain-wide delegation
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: keyJson.private_key,
    scopes: [
      "https://www.googleapis.com/auth/admin.directory.user",
      "https://www.googleapis.com/auth/admin.directory.group",
      "https://www.googleapis.com/auth/admin.directory.group.member",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    subject: adminEmail, // Impersonate the admin user
  });

  return google.admin({ version: "directory_v1", auth });
}

// Add a user to a Google Group
export async function addUserToGroup(
  userEmail: string,
  groupEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminClient();

    await admin.members.insert({
      groupKey: groupEmail,
      requestBody: {
        email: userEmail,
        role: "MEMBER",
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error(`Error adding ${userEmail} to group ${groupEmail}:`, error);

    // Handle if user is already a member
    if (error && typeof error === "object" && "code" in error) {
      const googleError = error as { code: number };
      if (googleError.code === 409) {
        return { success: true }; // Already a member, consider it success
      }
    }

    return { success: false, error: "Failed to add user to group" };
  }
}

// Get group email for a community type
export function getGroupEmail(communityType: string): string | null {
  return communityGroups[communityType] || null;
}

// Create a new user in Google Workspace
export async function createGoogleWorkspaceUser(
  email: string,
  firstName: string,
  lastName: string,
  orgUnitPath?: string
): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
  const admin = await getAdminClient();
  const tempPassword = generateTempPassword();

  const createUser = async (ouPath: string) => {
    await admin.users.insert({
      requestBody: {
        primaryEmail: email,
        name: {
          givenName: firstName,
          familyName: lastName,
        },
        password: tempPassword,
        changePasswordAtNextLogin: true,
        orgUnitPath: ouPath,
      },
    });
  };

  try {
    // Try to create user with specified OU
    await createUser(orgUnitPath || "/");
    return { success: true, tempPassword };
  } catch (error: unknown) {
    console.error("Error creating Google Workspace user:", error);

    // Handle specific Google API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const googleError = error as { code: number; message?: string };

      if (googleError.code === 409) {
        return { success: false, error: "User already exists in Google Workspace" };
      }

      // If OU is invalid and we specified one, retry with root OU
      if (googleError.code === 400 && orgUnitPath && orgUnitPath !== "/") {
        console.warn(`Invalid OU path "${orgUnitPath}", retrying with root OU`);
        try {
          await createUser("/");
          return { success: true, tempPassword };
        } catch (retryError) {
          console.error("Error creating user with root OU:", retryError);
        }
      }
    }

    return { success: false, error: "Failed to create user in Google Workspace" };
  }
}

// Check if a user exists in Google Workspace
export async function checkGoogleWorkspaceUserExists(email: string): Promise<boolean> {
  try {
    const admin = await getAdminClient();
    await admin.users.get({ userKey: email });
    return true;
  } catch {
    return false;
  }
}

// Delete a user from Google Workspace
export async function deleteGoogleWorkspaceUser(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminClient();
    await admin.users.delete({ userKey: email });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting Google Workspace user:", error);

    // Handle specific errors
    if (error && typeof error === "object" && "code" in error) {
      const googleError = error as { code: number; message?: string };
      if (googleError.code === 404) {
        // User doesn't exist in Workspace - consider success for cleanup
        return { success: true };
      }
    }

    return { success: false, error: "Failed to delete user from Google Workspace" };
  }
}

// Upload a profile photo to Google Workspace
export async function uploadGoogleWorkspaceUserPhoto(
  email: string,
  imageBase64: string
): Promise<{ success: boolean; photoData?: string; error?: string }> {
  try {
    const admin = await getAdminClient();

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // Upload the photo to Google Workspace
    await admin.users.photos.update({
      userKey: email,
      requestBody: {
        photoData: base64Data,
        mimeType: "image/jpeg",
      },
    });

    // Small delay to let Google process the photo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retrieve the photo back from Google to get the processed version
    const photoResponse = await admin.users.photos.get({ userKey: email });
    if (photoResponse.data?.photoData) {
      // Convert web-safe base64 to standard base64
      const webSafeBase64 = photoResponse.data.photoData;
      const standardBase64 = webSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
      const photoData = `data:${photoResponse.data.mimeType || "image/jpeg"};base64,${standardBase64}`;
      return { success: true, photoData };
    }

    // If we can't retrieve, return success but use original image
    return { success: true, photoData: imageBase64 };
  } catch (error: unknown) {
    console.error("Error uploading Google Workspace user photo:", error);

    if (error && typeof error === "object" && "code" in error) {
      const googleError = error as { code: number; message?: string };
      if (googleError.code === 404) {
        return { success: false, error: "User not found in Google Workspace" };
      }
    }

    return { success: false, error: "Failed to upload profile photo" };
  }
}

// Get a user's profile photo URL from Google Workspace
export async function getGoogleWorkspaceUserPhoto(
  email: string
): Promise<{ success: boolean; photoUrl?: string; error?: string }> {
  try {
    const admin = await getAdminClient();
    const response = await admin.users.photos.get({ userKey: email });

    if (response.data && response.data.photoData) {
      // Convert web-safe base64 to standard base64
      const webSafeBase64 = response.data.photoData;
      const standardBase64 = webSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
      const photoUrl = `data:${response.data.mimeType || "image/jpeg"};base64,${standardBase64}`;
      return { success: true, photoUrl };
    }

    return { success: false, error: "No photo found" };
  } catch (error: unknown) {
    console.error("Error getting Google Workspace user photo:", error);

    if (error && typeof error === "object" && "code" in error) {
      const googleError = error as { code: number };
      if (googleError.code === 404) {
        return { success: false, error: "No photo found" };
      }
    }

    return { success: false, error: "Failed to get profile photo" };
  }
}

// Send confirmation email
export async function sendConfirmationEmail(
  toEmail: string,
  newEmail: string,
  tempPassword: string
): Promise<boolean> {
  try {
    const adminEmail = process.env.GOOGLE_ADMIN_EMAIL;
    if (!adminEmail) return false;

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountEmail || !serviceAccountKey) return false;

    const keyJson = JSON.parse(Buffer.from(serviceAccountKey, "base64").toString("utf-8"));

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: keyJson.private_key,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: adminEmail,
    });

    const gmail = google.gmail({ version: "v1", auth });

    const subject = "Your AWS Community MX Email Has Been Created";
    const body = `
Hello!

Your @awscommunity.mx email has been successfully created.

Email: ${newEmail}
Temporary Password: ${tempPassword}

To get started:
1. Go to https://mail.google.com
2. Sign in with ${newEmail}
3. Enter the temporary password above
4. You will be prompted to set a new password

Welcome to the AWS Community Mexico!

Best regards,
AWS Community MX Team
    `.trim();

    const message = [
      `From: ${adminEmail}`,
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      "",
      body,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
}
