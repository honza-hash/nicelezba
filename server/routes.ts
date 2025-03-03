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
