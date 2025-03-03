
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon PostgreSQL
neonConfig.webSocketConstructor = ws;

// Use the provided database URL or fallback to environment variable
const databaseUrl = "postgresql://neondb_owner:npg_lhj2rnyS8NdQ@ep-red-sunset-a91km5cq-pooler.gwc.azure.neon.tech/neondb?sslmode=require";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
