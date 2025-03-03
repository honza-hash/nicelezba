import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Anonymous chat routes
  app.get("/api/anonymous/session", async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    let session = await storage.getAnonymousSession(sessionId);
    if (!session) {
      session = await storage.createAnonymousSession(sessionId);
    }

    res.json({ messageCount: session.messageCount });
  });

  app.get("/api/anonymous/messages", async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const messages = await storage.getAnonymousMessages(sessionId);
    res.json(messages);
  });

  app.post("/api/anonymous/messages", async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const session = await storage.getAnonymousSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.messageCount >= 70) {
      return res.status(403).json({ error: "Message limit reached" });
    }

    const data = insertMessageSchema.parse({
      ...req.body,
      sessionId,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const result = await model.generateContent(data.content);
      const response = result.response;
      const text = response.text();

      // Store user message
      await storage.createMessage({
        ...data,
        role: "user"
      });

      // Store AI response
      const aiMessage = await storage.createMessage({
        sessionId,
        content: text,
        modelId: data.modelId,
        role: "assistant"
      });

      await storage.incrementAnonymousMessageCount(sessionId);

      res.json(aiMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Authenticated routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getUserMessages(req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const data = insertMessageSchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const result = await model.generateContent(data.content);
      const response = result.response;
      const text = response.text();

      // Store user message
      await storage.createMessage({
        ...data,
        role: "user"
      });

      // Store AI response
      const aiMessage = await storage.createMessage({
        userId: req.user.id,
        content: text,
        modelId: data.modelId,
        role: "assistant"
      });

      res.json(aiMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const [users, messages] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllMessages(),
    ]);

    res.json({
      userCount: users.length,
      messageCount: messages.length,
      proUsers: users.filter(u => u.isPro).length,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}