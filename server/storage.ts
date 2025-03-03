import { users, messages, anonymousSessions, type User, type InsertUser, type Message, type InsertMessage, type AnonymousSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  getAllUsers(): Promise<User[]>;

  // Anonymous session methods
  getAnonymousSession(sessionId: string): Promise<AnonymousSession | undefined>;
  createAnonymousSession(sessionId: string): Promise<AnonymousSession>;
  getAnonymousMessages(sessionId: string): Promise<Message[]>;
  incrementAnonymousMessageCount(sessionId: string): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Anonymous session methods
  async getAnonymousSession(sessionId: string): Promise<AnonymousSession | undefined> {
    const [session] = await db.select()
      .from(anonymousSessions)
      .where(eq(anonymousSessions.sessionId, sessionId));
    return session;
  }

  async createAnonymousSession(sessionId: string): Promise<AnonymousSession> {
    const [session] = await db.insert(anonymousSessions)
      .values({ sessionId })
      .returning();
    return session;
  }

  async getAnonymousMessages(sessionId: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }

  async incrementAnonymousMessageCount(sessionId: string): Promise<void> {
    await db.update(anonymousSessions)
      .set({ messageCount: db.raw('message_count + 1') })
      .where(eq(anonymousSessions.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();