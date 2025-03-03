
import { db } from "./db";

async function initDatabase() {
  try {
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
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initDatabase();
