import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db"; // Import the database connection

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initDatabase() {
  try {
    // Check if tables exist
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'anonymous_sessions'
      );
    `);

    const tablesExist = tableCheck.rows[0].exists;

    if (!tablesExist) {
      console.log("Creating database tables...");

      // Create tables based on schema
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          is_pro BOOLEAN NOT NULL DEFAULT false,
          is_admin BOOLEAN NOT NULL DEFAULT false,
          message_count INTEGER NOT NULL DEFAULT 0,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS anonymous_sessions (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL UNIQUE,
          message_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          model_id TEXT NOT NULL,
          role TEXT NOT NULL,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          session_id TEXT
        );
      `);

      console.log("Database tables created successfully!");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}


(async () => {
  try {
    await initDatabase(); // Initialize database before starting the server
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try to use port 5000 first, but fall back to another port if it's in use
    let port = 5000;

    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log(`Port ${port} is in use, trying port 5001...`);
        port = 5001;
        server.listen({
          port,
          host: "0.0.0.0",
          reusePort: true,
        });
      }
    });

    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();