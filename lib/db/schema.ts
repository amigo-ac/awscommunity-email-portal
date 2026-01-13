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
  creatorGmail: varchar("creator_gmail", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
