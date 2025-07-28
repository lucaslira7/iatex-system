import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configuração para diferentes ambientes
let db: any;
let pool: any = null;

if (process.env.SUPABASE_DATABASE_URL) {
  // Usar Supabase PostgreSQL
  console.log("🔗 Conectando ao Supabase PostgreSQL");
  pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL (Railway, Render, etc.)
  console.log("🔗 Conectando ao banco PostgreSQL");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Fallback para SQLite local
  console.log("⚠️  Nenhum banco configurado. Usando SQLite local para desenvolvimento.");
  const sqlite = new BetterSqlite3('dev.db');
  db = drizzleSQLite(sqlite, { schema });
}

export { db, pool };