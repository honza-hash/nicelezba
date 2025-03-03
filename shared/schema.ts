import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPro: boolean("is_pro").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  messageCount: integer("message_count").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  modelId: text("model_id").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sessionId: text("session_id"), // For anonymous users
});

// Anonymous sessions
export const anonymousSessions = pgTable("anonymous_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages);
export const insertAnonymousSessionSchema = createInsertSchema(anonymousSessions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type AnonymousSession = typeof anonymousSessions.$inferSelect;