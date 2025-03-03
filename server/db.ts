import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (host) => `${host}`;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SeOCYi5l8EVG@ep-red-sunset-a91km5cq-pooler.gwc.azure.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });