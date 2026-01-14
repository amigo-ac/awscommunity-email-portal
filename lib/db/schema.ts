import { pgTable, serial, varchar, timestamp, jsonb, text } from "drizzle-orm/pg-core";

// Community types for email prefixes
export const communityTypes = ["cc", "ug", "cb", "hero"] as const;
export type CommunityType = (typeof communityTypes)[number];

// Email prefixes mapping
export const emailPrefixes: Record<CommunityType, string> = {
  cc: "cc.",      // Cloud Club: cc.school@awscommunity.mx
  ug: "ug.",      // User Group: ug.city@awscommunity.mx
  cb: "cb.",      // Community Builder: cb.flastname@awscommunity.mx
  hero: "hero.",  // Hero: hero.flastname@awscommunity.mx
};

// Community type labels for UI
export const communityLabels: Record<CommunityType, string> = {
  cc: "AWS Cloud Club",
  ug: "AWS User Group",
  cb: "Community Builder",
  hero: "AWS Hero",
};

// Tokens table - one per community type
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull().unique(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Created accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  // For CB/Hero: person's first name. For CC/UG: organization/school/city name
  firstName: varchar("first_name", { length: 100 }).notNull(),
  // For CB/Hero: person's last name. For CC/UG: contact person name
  lastName: varchar("last_name", { length: 100 }),
  // Contact phone number
  phone: varchar("phone", { length: 20 }),
  // Alternative/contact email (required for all)
  alternativeEmail: varchar("alternative_email", { length: 255 }).notNull(),
  // The formatted display name in Google Workspace
  googleDisplayName: varchar("google_display_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Profile Info
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  profileImage: text("profile_image"), // Base64 encoded image data

  // Professional Info (CB/Hero only)
  company: varchar("company", { length: 100 }),
  jobTitle: varchar("job_title", { length: 100 }),

  // Social Networks
  linkedin: varchar("linkedin", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  github: varchar("github", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  youtube: varchar("youtube", { length: 255 }),
  website: varchar("website", { length: 255 }),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 50 }).notNull(),
  actorEmail: varchar("actor_email", { length: 255 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin whitelist
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for use in application
export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Admin = typeof admins.$inferSelect;
